import { useCallback, useEffect, useRef, useState } from "react";
import {
  VoiceWebSocketClient,
  float32ToPCM16Base64,
  pcm16Base64ToFloat32,
  resampleAudio,
} from "../api/voiceApi";
import type {
  VoiceConnectionState,
  VoiceSessionState,
  TranscriptMessage,
  VoiceSessionConfig,
  ServerEvent,
} from "../types";

const TARGET_SAMPLE_RATE = 24000; // OpenAI Realtime API expects 24kHz

export interface UseVoiceSessionReturn {
  // State
  connectionState: VoiceConnectionState;
  sessionState: VoiceSessionState;
  transcripts: TranscriptMessage[];
  currentToolCall: string | null;
  sessionId: string | null;
  error: string | null;

  // Audio levels for visualization
  inputLevel: number;
  outputLevel: number;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  startListening: () => Promise<void>;
  stopListening: () => void;
  interrupt: () => void;
}

export function useVoiceSession(
  config: VoiceSessionConfig = {}
): UseVoiceSessionReturn {
  // State
  const [connectionState, setConnectionState] =
    useState<VoiceConnectionState>("disconnected");
  const [sessionState, setSessionStateInternal] = useState<VoiceSessionState>("idle");
  
  // Wrapper to keep ref in sync with state
  const setSessionState = useCallback((state: VoiceSessionState) => {
    sessionStateRef.current = state;
    setSessionStateInternal(state);
  }, []);
  const [transcripts, setTranscripts] = useState<TranscriptMessage[]>([]);
  const [currentToolCall, setCurrentToolCall] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputLevel, setInputLevel] = useState(0);
  const [outputLevel, setOutputLevel] = useState(0);

  // Refs
  const wsClientRef = useRef<VoiceWebSocketClient | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const sessionStateRef = useRef<VoiceSessionState>("idle");
  const playNextAudioChunkRef = useRef<(() => void) | null>(null);

  // Handle server events
  const handleServerEvent = useCallback((event: ServerEvent) => {
    console.log("[Voice] Server event:", event.type, event);

    switch (event.type) {
      case "session.created":
        setSessionId(event.session_id);
        setConnectionState("connected");
        break;

      case "response.start":
        if (event.type === "response.start") {
          console.log("[Voice] New response started:", event.response_id);
          // A new response is starting - this means server is ready to speak
          // We should transition from listening to ready to receive audio
          if (sessionStateRef.current === "listening") {
            console.log("[Voice] Transitioning from listening to idle for new response");
            setSessionState("idle");
          }
        }
        break;

      case "audio.delta":
        // Only queue audio if we're not in listening mode (user hasn't interrupted)
        // This prevents audio from restarting after we've interrupted the CURRENT response
        if (sessionStateRef.current !== "listening") {
          const audioData = pcm16Base64ToFloat32(event.audio);
          audioQueueRef.current.push(audioData);
          playNextAudioChunkRef.current?.();
          setSessionState("speaking");
        } else {
          console.log("[Voice] Ignoring audio.delta - in listening mode");
        }
        break;

      case "transcript.user":
        console.log("[Voice] User transcript:", event.transcript);
        setTranscripts((prev) => [
          ...prev,
          {
            id: event.message_id,
            role: "user",
            content: event.transcript,
            timestamp: new Date(),
          },
        ]);
        setSessionState("processing");
        break;

      case "transcript.assistant":
        if (event.type === "transcript.assistant") {
          console.log("[Voice] Assistant transcript:", event.transcript, "is_final:", event.is_final);

          // Only add transcripts when they're final (have a message_id)
          // This prevents duplicates from is_final:false events
          if (!event.message_id) {
            console.log("[Voice] Skipping non-final transcript");
            break;
          }

          setTranscripts((prev) => {
            // Update existing or add new
            const existing = prev.find((t) => t.id === event.message_id);
            if (existing) {
              return prev.map((t) =>
                t.id === event.message_id
                  ? { ...t, content: event.transcript }
                  : t
              );
            }
            return [
              ...prev,
              {
                id: event.message_id,
                role: "assistant",
                content: event.transcript,
                timestamp: new Date(),
              },
            ];
          });
        }
        break;

      case "tool_call.start":
        setCurrentToolCall(event.tool_name);
        break;

      case "tool_call.end":
        setCurrentToolCall(null);
        break;

      case "response.end":
        console.log("[Voice] Response end");
        // Don't change state here - playback loop or interrupt handler
        // will have already set the correct state (listening or idle)
        break;

      case "session.end":
        console.log("[Voice] Session end received");
        setConnectionState("disconnected");
        setSessionState("idle");
        break;

      case "error":
        console.error("[Voice] Error event:", event.error, event);
        setError(event.error);
        // Only disconnect if error is not recoverable
        if (event.type === "error" && !event.recoverable) {
          console.log("[Voice] Non-recoverable error - disconnecting");
          setConnectionState("error");
        } else {
          console.log("[Voice] Recoverable error - staying connected");
        }
        break;
    }
  }, [setSessionState]);

  // Stop current audio playback (for barge-in)
  const stopPlayback = useCallback(() => {
    console.log("[Voice] stopPlayback called");
    // Set flag first to stop the playback loop
    isPlayingRef.current = false;

    // Stop current playing source (this will trigger onended and resolve the promise)
    const source = currentSourceRef.current;
    if (source) {
      try {
        // Stop will trigger the onended event, resolving the play promise
        source.stop();
      } catch (e) {
        // Source might not be started yet or already stopped
        // Manually trigger onended to ensure promise resolves
        if (source.onended) {
          source.onended(new Event('ended') as any);
        }
      }
      currentSourceRef.current = null;
    }

    // Clear the queue
    const queueLength = audioQueueRef.current.length;
    if (queueLength > 0) {
      console.log(`[Voice] Cleared ${queueLength} audio chunks from queue`);
    }
    audioQueueRef.current = [];
    setOutputLevel(0);
  }, []);

  // Play audio smoothly by buffering chunks and scheduling them
  const playNextAudioChunk = useCallback(async () => {
    // Don't start new playback if already playing
    if (isPlayingRef.current) {
      return;
    }

    // Wait for enough audio to buffer (reduces stuttering)
    const MIN_BUFFER_CHUNKS = 3;
    if (audioQueueRef.current.length < MIN_BUFFER_CHUNKS) {
      // Check again soon
      setTimeout(() => playNextAudioChunkRef.current?.(), 50);
      return;
    }

    isPlayingRef.current = true;

    // Create or reuse playback context
    if (!playbackContextRef.current) {
      playbackContextRef.current = new AudioContext({
        sampleRate: TARGET_SAMPLE_RATE,
      });
    }

    const ctx = playbackContextRef.current;

    // Merge all buffered chunks into one for smoother playback
    const mergeChunks = () => {
      if (audioQueueRef.current.length === 0) return null;
      
      const chunks = audioQueueRef.current.splice(0, audioQueueRef.current.length);
      const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
      const merged = new Float32Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }
      return merged;
    };

    // Create analyser for output level
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.connect(ctx.destination);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const levelInterval = setInterval(() => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setOutputLevel(average / 255);
    }, 50);

    // Keep playing while there's audio
    const playLoop = async () => {
      while (isPlayingRef.current) {
        const merged = mergeChunks();

        if (!merged || merged.length === 0) {
          // Wait for more audio or finish
          await new Promise((r) => setTimeout(r, 100));

          // Check if we were stopped while waiting
          if (!isPlayingRef.current) {
            break;
          }

          // If still no audio after waiting, we're done
          if (audioQueueRef.current.length === 0) {
            break;
          }
          continue;
        }

        const buffer = ctx.createBuffer(1, merged.length, TARGET_SAMPLE_RATE);
        buffer.getChannelData(0).set(merged);

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        currentSourceRef.current = source;
        source.connect(analyser);

        // Play this chunk and wait for it to finish
        const playPromise = new Promise<void>((resolve) => {
          source.onended = () => {
            currentSourceRef.current = null;
            resolve();
          };
          source.start();
        });

        await playPromise;

        // Check if we should continue after this chunk
        if (!isPlayingRef.current) {
          break;
        }
      }
    };

    await playLoop();

    clearInterval(levelInterval);
    setOutputLevel(0);

    // Only change state if we're still supposed to be playing
    // (not if we were interrupted via stopPlayback)
    if (isPlayingRef.current && sessionStateRef.current === "speaking") {
      setSessionState("listening");
    }
    isPlayingRef.current = false;
  }, [setSessionState]);

  // Connect to WebSocket
  const connect = useCallback(async () => {
    if (connectionState === "connected" || connectionState === "connecting") {
      return;
    }

    setConnectionState("connecting");
    setError(null);

    try {
      wsClientRef.current = new VoiceWebSocketClient(config);
      await wsClientRef.current.connect(handleServerEvent);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
      setConnectionState("error");
    }
  }, [config, connectionState, handleServerEvent]);

  // Internal stop listening function
  const stopListeningInternal = useCallback(() => {
    // Stop animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Stop worklet
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }

    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    setInputLevel(0);
  }, []);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    // Stop listening first
    stopListeningInternal();

    // Stop any ongoing playback
    stopPlayback();

    // Close WebSocket
    wsClientRef.current?.disconnect();
    wsClientRef.current = null;

    // Clear playback context
    playbackContextRef.current?.close();
    playbackContextRef.current = null;

    setConnectionState("disconnected");
    setSessionState("idle");
    setSessionId(null);
  }, [stopListeningInternal, stopPlayback, setSessionState]);

  // Start listening (microphone capture)
  const startListening = useCallback(async () => {
    if (!wsClientRef.current?.isConnected()) {
      throw new Error("Not connected to voice service");
    }

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: { ideal: TARGET_SAMPLE_RATE },
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      // Create audio context
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      // Load audio worklet
      await audioContext.audioWorklet.addModule("/audio-worklet-processor.js");

      // Create worklet node
      const workletNode = new AudioWorkletNode(
        audioContext,
        "audio-capture-processor"
      );
      workletNodeRef.current = workletNode;

      // Create analyser for input level
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      // Connect: microphone → analyser → worklet
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.connect(workletNode);
      workletNode.connect(audioContext.destination);

      // Handle audio from worklet
      workletNode.port.onmessage = (event) => {
        if (event.data.type === "audio") {
          const samples = event.data.samples as Float32Array;

          // Detect if user is speaking (check audio level)
          const maxSample = samples.reduce((max, s) => Math.max(max, Math.abs(s)), 0);
          const isSpeaking = maxSample > 0.01; // Threshold for voice detection

          // Auto barge-in: if user speaks while AI is speaking, interrupt playback
          if (isSpeaking && sessionStateRef.current === "speaking") {
            console.log("[Voice] Auto barge-in detected - interrupting");
            // Stop playback first (clears queue and stops audio)
            stopPlayback();
            // Set state to listening before sending interrupt
            setSessionState("listening");
            // Notify server about the interrupt
            wsClientRef.current?.interrupt();
          }

          // Resample if necessary
          const resampled =
            audioContext.sampleRate !== TARGET_SAMPLE_RATE
              ? resampleAudio(samples, audioContext.sampleRate, TARGET_SAMPLE_RATE)
              : samples;

          // Convert to Base64 PCM16 and send
          const base64 = float32ToPCM16Base64(resampled);
          wsClientRef.current?.sendAudio(base64);
        }
      };

      // Update input level visualization
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateInputLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average =
            dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          setInputLevel(average / 255);
          animationFrameRef.current = requestAnimationFrame(updateInputLevel);
        }
      };
      updateInputLevel();

      setSessionState("listening");
    } catch (err) {
      console.error("[Voice] Failed to start listening:", err);
      setError(
        err instanceof Error ? err.message : "Failed to access microphone"
      );
      stopListeningInternal();
    }
  }, [stopListeningInternal, stopPlayback, setSessionState]);

  // Stop listening
  const stopListening = useCallback(() => {
    stopListeningInternal();
    if (sessionState === "listening") {
      setSessionState("idle");
    }
  }, [stopListeningInternal, sessionState]);

  // Interrupt assistant speech (used internally for barge-in)
  const interrupt = useCallback(() => {
    console.log("[Voice] Interrupt called - stopping playback and notifying server");
    stopPlayback();
    setSessionState("listening");
    wsClientRef.current?.interrupt();
  }, [stopPlayback, setSessionState]);

  // Keep ref in sync with callback
  useEffect(() => {
    playNextAudioChunkRef.current = playNextAudioChunk;
  }, [playNextAudioChunk]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connectionState,
    sessionState,
    transcripts,
    currentToolCall,
    sessionId,
    error,
    inputLevel,
    outputLevel,
    connect,
    disconnect,
    startListening,
    stopListening,
    interrupt,
  };
}


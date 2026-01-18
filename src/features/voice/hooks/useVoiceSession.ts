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

  // Handle server events
  const handleServerEvent = useCallback((event: ServerEvent) => {
    switch (event.type) {
      case "session.created":
        setSessionId(event.session_id);
        setConnectionState("connected");
        break;

      case "audio.delta":
        // Queue audio for playback
        const audioData = pcm16Base64ToFloat32(event.audio);
        audioQueueRef.current.push(audioData);
        playNextAudioChunk();
        setSessionState("speaking");
        break;

      case "transcript.user":
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
        break;

      case "tool_call.start":
        setCurrentToolCall(event.tool_name);
        break;

      case "tool_call.end":
        setCurrentToolCall(null);
        break;

      case "response.end":
        setSessionState("idle");
        break;

      case "session.end":
        setConnectionState("disconnected");
        setSessionState("idle");
        break;

      case "error":
        setError(event.error);
        setConnectionState("error");
        break;
    }
  }, []);

  // Stop current audio playback (for barge-in)
  const stopPlayback = useCallback(() => {
    // Stop current playing source
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch {
        // Already stopped
      }
      currentSourceRef.current = null;
    }
    // Clear the queue
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    setOutputLevel(0);
  }, []);

  // Play audio smoothly by buffering chunks and scheduling them
  const playNextAudioChunk = useCallback(async () => {
    if (isPlayingRef.current) {
      return;
    }

    // Wait for enough audio to buffer (reduces stuttering)
    const MIN_BUFFER_CHUNKS = 3;
    if (audioQueueRef.current.length < MIN_BUFFER_CHUNKS) {
      // Check again soon
      setTimeout(() => playNextAudioChunk(), 50);
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

        await new Promise<void>((resolve) => {
          source.onended = () => {
            currentSourceRef.current = null;
            resolve();
          };
          source.start();
        });
      }
    };

    await playLoop();

    clearInterval(levelInterval);
    setOutputLevel(0);
    isPlayingRef.current = false;
    
    if (sessionStateRef.current === "speaking") {
      setSessionState("listening");
    }
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

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    // Stop listening first
    stopListeningInternal();

    // Close WebSocket
    wsClientRef.current?.disconnect();
    wsClientRef.current = null;

    // Clear playback
    audioQueueRef.current = [];
    playbackContextRef.current?.close();
    playbackContextRef.current = null;

    setConnectionState("disconnected");
    setSessionState("idle");
    setSessionId(null);
  }, []);

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
            stopPlayback();
            wsClientRef.current?.interrupt();
            setSessionState("listening");
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
    stopPlayback();
    wsClientRef.current?.interrupt();
    setSessionState("listening");
  }, [stopPlayback, setSessionState]);

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


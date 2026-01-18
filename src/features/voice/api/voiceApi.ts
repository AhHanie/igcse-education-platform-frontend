import type { ClientEvent, ServerEvent, VoiceSessionConfig } from "../types";

const WS_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "")
  .replace(/^http/, "ws")
  .replace(/\/+$/, "");

export type VoiceEventHandler = (event: ServerEvent) => void;

export class VoiceWebSocketClient {
  private ws: WebSocket | null = null;
  private eventHandler: VoiceEventHandler | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private config: VoiceSessionConfig;

  constructor(config: VoiceSessionConfig = {}) {
    this.config = config;
  }

  connect(onEvent: VoiceEventHandler): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      this.eventHandler = onEvent;

      // Build WebSocket URL with query params
      const params = new URLSearchParams();
      if (this.config.subjectId) {
        params.set("subject_id", this.config.subjectId);
      }
      if (this.config.voice) {
        params.set("voice", this.config.voice);
      }

      const queryString = params.toString();
      const wsUrl = `${WS_BASE_URL}/voice${queryString ? `?${queryString}` : ""}`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        resolve();
      };

      this.ws.onerror = (error) => {
        console.error("[Voice WS] Connection error:", error);
        reject(new Error("WebSocket connection failed"));
      };

      this.ws.onclose = (event) => {
        console.log("[Voice WS] Connection closed:", event.code, event.reason);
        if (this.eventHandler) {
          this.eventHandler({
            type: "session.end",
            duration_seconds: 0,
          });
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as ServerEvent;
          this.eventHandler?.(data);
        } catch (e) {
          console.error("[Voice WS] Failed to parse message:", e);
        }
      };
    });
  }

  send(event: ClientEvent): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event));
    } else {
      console.warn("[Voice WS] Cannot send, WebSocket not open");
    }
  }

  sendAudio(base64Audio: string): void {
    this.send({ type: "audio", audio: base64Audio });
  }

  commit(): void {
    this.send({ type: "commit" });
  }

  cancel(): void {
    this.send({ type: "cancel" });
  }

  interrupt(): void {
    this.send({ type: "interrupt" });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, "Client disconnect");
      this.ws = null;
    }
    this.eventHandler = null;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// === Audio Utilities ===

/**
 * Convert Float32Array audio samples to Base64-encoded PCM16
 */
export function float32ToPCM16Base64(float32Array: Float32Array): string {
  const pcm16 = new Int16Array(float32Array.length);

  for (let i = 0; i < float32Array.length; i++) {
    // Clamp and convert to 16-bit signed integer
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }

  // Convert to Base64
  const bytes = new Uint8Array(pcm16.buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert Base64-encoded PCM16 to Float32Array for playback
 */
export function pcm16Base64ToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const pcm16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(pcm16.length);

  for (let i = 0; i < pcm16.length; i++) {
    float32[i] = pcm16[i] / (pcm16[i] < 0 ? 0x8000 : 0x7fff);
  }

  return float32;
}

/**
 * Resample audio from source sample rate to target sample rate
 */
export function resampleAudio(
  input: Float32Array,
  sourceSampleRate: number,
  targetSampleRate: number
): Float32Array {
  if (sourceSampleRate === targetSampleRate) {
    return input;
  }

  const ratio = sourceSampleRate / targetSampleRate;
  const outputLength = Math.floor(input.length / ratio);
  const output = new Float32Array(outputLength);

  for (let i = 0; i < outputLength; i++) {
    const srcIndex = i * ratio;
    const srcIndexFloor = Math.floor(srcIndex);
    const srcIndexCeil = Math.min(srcIndexFloor + 1, input.length - 1);
    const fraction = srcIndex - srcIndexFloor;

    // Linear interpolation
    output[i] = input[srcIndexFloor] * (1 - fraction) + input[srcIndexCeil] * fraction;
  }

  return output;
}


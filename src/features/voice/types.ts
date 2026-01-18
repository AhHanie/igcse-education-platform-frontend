// Voice session types matching backend WebSocket protocol

// === Client → Server Events ===
export interface AudioEvent {
  type: "audio";
  audio: string; // Base64 encoded PCM16
}

export interface CommitEvent {
  type: "commit";
}

export interface CancelEvent {
  type: "cancel";
}

export interface InterruptEvent {
  type: "interrupt";
}

export type ClientEvent = AudioEvent | CommitEvent | CancelEvent | InterruptEvent;

// === Server → Client Events ===
export interface SessionCreatedEvent {
  type: "session.created";
  session_id: string;
  voice: string;
}

export interface AudioDeltaEvent {
  type: "audio.delta";
  audio: string; // Base64 encoded PCM16
}

export interface TranscriptUserEvent {
  type: "transcript.user";
  transcript: string;
  message_id: string;
}

export interface TranscriptAssistantEvent {
  type: "transcript.assistant";
  transcript: string;
  message_id: string;
}

export interface ToolCallStartEvent {
  type: "tool_call.start";
  tool_name: string;
  call_id: string;
}

export interface ToolCallEndEvent {
  type: "tool_call.end";
  tool_name: string;
  call_id: string;
  result?: unknown;
}

export interface ResponseEndEvent {
  type: "response.end";
  message_id: string;
  total_tokens: number;
}

export interface SessionEndEvent {
  type: "session.end";
  duration_seconds: number;
}

export interface ErrorEvent {
  type: "error";
  error: string;
  code?: string;
}

export type ServerEvent =
  | SessionCreatedEvent
  | AudioDeltaEvent
  | TranscriptUserEvent
  | TranscriptAssistantEvent
  | ToolCallStartEvent
  | ToolCallEndEvent
  | ResponseEndEvent
  | SessionEndEvent
  | ErrorEvent;

// === Voice Session State ===
export type VoiceConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

export type VoiceSessionState =
  | "idle"
  | "listening"
  | "processing"
  | "speaking";

export interface TranscriptMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface VoiceSessionConfig {
  subjectId?: string;
  voice?: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
}


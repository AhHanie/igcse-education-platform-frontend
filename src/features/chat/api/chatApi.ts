import { buildUrl } from "@/app/api/client";

export interface StreamEvent {
  type: "session" | "chunk" | "done" | "error" | "tool_call";
}

export interface StreamSessionEvent extends StreamEvent {
  type: "session";
  session_id: string;
}

export interface StreamChunkEvent extends StreamEvent {
  type: "chunk";
  content: string;
}

export interface StreamDoneEvent extends StreamEvent {
  type: "done";
  message_id: string;
  model: string | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  total_tokens: number | null;
  tool_calls: unknown[];
}

export interface StreamErrorEvent extends StreamEvent {
  type: "error";
  error: string;
  code?: string;
}

export interface StreamToolCallEvent extends StreamEvent {
  type: "tool_call";
  tool_name: string;
  tool_input: unknown;
}

export type StreamEventTypes =
  | StreamSessionEvent
  | StreamChunkEvent
  | StreamDoneEvent
  | StreamErrorEvent
  | StreamToolCallEvent;

export interface CreateSessionRequest {
  subject_id: string | null;
  topic_id: string | null;
  feature: string;
  message: string;
}

export interface SendMessageRequest {
  message: string;
}

/**
 * Creates a new chat session and streams the initial AI response.
 * @param request - Session creation request with initial message
 * @param onEvent - Callback for each SSE event
 * @param signal - Optional AbortSignal to cancel the request
 */
export async function createChatSession(
  request: CreateSessionRequest,
  onEvent: (event: StreamEventTypes) => void,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch(buildUrl("/chat/sessions"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(request),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to create session: ${response.statusText}`);
  }

  await processSSEStream(response, onEvent);
}

/**
 * Sends a message to an existing chat session and streams the AI response.
 * @param sessionId - The chat session ID
 * @param request - Message request
 * @param onEvent - Callback for each SSE event
 * @param signal - Optional AbortSignal to cancel the request
 */
export async function sendChatMessage(
  sessionId: string,
  request: SendMessageRequest,
  onEvent: (event: StreamEventTypes) => void,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch(buildUrl(`/chat/sessions/${sessionId}/messages`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(request),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to send message: ${response.statusText}`);
  }

  await processSSEStream(response, onEvent);
}

/**
 * Processes a Server-Sent Events stream and invokes callback for each event.
 */
async function processSSEStream(
  response: Response,
  onEvent: (event: StreamEventTypes) => void
): Promise<void> {
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error("Response body is not readable");
  }

  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE messages (format: "data: {...}\n\n")
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || ""; // Keep incomplete message in buffer

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const jsonStr = line.slice(6); // Remove "data: " prefix
          try {
            const event = JSON.parse(jsonStr) as StreamEventTypes;
            onEvent(event);
          } catch (e) {
            console.error("Failed to parse SSE event:", jsonStr, e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

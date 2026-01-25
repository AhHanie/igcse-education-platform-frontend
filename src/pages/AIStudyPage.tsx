import React, { useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import "@/assets/css/studypage.css";
import ChatInput from "@/features/chat/components/ChatInput";
import type { VoiceState } from "@/features/chat/components/ChatInput";
import Message from "@/features/chat/components/Message";
import type { MessageData } from "@/features/chat/components/Message";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@/components/ui/dropdown";
import { ChevronDown } from "lucide-react";
import {
  createChatSession,
  sendChatMessage,
} from "@/features/chat/api/chatApi";
import type { StreamEventTypes } from "@/features/chat/api/chatApi";
import { useVoiceSession } from "@/features/voice";

type ModeType = "explain" | "solve" | "quiz" | "simplify" | "summarize";

export interface DropdownOption {
  id: number | string;
  subjectName: string;
  icon?: string;
}

const subjectList: DropdownOption[] = [
  { id: 1, subjectName: "All", icon: "✨" },
  { id: 2, subjectName: "Biology", icon: "🧬" },
  { id: 3, subjectName: "Chemistry", icon: "⚗️" },
  { id: 4, subjectName: "Physics", icon: "⚡" },
  { id: 5, subjectName: "Mathematics", icon: "📐" },
  { id: 6, subjectName: "English", icon: "📚" },
  { id: 7, subjectName: "History", icon: "🏛️" },
  { id: 8, subjectName: "Geography", icon: "🌍" },
  { id: 9, subjectName: "Economics", icon: "📊" },
];

const AIStudyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const toolId = searchParams.get("toolId") || "routing_disabled";

  const [currentSubject, setCurrentSubject] =
    React.useState<DropdownOption | null>(subjectList[0]);
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<MessageData[]>([]);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [_, setCurrentStreamingMessageId] = React.useState<string | null>(null);
  const chatAreaRef = React.useRef<HTMLDivElement>(null);
  const hasAutoStartedRef = useRef(false);

  // Voice session
  const {
    connectionState: voiceConnectionState,
    sessionState: voiceSessionState,
    transcripts,
    connect: voiceConnect,
    disconnect: voiceDisconnect,
    startListening,
    stopListening,
  } = useVoiceSession({
    voice: "shimmer",
    feature: currentSubject?.subjectName === "All" ? toolId : `${toolId}_rag`,
    subjectId: undefined, // TODO: Map subject name to UUID when subject context is needed
  });

  // Map connection state to VoiceState type
  const voiceState: VoiceState =
    voiceConnectionState === "connected"
      ? "connected"
      : voiceConnectionState === "connecting"
        ? "connecting"
        : "disconnected";

  // Add voice transcripts to messages
  useEffect(() => {
    if (transcripts.length === 0) return;

    // Convert transcripts to messages
    const voiceMessages: MessageData[] = transcripts.map((t) => ({
      id: t.id,
      sender_type: t.role === "user" ? "user" : "assistant",
      content: t.content,
      timestamp: t.timestamp,
      isVoice: true,
    }));

    // Merge with existing non-voice messages
    setMessages((prev) => {
      const nonVoiceMessages = prev.filter((m) => !m.isVoice);
      return [...nonVoiceMessages, ...voiceMessages];
    });
  }, [transcripts]);

  // Auto-start listening when voice connects
  useEffect(() => {
    if (voiceConnectionState === "connected" && !hasAutoStartedRef.current) {
      hasAutoStartedRef.current = true;
      startListening();
    }
    if (voiceConnectionState === "disconnected") {
      hasAutoStartedRef.current = false;
    }
  }, [voiceConnectionState, startListening]);

  const askQuestion = (question: string) => {
    handleSend(question, "explain");
  };

  const handleSelect = (option: DropdownOption) => {
    setCurrentSubject(option);
  };

  // Auto-scroll to bottom when messages change
  React.useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (message: string, mode: ModeType) => {
    if (!message.trim() || isStreaming) return;

    // Add user message to chat
    const userMessage: MessageData = {
      id: `user-${Date.now()}`,
      sender_type: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);

    // Create placeholder for assistant message
    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: MessageData = {
      id: assistantMessageId,
      sender_type: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setCurrentStreamingMessageId(assistantMessageId);

    try {
      const handleStreamEvent = (event: StreamEventTypes) => {
        switch (event.type) {
          case "session":
            setSessionId(event.session_id);
            break;

          case "chunk":
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: msg.content + event.content }
                  : msg
              )
            );
            break;

          case "done":
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, isStreaming: false }
                  : msg
              )
            );
            setIsStreaming(false);
            setCurrentStreamingMessageId(null);
            break;

          case "error":
            console.error("Stream error:", event.error);
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      content: `Error: ${event.error}`,
                      isStreaming: false,
                    }
                  : msg
              )
            );
            setIsStreaming(false);
            setCurrentStreamingMessageId(null);
            break;
        }
      };

      if (!sessionId) {
        // Create new session with first message
        await createChatSession(
          {
            subject_id: null,
            topic_id: null,
            feature:
              currentSubject?.subjectName === "All" ? toolId : `${toolId}_rag`,
            message,
          },
          handleStreamEvent
        );
      } else {
        // Send message to existing session
        await sendChatMessage(sessionId, { message }, handleStreamEvent);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: "Failed to send message. Please try again.",
                isStreaming: false,
              }
            : msg
        )
      );
      setIsStreaming(false);
      setCurrentStreamingMessageId(null);
    }
  };

  const handleStartCall = useCallback(async () => {
    await voiceConnect();
  }, [voiceConnect]);

  const handleEndCall = useCallback(() => {
    stopListening();
    voiceDisconnect();
  }, [stopListening, voiceDisconnect]);

  const isInCall = voiceState === "connected";

  return (
    <div className="h-full flex flex-col">
      <div className="header-right flex-shrink-0">
        <div className="w-[165px]">
          <Dropdown>
            <DropdownTrigger className="flex items-center gap-2 w-full px-3 py-2 text-sm border rounded-md bg-background hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring">
              <span className="text-base">{currentSubject?.icon}</span>
              <span className="flex-1 text-left">
                {currentSubject?.subjectName}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </DropdownTrigger>
            <DropdownContent align="start" className="w-[165px]">
              {subjectList.map((subject) => (
                <DropdownItem
                  key={subject.id}
                  onClick={() => handleSelect(subject)}
                  className="flex items-center gap-2"
                >
                  <span className="text-base">{subject.icon}</span>
                  <span>{subject.subjectName}</span>
                </DropdownItem>
              ))}
            </DropdownContent>
          </Dropdown>
        </div>
      </div>
      <div className="chat-area flex-1 flex flex-col" id="chatArea">
        <div
          ref={chatAreaRef}
          className="flex-1 overflow-y-auto px-4 py-6"
          style={{ scrollBehavior: "smooth" }}
        >
          {messages.length === 0 && !isInCall ? (
            <div className="welcome-message" id="welcomeMessage">
              <div className="welcome-icon">🤖</div>

              <h2>Hi! I'm your IGCSE Study Companion</h2>

              <p>
                Ask me anything about your IGCSE subjects. I'll explain
                concepts, solve problems step-by-step, and help you prepare for
                exams.
              </p>

              <div className="quick-actions">
                <button
                  className="quick-action"
                  onClick={() =>
                    askQuestion("Explain photosynthesis step by step")
                  }
                >
                  🌱 Explain photosynthesis
                </button>
                <button
                  className="quick-action"
                  onClick={() =>
                    askQuestion(
                      "What is the quadratic formula and when do I use it?"
                    )
                  }
                >
                  📐 Quadratic formula
                </button>
                <button
                  className="quick-action"
                  onClick={() =>
                    askQuestion(
                      "Explain Newton's 3 laws of motion with examples"
                    )
                  }
                >
                  ⚡ Newton's laws
                </button>

                <button
                  className="quick-action"
                  onClick={() =>
                    askQuestion("How do I balance chemical equations?")
                  }
                >
                  ⚗️ Balance equations
                </button>
              </div>
            </div>
          ) : messages.length === 0 && isInCall ? (
            <div className="welcome-message" id="welcomeMessage">
              <div className="welcome-icon">🎙️</div>
              <h2>Voice Mode Active</h2>
              <p>
                Just speak naturally and I'll respond. Start talking to interrupt me anytime.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((msg) => (
                <Message key={msg.id} message={msg} />
              ))}
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          <ChatInput
            onSend={handleSend}
            disabled={isStreaming || isInCall}
            voiceState={voiceState}
            voiceSessionState={voiceSessionState}
            onStartCall={handleStartCall}
            onEndCall={handleEndCall}
          />
        </div>
      </div>
    </div>
  );
};

export default AIStudyPage;

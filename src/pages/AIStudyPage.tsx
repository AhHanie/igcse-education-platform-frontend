import React, { useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import "@/assets/css/studypage.css";
import ChatInput from "@/features/chat/components/ChatInput";
import type { VoiceState } from "@/features/chat/components/ChatInput";
import Message from "@/features/chat/components/Message";
import type { MessageData } from "@/features/chat/components/Message";
import { BookOpen, Lightbulb, Calculator, FlaskConical, Mic } from "lucide-react";
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
  { id: 1, subjectName: "All Subjects", icon: "✨" },
  { id: 2, subjectName: "Biology", icon: "🧬" },
  { id: 3, subjectName: "Chemistry", icon: "⚗️" },
  { id: 4, subjectName: "Physics", icon: "⚡" },
  { id: 5, subjectName: "Mathematics", icon: "📐" },
  { id: 6, subjectName: "English", icon: "📚" },
  { id: 7, subjectName: "History", icon: "🏛️" },
  { id: 8, subjectName: "Geography", icon: "🌍" },
  { id: 9, subjectName: "Economics", icon: "📊" },
];

const quickActions = [
  {
    icon: Lightbulb,
    label: "Explain photosynthesis",
    prompt: "Explain photosynthesis step by step",
  },
  {
    icon: Calculator,
    label: "Quadratic formula",
    prompt: "What is the quadratic formula and when do I use it?",
  },
  {
    icon: FlaskConical,
    label: "Newton's laws",
    prompt: "Explain Newton's 3 laws of motion with examples",
  },
  {
    icon: BookOpen,
    label: "Balance equations",
    prompt: "How do I balance chemical equations?",
  },
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
    feature: currentSubject?.subjectName === "All Subjects" ? toolId : `${toolId}_rag`,
    subjectId: undefined,
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

    const voiceMessages: MessageData[] = transcripts.map((t) => ({
      id: t.id,
      sender_type: t.role === "user" ? "user" : "assistant",
      content: t.content,
      timestamp: t.timestamp,
      isVoice: true,
    }));

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

  const handleSend = async (message: string, _mode: ModeType) => {
    if (!message.trim() || isStreaming) return;

    // Generate unique IDs with a small delay to ensure ordering
    const baseTime = Date.now();
    const userMessageId = `user-${baseTime}-${Math.random().toString(36).substr(2, 9)}`;
    const assistantMessageId = `assistant-${baseTime + 1}-${Math.random().toString(36).substr(2, 9)}`;

    const userMessage: MessageData = {
      id: userMessageId,
      sender_type: "user",
      content: message,
      timestamp: new Date(),
    };

    const assistantMessage: MessageData = {
      id: assistantMessageId,
      sender_type: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };

    // Add both messages in a single update to ensure correct order
    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsStreaming(true);
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
        await createChatSession(
          {
            subject_id: null,
            topic_id: null,
            feature:
              currentSubject?.subjectName === "All Subjects" ? toolId : `${toolId}_rag`,
            message,
          },
          handleStreamEvent
        );
      } else {
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
    <div className="ai-study-container h-full flex flex-col bg-background">
      {/* Chat area */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        <div
          ref={chatAreaRef}
          className="flex-1 overflow-y-auto pb-24"
          style={{ scrollBehavior: "smooth" }}
        >
          {messages.length === 0 && !isInCall ? (
            /* Welcome screen */
            <div className="h-full flex items-center justify-center px-4 py-12">
              <div className="max-w-xl mx-auto text-center">
                {/* Title */}
                <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-3 tracking-tight">
                  How can I help you today?
                </h1>

                {/* Subtitle */}
                <p className="text-muted-foreground text-base mb-10 max-w-md mx-auto leading-relaxed">
                  I'm your IGCSE study companion. Ask me anything about your subjects.
                </p>

                {/* Quick actions */}
                <div className="grid grid-cols-2 gap-2.5 max-w-lg mx-auto">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => askQuestion(action.prompt)}
                      className="flex items-center gap-2.5 p-3 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/60 text-left transition-all group"
                    >
                      <div className="p-1.5 rounded-lg bg-muted/80 text-muted-foreground group-hover:text-foreground transition-colors">
                        <action.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : messages.length === 0 && isInCall ? (
            /* Voice mode active screen */
            <div className="h-full flex items-center justify-center px-4">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/20 animate-pulse">
                  <Mic className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Voice Mode Active</h2>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Just speak naturally and I'll respond. Start talking to interrupt me anytime.
                </p>
              </div>
            </div>
          ) : (
            /* Messages */
            <div className="min-h-full py-4 flex flex-col items-center">
              <div className="w-full max-w-3xl">
                {messages
                  .sort((a, b) => {
                    // Sort by timestamp to ensure correct order
                    const timeA = a.timestamp?.getTime() || 0;
                    const timeB = b.timestamp?.getTime() || 0;
                    return timeA - timeB;
                  })
                  .map((msg) => (
                    <Message key={msg.id} message={msg} />
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Input area */}
        <div className="sticky bottom-0 z-20 bg-background pt-2 pb-4">
          <div className="max-w-3xl mx-auto px-4 md:px-6">
            <ChatInput
              onSend={handleSend}
              disabled={isStreaming || isInCall}
              voiceState={voiceState}
              voiceSessionState={voiceSessionState}
              onStartCall={handleStartCall}
              onEndCall={handleEndCall}
              currentSubject={currentSubject}
              subjectList={subjectList}
              onSubjectSelect={handleSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIStudyPage;

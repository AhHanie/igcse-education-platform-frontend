import React, { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ChangeEvent } from "react";
import { Phone, PhoneOff, Loader2, Mic } from "lucide-react";
import "@/assets/css/studypage.css";
import { cn } from "@/lib/utils";

type ModeType = "explain" | "solve" | "quiz" | "simplify" | "summarize";

export type VoiceState = "disconnected" | "connecting" | "connected";

interface ChatInputProps {
  onSend: (message: string, mode: ModeType) => void;
  disabled?: boolean;
  // Voice props
  voiceState?: VoiceState;
  voiceSessionState?: string;
  onStartCall?: () => void;
  onEndCall?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  voiceState = "disconnected",
  voiceSessionState = "idle",
  onStartCall,
  onEndCall,
}) => {
  const [mode, setMode] = useState<ModeType>("explain");
  const [message, setMessage] = useState("");
  const [isTall, setIsTall] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const isInCall = voiceState === "connected";

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries) => {
      const height = entries[0].contentRect.height;
      setIsTall(height > 100);
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = () => {
    if (!message.trim() || disabled) return;
    onSend(message, mode);
    setMessage("");
  };

  const autoResize = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
    setMessage(textarea.value);
  };

  const handleCallToggle = () => {
    if (isInCall) {
      onEndCall?.();
    } else {
      onStartCall?.();
    }
  };

  const getVoiceStatusText = () => {
    if (voiceState === "connecting") return "Connecting...";
    if (voiceSessionState === "listening") return "Listening...";
    if (voiceSessionState === "processing") return "Thinking...";
    if (voiceSessionState === "speaking") return "Speaking...";
    return "In call";
  };

  return (
    <div className="input-area">
      {/* Input */}
      <div className="input-container">
        <div
          ref={ref}
          className={`${isTall ? "input-wrapper2" : "input-wrapper"}`}
        >
          {/* Call button on the left */}
          <button
            type="button"
            onClick={handleCallToggle}
            disabled={voiceState === "connecting"}
            className={cn(
              "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all",
              isInCall
                ? "bg-destructive text-white hover:bg-destructive/90"
                : voiceState === "connecting"
                  ? "bg-amber-500 text-white"
                  : "bg-emerald-500 text-white hover:bg-emerald-600"
            )}
            title={isInCall ? "End call" : "Start voice call"}
          >
            {voiceState === "connecting" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isInCall ? (
              <PhoneOff className="w-5 h-5" />
            ) : (
              <Phone className="w-5 h-5" />
            )}
          </button>

          {/* Show voice status or textarea */}
          {isInCall ? (
            <div className="flex-1 flex items-center justify-center gap-3 py-2">
              <div
                className={cn(
                  "w-3 h-3 rounded-full animate-pulse",
                  voiceSessionState === "listening"
                    ? "bg-emerald-500"
                    : voiceSessionState === "processing"
                      ? "bg-amber-500"
                      : voiceSessionState === "speaking"
                        ? "bg-violet-500"
                        : "bg-emerald-500"
                )}
              />
              <span className="text-sm text-muted-foreground">
                {getVoiceStatusText()}
              </span>
              {voiceSessionState === "listening" && (
                <Mic className="w-4 h-4 text-emerald-500 animate-pulse" />
              )}
            </div>
          ) : (
            <>
              <textarea
                placeholder="Ask me anything about IGCSE..."
                rows={1}
                value={message}
                onChange={autoResize}
                onKeyDown={handleKeyDown}
                disabled={disabled}
              />
              <button
                className="send-btn"
                onClick={sendMessage}
                disabled={disabled}
              >
                ➤
              </button>
            </>
          )}
        </div>
      </div>

      <div className="input-hint">
        {isInCall
          ? "Speak naturally • Just start talking to interrupt"
          : "Press Enter to send • Shift+Enter for new line"}
      </div>
    </div>
  );
};

export default ChatInput;

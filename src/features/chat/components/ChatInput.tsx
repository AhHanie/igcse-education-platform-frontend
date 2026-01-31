import React, { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ChangeEvent } from "react";
import { Plus, AudioLines, PhoneOff, Loader2, Send, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@/components/ui/dropdown";

type ModeType = "explain" | "solve" | "quiz" | "simplify" | "summarize";

export type VoiceState = "disconnected" | "connecting" | "connected";

export interface DropdownOption {
  id: number | string;
  subjectName: string;
  icon?: string;
}

interface ChatInputProps {
  onSend: (message: string, mode: ModeType) => void;
  disabled?: boolean;
  // Voice props
  voiceState?: VoiceState;
  voiceSessionState?: string;
  onStartCall?: () => void;
  onEndCall?: () => void;
  // Subject dropdown props
  currentSubject?: DropdownOption | null;
  subjectList?: DropdownOption[];
  onSubjectSelect?: (subject: DropdownOption) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  voiceState = "disconnected",
  voiceSessionState = "idle",
  onStartCall,
  onEndCall,
  currentSubject,
  subjectList = [],
  onSubjectSelect,
}) => {
  const [mode] = useState<ModeType>("explain");
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isInCall = voiceState === "connected";

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

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
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
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
    return "Voice active";
  };

  // Voice call active UI
  if (isInCall) {
    return (
      <div className="w-full">
        <div className="relative flex items-center gap-3 px-4 py-3 bg-muted/80 dark:bg-muted/40 border border-border/50 rounded-full shadow-sm">
          {/* Voice status indicator */}
          <div className="flex items-center gap-3 flex-1">
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
            <span className="text-sm text-muted-foreground font-medium">
              {getVoiceStatusText()}
            </span>
            {voiceSessionState === "listening" && (
              <AudioLines className="w-4 h-4 text-emerald-500 animate-pulse" />
            )}
          </div>

          {/* End call button */}
          <button
            type="button"
            onClick={handleCallToggle}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive text-white hover:bg-destructive/90 transition-colors"
            title="End call"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-3">
          Speak naturally • Just start talking to interrupt
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className={cn(
          "relative flex items-center justify-center gap-2 px-3 py-2",
          "bg-muted/60 dark:bg-muted/30",
          "border border-border/50",
          "rounded-2xl",
          "shadow-sm",
          "transition-all duration-200",
          "focus-within:border-border focus-within:shadow-md"
        )}
      >
        {/* Plus button */}
        <button
          type="button"
          className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Add attachment"
        >
          <Plus className="w-5 h-5" />
        </button>

        {/* Textarea */}
        <div className="flex-1 min-w-0 flex items-center">
          <textarea
            ref={textareaRef}
            placeholder="Ask anything..."
            rows={1}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className={cn(
              "w-full resize-none bg-transparent border-none outline-none",
              "text-[15px] text-left text-foreground placeholder:text-muted-foreground/70",
              "py-2 px-1",
              "max-h-[150px]",
              "leading-relaxed"
            )}
          />
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Subject dropdown */}
          {subjectList.length > 0 && currentSubject && onSubjectSelect && (
            <Dropdown>
              <DropdownTrigger className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 text-sm rounded-lg bg-muted/30 hover:bg-muted/50 focus:outline-none transition-colors">
                <span className="text-sm">{currentSubject.icon}</span>
                <span className="font-medium text-foreground/90 text-xs">
                  {currentSubject.subjectName}
                </span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </DropdownTrigger>
              <DropdownContent align="end" className="w-[180px]">
                {subjectList.map((subject) => (
                  <DropdownItem
                    key={subject.id}
                    onClick={() => onSubjectSelect(subject)}
                    className="flex items-center gap-2"
                  >
                    <span className="text-sm">{subject.icon}</span>
                    <span>{subject.subjectName}</span>
                  </DropdownItem>
                ))}
              </DropdownContent>
            </Dropdown>
          )}

          {/* Audio wave icon - starts call */}
          {!message.trim() && (
            <button
              type="button"
              onClick={handleCallToggle}
              disabled={voiceState === "connecting"}
              className={cn(
                "w-9 h-9 flex items-center justify-center rounded-full transition-colors",
                voiceState === "connecting"
                  ? "text-amber-500"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              title="Start voice call"
            >
              {voiceState === "connecting" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <AudioLines className="w-5 h-5" />
              )}
            </button>
          )}

          {/* Send button */}
          {message.trim() && (
            <button
              type="button"
              onClick={sendMessage}
              disabled={disabled}
              className={cn(
                "w-9 h-9 flex items-center justify-center rounded-full transition-all",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInput;

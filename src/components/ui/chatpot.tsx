import React, { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ChangeEvent } from "react";
import "../../assets/css/Ai-Chatpot.css"

type ModeType = "explain" | "solve" | "quiz" | "simplify" | "summarize";

interface ChatInputProps {
  onSend: (message: string, mode: ModeType) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
  const [mode, setMode] = useState<ModeType>("explain");
  const [message, setMessage] = useState("");
  const [isTall, setIsTall] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
    if (!message.trim()) return;
    onSend(message, mode);
    setMessage("");
  };

  const autoResize = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
    setMessage(textarea.value);
  };

  return (
    <div className="input-area">
      {/* Feature Pills */}
      <div className="feature-pills">
        {[
          { key: "explain", label: "💡 Explain" },
          { key: "solve", label: "🧮 Solve Step-by-Step" },
          { key: "quiz", label: "📝 Quiz Me" },
          { key: "simplify", label: "🎯 Simplify" },
          { key: "summarize", label: "📋 Summarize" },
        ].map((item) => (
          <button
            key={item.key}
            className={`feature-pill ${mode === item.key ? "active" : ""}`}
            onClick={() => setMode(item.key as ModeType)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="input-container">
        <div ref={ref} className={`${isTall ? "input-wrapper2" : "input-wrapper"}`}>
          <textarea
            placeholder="Ask me anything about IGCSE..."
            rows={1}
            value={message}
            onChange={autoResize}
            onKeyDown={handleKeyDown}
          />
          <button className="send-btn" onClick={sendMessage}>
            ➤
          </button>
        </div>
      </div>

      <div className="input-hint">
        Press Enter to send • Shift+Enter for new line
      </div>
    </div>
  );
};

export default ChatInput;

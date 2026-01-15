import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Heading, InlineCode, Blockquote } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export interface MessageData {
  id: string;
  sender_type: "user" | "assistant";
  content: string;
  timestamp?: Date;
  isStreaming?: boolean;
}

interface MessageProps {
  message: MessageData;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.sender_type === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300`}
    >
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        }`}
      >
        <div className="flex items-start gap-2">
          {!isUser && (
            <span className="text-xl flex-shrink-0 mt-0.5">🤖</span>
          )}
          <div className="flex-1 min-w-0">
            <div
              className="text-sm break-words"
              style={{
                wordBreak: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {message.content ? (
                <Markdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <Heading level="h1" className="mb-4 mt-6 first:mt-0">
                        {children}
                      </Heading>
                    ),
                    h2: ({ children }) => (
                      <Heading level="h2" className="mb-3 mt-6 first:mt-0">
                        {children}
                      </Heading>
                    ),
                    h3: ({ children }) => (
                      <Heading level="h3" className="mb-3 mt-4 first:mt-0">
                        {children}
                      </Heading>
                    ),
                    h4: ({ children }) => (
                      <Heading level="h4" className="mb-2 mt-4 first:mt-0">
                        {children}
                      </Heading>
                    ),
                    h5: ({ children }) => (
                      <Heading level="h5" className="mb-2 mt-3 first:mt-0">
                        {children}
                      </Heading>
                    ),
                    h6: ({ children }) => (
                      <Heading level="h6" className="mb-2 mt-3 first:mt-0">
                        {children}
                      </Heading>
                    ),
                    p: ({ children }) => (
                      <p className="mb-4 last:mb-0 leading-7">{children}</p>
                    ),
                    code: ({ inline, className, children, ...props }: any) => {
                      if (inline) {
                        return <InlineCode {...props}>{children}</InlineCode>;
                      }
                      return (
                        <pre className="my-4 overflow-x-auto rounded-lg bg-muted/50 p-4">
                          <code
                            className={cn(
                              "font-mono text-sm",
                              className
                            )}
                            {...props}
                          >
                            {children}
                          </code>
                        </pre>
                      );
                    },
                    blockquote: ({ children }) => (
                      <Blockquote className="my-4">{children}</Blockquote>
                    ),
                    ul: ({ children }) => (
                      <ul className="my-4 ml-6 list-disc space-y-2">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="my-4 ml-6 list-decimal space-y-2">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="leading-7">{children}</li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold">{children}</strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic">{children}</em>
                    ),
                    hr: () => <hr className="my-6 border-border" />,
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        className="text-primary underline underline-offset-4 hover:text-primary/80"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {message.content}
                </Markdown>
              ) : (
                <span className="italic opacity-70">Thinking...</span>
              )}
              {message.isStreaming && (
                <span className="inline-block w-1.5 h-4 ml-1 bg-current animate-pulse" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;

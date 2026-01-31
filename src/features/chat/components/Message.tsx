import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Heading, InlineCode, Blockquote } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { Copy, Check } from "lucide-react";

export interface MessageData {
  id: string;
  sender_type: "user" | "assistant";
  content: string;
  timestamp?: Date;
  isStreaming?: boolean;
  isVoice?: boolean;
}

interface MessageProps {
  message: MessageData;
}

// Code block component with copy functionality
const CodeBlock: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => {
  const [copied, setCopied] = React.useState(false);
  const codeRef = React.useRef<HTMLElement>(null);

  // Extract language from className (e.g., "language-javascript")
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "text";

  const handleCopy = async () => {
    const code = codeRef.current?.textContent || "";
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block-wrapper group relative my-4 rounded-xl overflow-hidden bg-[#1e1e1e] border border-[#333]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-[#333]">
        <span className="text-xs text-gray-400 font-mono uppercase tracking-wide">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      {/* Code content */}
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
        <code ref={codeRef} className={cn("font-mono", className)}>
          {children}
        </code>
      </pre>
    </div>
  );
};

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.sender_type === "user";

  // User message - blue bubble on the right
  if (isUser) {
    return (
      <div className="w-full flex justify-end py-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
        <div className="max-w-[85%] md:max-w-[70%]">
          <div className="bg-primary text-primary-foreground px-4 py-2.5 rounded-2xl rounded-br-md shadow-sm">
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Assistant message - content without avatar
  return (
    <div className="w-full py-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      <div className="w-full">
        {/* Message content */}
        <div
          className={cn(
            "prose prose-sm dark:prose-invert max-w-none",
            "prose-p:leading-7 prose-p:mb-4 prose-p:last:mb-0",
            "prose-headings:font-semibold prose-headings:tracking-tight",
            "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
            "prose-strong:font-semibold",
            "prose-code:before:content-none prose-code:after:content-none",
            "prose-pre:p-0 prose-pre:bg-transparent prose-pre:my-0"
          )}
        >
              {message.content ? (
                <Markdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    h1: ({ children }) => (
                      <Heading level="h1" className="mb-4 mt-6 first:mt-0 text-2xl">
                        {children}
                      </Heading>
                    ),
                    h2: ({ children }) => (
                      <Heading level="h2" className="mb-3 mt-6 first:mt-0 text-xl">
                        {children}
                      </Heading>
                    ),
                    h3: ({ children }) => (
                      <Heading level="h3" className="mb-3 mt-4 first:mt-0 text-lg">
                        {children}
                      </Heading>
                    ),
                    h4: ({ children }) => (
                      <Heading level="h4" className="mb-2 mt-4 first:mt-0 text-base">
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
                      <p className="mb-4 last:mb-0 leading-7 text-foreground">{children}</p>
                    ),
                    code: ({ inline, className, children, ...props }: any) => {
                      if (inline) {
                        return (
                          <InlineCode className="px-1.5 py-0.5 rounded-md bg-muted text-sm font-medium">
                            {children}
                          </InlineCode>
                        );
                      }
                      return (
                        <CodeBlock className={className} {...props}>
                          {children}
                        </CodeBlock>
                      );
                    },
                    pre: ({ children }) => <>{children}</>,
                    blockquote: ({ children }) => (
                      <Blockquote className="my-4 border-l-4 border-primary/30 pl-4 italic text-muted-foreground">
                        {children}
                      </Blockquote>
                    ),
                    ul: ({ children }) => (
                      <ul className="my-4 ml-6 list-disc space-y-2 marker:text-muted-foreground">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="my-4 ml-6 list-decimal space-y-2 marker:text-muted-foreground">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="leading-7 pl-1">{children}</li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-foreground">{children}</strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic">{children}</em>
                    ),
                    hr: () => <hr className="my-6 border-border" />,
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        className="text-primary font-medium hover:underline underline-offset-4"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    ),
                    table: ({ children }) => (
                      <div className="my-4 overflow-x-auto rounded-lg border border-border">
                        <table className="w-full border-collapse text-sm">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-muted/50">{children}</thead>
                    ),
                    th: ({ children }) => (
                      <th className="px-4 py-2 text-left font-semibold border-b border-border">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="px-4 py-2 border-b border-border/50">
                        {children}
                      </td>
                    ),
                  }}
                >
                  {message.content}
                </Markdown>
              ) : (
                <div className="flex items-center gap-1.5 py-2">
                  <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" />
                </div>
              )}
              {message.isStreaming && message.content && (
                <span className="inline-block w-1.5 h-5 ml-0.5 bg-primary animate-pulse rounded-sm" />
              )}
        </div>
      </div>
    </div>
  );
};

export default Message;

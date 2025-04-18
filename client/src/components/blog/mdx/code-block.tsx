import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  highlight?: string;
  className?: string;
}

export default function CodeBlock({
  code,
  language = "text",
  filename,
  highlight,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Process code for highlighting if needed
  const highlightLines = highlight ? highlight.split(",").map(Number) : [];
  
  return (
    <div className={cn("relative my-6 overflow-hidden rounded-lg", className)}>
      {filename && (
        <div className="bg-gray-800 dark:bg-gray-900 px-4 py-2 text-xs text-gray-200 font-mono border-b border-gray-700">
          {filename}
        </div>
      )}
      <div className="relative">
        <pre
          className={`language-${language} p-4 overflow-x-auto text-sm bg-gray-800 dark:bg-gray-900 text-gray-200`}
        >
          <code>
            {code.split("\n").map((line, i) => (
              <div
                key={i}
                className={cn(
                  "px-4 -mx-4",
                  highlightLines.includes(i + 1) &&
                    "bg-primary-900/20 border-l-2 border-primary-500"
                )}
              >
                {line || " "}
              </div>
            ))}
          </code>
        </pre>
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-2 right-2 text-gray-300 hover:text-white bg-gray-700/50 hover:bg-gray-700"
          onClick={copyCode}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span className="sr-only">{copied ? "Copied" : "Copy code"}</span>
        </Button>
      </div>
      {language && (
        <div className="absolute bottom-2 right-2 text-xs text-gray-400 font-mono">
          {language}
        </div>
      )}
    </div>
  );
}

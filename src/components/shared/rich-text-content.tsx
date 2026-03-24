import type { ReactNode } from "react";
import parse from "html-react-parser";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import type { PluggableList } from "unified";

import { MARKDOWN_SANITIZE_SCHEMA } from "@/lib/markdown-schema";
import { cn } from "@/lib/utils";

interface RichTextContentProps {
  markdown?: string | null;
  html?: string | null;
  className?: string;
  emptyFallback?: ReactNode;
}

const markdownRehypePlugins: PluggableList = [
  rehypeRaw,
  [rehypeSanitize, MARKDOWN_SANITIZE_SCHEMA],
];

export function RichTextContent({
  markdown,
  html,
  className,
  emptyFallback = null,
}: RichTextContentProps) {
  const markdownSource = markdown?.trim();
  const htmlSource = html?.trim();

  if (!markdownSource && !htmlSource) {
    return <>{emptyFallback}</>;
  }

  return (
    <div
      className={cn(
        "markdown-content prose prose-neutral dark:prose-invert max-w-none",
        className,
      )}
    >
      {markdownSource ? (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={markdownRehypePlugins}
        >
          {markdownSource}
        </ReactMarkdown>
      ) : (
        // Public API HTML is sanitized server-side before reaching the frontend.
        parse(htmlSource ?? "")
      )}
    </div>
  );
}
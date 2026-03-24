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
        [
          "markdown-content max-w-none prose prose-neutral dark:prose-invert",
          "prose-headings:font-heading prose-headings:text-card-foreground",
          "prose-p:text-card-foreground/95 prose-li:text-card-foreground/95",
          "prose-strong:text-card-foreground prose-em:text-card-foreground/95",
          "prose-code:text-card-foreground prose-pre:text-foreground prose-pre:bg-muted/95",
          "prose-blockquote:text-card-foreground/92 prose-blockquote:border-primary/25",
          "prose-a:text-accent hover:prose-a:text-accent/80",
          "prose-th:text-card-foreground prose-td:text-card-foreground/88",
          "prose-hr:border-border",
        ].join(" "),
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
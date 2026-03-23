"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Info } from "lucide-react";
import { motion } from "framer-motion";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea, type TextareaProps } from "@/components/ui/textarea";

interface MarkdownPreviewProps
  extends Omit<TextareaProps, "value" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
}

export function MarkdownPreview({
  value,
  onChange,
  ...textareaProps
}: MarkdownPreviewProps) {
  return (
    <div>
      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="rounded-xl">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Textarea
              className="rounded-xl min-h-[150px] resize-y"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              {...textareaProps}
            />
          </motion.div>
        </TabsContent>

        <TabsContent value="preview" asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="markdown-content prose prose-sm dark:prose-invert min-h-[150px] max-w-none rounded-xl border border-border p-4">
              {value ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {value}
                </ReactMarkdown>
              ) : (
                <p className="text-muted-foreground">Nothing to preview</p>
              )}
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>

      <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
        <Info className="h-3 w-3" aria-hidden="true" /> Markdown formatting
        supported
      </p>
    </div>
  );
}

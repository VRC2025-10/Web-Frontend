"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { Upload, X, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface ImageDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  onFileRemoved: (index: number) => void;
  files: File[];
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string[];
  disabled?: boolean;
}

const DEFAULT_ACCEPT = ["image/png", "image/jpeg", "image/webp"];

export function ImageDropzone({
  onFilesSelected,
  onFileRemoved,
  files,
  maxFiles = 10,
  maxSizeMB = 10,
  accept = DEFAULT_ACCEPT,
  disabled = false,
}: ImageDropzoneProps) {
  const t = useTranslations("admin.galleries.dropzone");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [removalAnnouncement, setRemovalAnnouncement] = useState("");
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const removeButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    return () => {
      for (const url of urls) {
        URL.revokeObjectURL(url);
      }
    };
  }, [files]);

  const validateFiles = useCallback(
    (incoming: File[]): File[] => {
      const valid: File[] = [];
      const remaining = maxFiles - files.length;

      if (incoming.length > remaining) {
        toast.error(t("errors.tooMany", { maxFiles }));
        setIsRejected(true);
        setTimeout(() => setIsRejected(false), 300);
      }

      const toProcess = incoming.slice(0, remaining);

      for (const file of toProcess) {
        if (!accept.includes(file.type)) {
          toast.error(t("errors.unsupported", { fileName: file.name }));
          setIsRejected(true);
          setTimeout(() => setIsRejected(false), 300);
          continue;
        }
        if (file.size > maxSizeBytes) {
          toast.error(t("errors.tooLarge", { fileName: file.name, maxSizeMB }));
          setIsRejected(true);
          setTimeout(() => setIsRejected(false), 300);
          continue;
        }
        valid.push(file);
      }

      return valid;
    },
    [accept, files.length, maxFiles, maxSizeBytes, maxSizeMB, t]
  );

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    const valid = validateFiles(droppedFiles);
    if (valid.length > 0) {
      onFilesSelected(valid);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files ? Array.from(e.target.files) : [];
    const valid = validateFiles(selected);
    if (valid.length > 0) {
      onFilesSelected(valid);
    }
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function openFilePicker() {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openFilePicker();
    }
  }

  const canAddMore = files.length < maxFiles && !disabled;

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={accept.join(",")}
        onChange={handleFileSelect}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Drop zone */}
      {(files.length === 0 || canAddMore) && (
        <motion.div
          animate={isRejected ? { x: [-4, 4, -4, 4, 0] } : {}}
          transition={{ duration: 0.3 }}
        >
          <div
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-label={t("aria.uploadArea")}
            aria-disabled={disabled || undefined}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={openFilePicker}
            onKeyDown={handleKeyDown}
            className={`
              border-2 border-dashed rounded-2xl p-6 md:p-8 text-center
              transition-colors cursor-pointer
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
              ${disabled
                ? "opacity-50 cursor-not-allowed pointer-events-none"
                : isDragOver
                  ? "border-primary bg-primary/5 dark:bg-primary/10"
                  : "border-primary/30 dark:border-primary/20 hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10"
              }
            `}
          >
            <Upload
              className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground mx-auto mb-3"
              aria-hidden="true"
            />
            <p className="text-base font-medium">{t("title")}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t("description", { maxSizeMB })}
            </p>
          </div>
        </motion.div>
      )}

      {/* File count and removal announcement for screen readers */}
      <div aria-live="polite" className="sr-only">
        {files.length > 0 && t("selectionCount", { count: files.length })}
        {removalAnnouncement && ` ${removalAnnouncement}`}
      </div>

      {/* Preview grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mt-6">
          <AnimatePresence mode="popLayout">
            {files.map((file, index) => (
              <motion.div
                key={`${file.name}-${file.size}-${file.lastModified}`}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="relative rounded-xl overflow-hidden aspect-square group"
              >
                {previewUrls[index] && (
                  <Image
                    src={previewUrls[index]}
                    alt={file.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 dark:group-hover:bg-black/40 transition-colors" />
                {!disabled && (
                  <Button
                    ref={(el) => { removeButtonRefs.current[index] = el; }}
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 w-7 h-7 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      const removedName = files[index].name;
                      setRemovalAnnouncement(t("removedAnnouncement", { fileName: removedName }));
                      onFileRemoved(index);
                      // Focus next remove button, or previous, or dropzone
                      requestAnimationFrame(() => {
                        const nextIndex = index < files.length - 2 ? index : index - 1;
                        if (nextIndex >= 0 && removeButtonRefs.current[nextIndex]) {
                          removeButtonRefs.current[nextIndex]?.focus();
                        } else {
                          fileInputRef.current?.parentElement?.querySelector<HTMLElement>('[role="button"]')?.focus();
                        }
                      });
                    }}
                    aria-label={t("aria.remove", { fileName: file.name })}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add more tile */}
          {canAddMore && files.length > 0 && (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border-2 border-dashed border-muted rounded-xl aspect-square flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={openFilePicker}
              role="button"
              tabIndex={0}
              aria-label={t("aria.addMore")}
              onKeyDown={handleKeyDown}
            >
              <Plus className="w-8 h-8 text-muted-foreground" />
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

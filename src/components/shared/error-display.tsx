"use client";

import { useEffect, useRef } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Loader2,
  RotateCw,
  WifiOff,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

interface InlineErrorProps {
  /** Simple inline alert for form-level or general errors */
  variant?: "inline";
  message: string;
  title?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  /** Move focus to the alert on mount */
  autoFocus?: boolean;
  className?: string;
}

interface BannerErrorProps {
  /** Network error banner with height animation */
  variant: "banner";
  message?: string;
  onRetry: () => void;
  isRetrying?: boolean;
  autoFocus?: never;
  title?: never;
  className?: string;
}

interface SectionErrorProps {
  /** Section-level centered error card */
  variant: "section";
  title?: string;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  autoFocus?: never;
  className?: string;
}

export type ErrorDisplayProps =
  | InlineErrorProps
  | BannerErrorProps
  | SectionErrorProps;

// ---------------------------------------------------------------------------
// Reduced-motion safe transitions
// ---------------------------------------------------------------------------

const fadeSlideIn = {
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2, ease: "easeOut" as const },
};

const heightExpand = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: "auto" },
  exit: { opacity: 0, height: 0 },
  transition: { duration: 0.25 },
};

// ---------------------------------------------------------------------------
// Variant: inline
// ---------------------------------------------------------------------------

function InlineError({
  message,
  title,
  onRetry,
  isRetrying = false,
  autoFocus = false,
  className,
}: InlineErrorProps) {
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus) {
      alertRef.current?.focus();
    }
  }, [autoFocus]);

  return (
    <motion.div {...fadeSlideIn}>
      <Alert
        ref={alertRef}
        variant="destructive"
        tabIndex={autoFocus ? -1 : undefined}
        className={cn("rounded-xl", className)}
      >
        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertDescription className="flex items-center gap-3">
          <span className="flex-1">{message}</span>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              disabled={isRetrying}
              className="shrink-0"
            >
              {isRetrying ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                "Retry"
              )}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Variant: banner (Network Error)
// ---------------------------------------------------------------------------

function BannerError({
  message = "Unable to connect. Check your internet connection.",
  onRetry,
  isRetrying = false,
  className,
}: BannerErrorProps) {
  return (
    <motion.div
      {...heightExpand}
      className="overflow-hidden"
    >
      <div
        role="alert"
        className={cn(
          "flex flex-wrap items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4",
          className
        )}
      >
        <WifiOff
          className="h-5 w-5 shrink-0 text-destructive"
          aria-hidden="true"
        />
        <p className="min-w-0 flex-1 text-sm text-destructive">{message}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={isRetrying}
          className="shrink-0"
        >
          {isRetrying ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            "Retry"
          )}
        </Button>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Variant: section (Section-Level Error)
// ---------------------------------------------------------------------------

function SectionError({
  title = "Failed to load data",
  message = "Please try again.",
  onRetry,
  isRetrying = false,
  className,
}: SectionErrorProps) {
  return (
    <motion.div {...fadeSlideIn}>
      <div
        role="alert"
        className={cn(
          "flex flex-col items-center justify-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 py-12",
          className
        )}
      >
        <AlertCircle
          className="h-10 w-10 text-destructive"
          aria-hidden="true"
        />
        <div className="space-y-1 text-center">
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={isRetrying}
          >
            {isRetrying ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <>
                <RotateCw className="h-4 w-4" aria-hidden="true" />
                Retry
              </>
            )}
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ErrorDisplay(props: ErrorDisplayProps) {
  const { variant = "inline" } = props;

  switch (variant) {
    case "banner":
      return (
        <AnimatePresence>
          <BannerError {...(props as BannerErrorProps)} />
        </AnimatePresence>
      );
    case "section":
      return <SectionError {...(props as SectionErrorProps)} />;
    case "inline":
    default:
      return <InlineError {...(props as InlineErrorProps)} />;
  }
}

// ---------------------------------------------------------------------------
// Convenience wrapper: AnimatePresence-aware banner for conditional rendering
// ---------------------------------------------------------------------------

/**
 * Wrap this around a conditional `<ErrorDisplay variant="banner" />` to get
 * smooth enter/exit animations.
 *
 * @example
 * ```tsx
 * <ErrorBannerPresence>
 *   {isOffline && <ErrorDisplay variant="banner" onRetry={retry} />}
 * </ErrorBannerPresence>
 * ```
 */
export function ErrorBannerPresence({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatePresence mode="wait">{children}</AnimatePresence>;
}

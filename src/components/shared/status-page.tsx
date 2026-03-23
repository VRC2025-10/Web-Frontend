"use client";

import Link from "next/link";
import { useMemo, useTransition } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Hourglass,
  Leaf,
  LockKeyhole,
  type LucideIcon,
  ServerCrash,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { easeOut } from "@/lib/motion";

type StatusTone = "primary" | "warning" | "danger";
type StatusIcon = "leaf" | "lock" | "shield" | "hourglass" | "server";
type StatusActionKind = "link" | "refresh";

interface StatusAction {
  label: string;
  kind?: StatusActionKind;
  href?: string;
  variant?: "default" | "outline";
}

interface StatusPageProps {
  code: string;
  title: string;
  description: string;
  icon: StatusIcon;
  tone?: StatusTone;
  primaryAction?: StatusAction;
  secondaryAction?: StatusAction;
}

const iconMap: Record<StatusIcon, LucideIcon> = {
  leaf: Leaf,
  lock: LockKeyhole,
  shield: ShieldAlert,
  hourglass: Hourglass,
  server: ServerCrash,
};

const toneClasses: Record<StatusTone, { orb: string; icon: string; code: string }> = {
  primary: {
    orb: "from-primary/18 via-secondary/55 to-transparent",
    icon: "text-primary/80",
    code: "text-primary/70",
  },
  warning: {
    orb: "from-secondary via-primary/18 to-transparent",
    icon: "text-amber-600 dark:text-amber-400",
    code: "text-amber-700 dark:text-amber-300",
  },
  danger: {
    orb: "from-destructive/20 via-secondary/40 to-transparent",
    icon: "text-destructive/75",
    code: "text-destructive/75",
  },
};

function StatusActionButton({ action }: { action: StatusAction }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if ((action.kind ?? "link") === "refresh") {
    return (
      <Button
        variant={action.variant ?? "default"}
        className="min-h-11 rounded-2xl px-8"
        disabled={isPending}
        onClick={() => {
          startTransition(() => {
            router.refresh();
          });
        }}
      >
        {action.label}
      </Button>
    );
  }

  return (
    <Button variant={action.variant ?? "default"} className="min-h-11 rounded-2xl px-8" asChild>
      <Link href={action.href ?? "/"}>{action.label}</Link>
    </Button>
  );
}

export function StatusPage({
  code,
  title,
  description,
  icon,
  tone = "primary",
  primaryAction,
  secondaryAction,
}: StatusPageProps) {
  const shouldReduceMotion = useReducedMotion();
  const Icon = iconMap[icon];
  const styles = toneClasses[tone];

  const orbitAnimation = useMemo(
    () =>
      shouldReduceMotion
        ? undefined
        : {
            rotate: [0, 6, 0, -6, 0],
            scale: [1, 1.02, 1],
          },
    [shouldReduceMotion]
  );

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-br blur-3xl sm:h-96 sm:w-96" />
        <div className={`absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-br blur-3xl ${styles.orb} sm:h-96 sm:w-96`} />
      </div>

      <motion.section
        aria-labelledby="status-page-title"
        aria-describedby="status-page-description"
        className="relative w-full max-w-2xl rounded-[32px] border border-border/70 bg-card/88 px-6 py-10 text-center shadow-lg shadow-black/5 backdrop-blur-md sm:px-10 sm:py-12"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={shouldReduceMotion ? { duration: 0 } : easeOut}
      >
        <motion.div
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] border border-border/70 bg-background/90 shadow-sm"
          animate={orbitAnimation}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Icon className={`h-10 w-10 ${styles.icon}`} aria-hidden="true" />
        </motion.div>

        <p className={`mt-8 text-sm font-semibold uppercase tracking-[0.32em] ${styles.code}`}>{code}</p>
        <h1 id="status-page-title" className="mt-4 font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        <p id="status-page-description" className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
          {description}
        </p>

        {(primaryAction || secondaryAction) && (
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {primaryAction ? <StatusActionButton action={primaryAction} /> : null}
            {secondaryAction ? <StatusActionButton action={secondaryAction} /> : null}
          </div>
        )}
      </motion.section>
    </main>
  );
}
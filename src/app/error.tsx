"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { easeOut } from "@/lib/motion";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const tCommon = useTranslations("common");
  const t = useTranslations("errors.serverError");
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    console.error("Unhandled route error:", error);
  }, [error]);

  return (
    <section
      className="flex min-h-[60vh] items-center justify-center px-4 py-10"
      aria-labelledby="route-error-title"
      aria-describedby="route-error-description"
    >
      <div className="w-full max-w-xl rounded-[28px] border border-border/70 bg-card/80 px-6 py-10 text-center shadow-sm backdrop-blur-sm sm:px-10">
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={shouldReduceMotion ? { duration: 0 } : easeOut}
      >
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive/60" aria-hidden="true" />
      </motion.div>
      <motion.h1
        id="route-error-title"
        className="mt-6 text-2xl font-bold"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={shouldReduceMotion ? { duration: 0 } : { ...easeOut, delay: 0.08 }}
      >
        {t("title")}
      </motion.h1>
      <motion.p
        id="route-error-description"
        className="mx-auto mt-2 max-w-md text-muted-foreground"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={shouldReduceMotion ? { duration: 0 } : { ...easeOut, delay: 0.16 }}
      >
        {t("description")}
      </motion.p>
      <motion.div
        className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={shouldReduceMotion ? { duration: 0 } : { ...easeOut, delay: 0.24 }}
      >
        <Button onClick={reset} className="min-h-11 rounded-2xl px-8">
          {t("tryAgain")}
        </Button>
        <Button variant="outline" className="min-h-11 rounded-2xl px-8" asChild>
          <Link href="/">{tCommon("backToHome")}</Link>
        </Button>
      </motion.div>
      </div>
    </section>
  );
}

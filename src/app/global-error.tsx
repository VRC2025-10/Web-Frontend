"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { defaultLocale, type Locale } from "@/i18n/config";
import { easeOut } from "@/lib/motion";
import "./globals.css";

const messages = {
  ja: {
    title: "重大なエラーが発生しました",
    description: "ページ全体を表示できませんでした。再読み込みするか、ホームに戻ってからもう一度お試しください。",
    retry: "再試行",
    backToHome: "ホームに戻る",
  },
  en: {
    title: "A critical error occurred",
    description: "We couldn't render the page. Try again or return home and retry from there.",
    retry: "Try again",
    backToHome: "Back to Home",
  },
} as const satisfies Record<Locale, { title: string; description: string; retry: string; backToHome: string }>;

function readLocaleFromCookie(): Locale {
  if (typeof document === "undefined") {
    return defaultLocale;
  }

  const localeCookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith("NEXT_LOCALE="))
    ?.split("=")[1];

  return localeCookie === "en" ? "en" : defaultLocale;
}

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const shouldReduceMotion = useReducedMotion();
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  useEffect(() => {
    setLocale(readLocaleFromCookie());
    console.error("Global error:", error);
  }, [error]);

  const t = messages[locale];

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <main className="flex min-h-screen items-center justify-center px-4 py-10">
          <motion.section
            className="w-full max-w-xl rounded-[28px] border border-border/70 bg-card/90 px-6 py-10 text-center shadow-sm backdrop-blur-sm sm:px-10"
            aria-labelledby="global-error-title"
            aria-describedby="global-error-description"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : easeOut}
          >
            <AlertOctagon className="mx-auto h-16 w-16 text-destructive/70" aria-hidden="true" />
            <h1 id="global-error-title" className="mt-6 text-2xl font-bold">
              {t.title}
            </h1>
            <p id="global-error-description" className="mx-auto mt-3 max-w-md text-muted-foreground">
              {t.description}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button onClick={reset} className="min-h-11 rounded-2xl px-8">
                {t.retry}
              </Button>
              <Button variant="outline" className="min-h-11 rounded-2xl px-8" asChild>
                <Link href="/">{t.backToHome}</Link>
              </Button>
            </div>
          </motion.section>
        </main>
      </body>
    </html>
  );
}
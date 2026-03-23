"use client";

import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
  languageLabel: string;
}

export function LanguageSwitcher({ languageLabel }: LanguageSwitcherProps) {

  function toggleLocale() {
    const current = document.cookie
      .split("; ")
      .find((c) => c.startsWith("NEXT_LOCALE="))
      ?.split("=")[1];
    const next = current === "en" ? "ja" : "en";
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000`;
    window.location.reload();
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLocale}
      className="text-muted-foreground hover:text-foreground text-sm gap-1.5"
    >
      <Globe className="w-4 h-4" aria-hidden="true" />
      {languageLabel}
    </Button>
  );
}

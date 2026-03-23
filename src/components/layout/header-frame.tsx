"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface HeaderFrameProps {
  children: React.ReactNode;
}

export function HeaderFrame({ children }: HeaderFrameProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 h-16 border-b transition-colors duration-300",
        scrolled
          ? "border-border/50 bg-background/90 shadow-sm backdrop-blur-md"
          : "border-transparent bg-background/70 backdrop-blur-sm"
      )}
    >
      {children}
    </header>
  );
}
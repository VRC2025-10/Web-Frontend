"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { normalizePublicMemberCollection } from "@/lib/api/member-normalizers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import type { PublicMember } from "@/lib/api/types";

interface MemberSearchProps {
  onResults: (members: PublicMember[]) => void;
  onClear: () => void;
  placeholder?: string;
}

const apiBase = process.env.NEXT_PUBLIC_API_URL || "";

export function MemberSearch({
  onResults,
  onClear,
  placeholder = "Search members…",
}: MemberSearchProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const abortRef = useRef<AbortController | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const clearSearch = useCallback(() => {
    setQuery("");
    onClear();
    setAnnouncement("");
  }, [onClear]);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      if (debouncedQuery.length === 0) onClear();
      return;
    }

    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;

    setLoading(true);
    setAnnouncement("Searching...");

    fetch(
      `${apiBase}/api/v1/public/members?search=${encodeURIComponent(debouncedQuery)}`,
      { signal: controller.signal }
    )
      .then((res) => {
        if (!res.ok) throw new Error("Search failed");
        return res.json();
      })
      .then((data) => {
        const members: PublicMember[] = normalizePublicMemberCollection(
          data.items ?? data
        );
        onResults(members);
        setAnnouncement(
          members.length === 0
            ? "No members found"
            : `${members.length} member${members.length !== 1 ? "s" : ""} found`
        );
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          onResults([]);
          setAnnouncement("Search failed");
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [debouncedQuery, onResults, onClear]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      clearSearch();
    }
  }

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn("pl-10 pr-10 rounded-2xl")}
        aria-label="Search members"
      />
      {loading && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
      )}
      {!loading && query && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute right-1 top-1/2 -translate-y-1/2"
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </motion.div>
        </AnimatePresence>
      )}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
    </div>
  );
}

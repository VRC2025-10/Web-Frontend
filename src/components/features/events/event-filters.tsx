"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagChip } from "@/components/shared/tag-chip";
import type { Tag } from "@/lib/api/types";

interface EventFiltersProps {
  tags: Tag[];
}

export function EventFilters({ tags }: EventFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("events");

  const currentStatus = searchParams.get("status") ?? "upcoming";
  const currentSort = searchParams.get("sort") ?? "date_desc";
  const currentTags = searchParams.get("tags")?.split(",").filter(Boolean) ?? [];

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    // Reset page when filters change
    params.delete("page");
    router.push(`/events?${params.toString()}`, { scroll: false });
  }

  function handleStatusChange(status: string) {
    updateParams({ status: status === "upcoming" ? null : status });
  }

  function handleSortChange(sort: string) {
    updateParams({ sort: sort === "date_desc" ? null : sort });
  }

  function handleTagToggle(tagId: string) {
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter((id) => id !== tagId)
      : [...currentTags, tagId];
    updateParams({ tags: newTags.length > 0 ? newTags.join(",") : null });
  }

  return (
    <div className="mt-6 space-y-4">
      {/* Status tabs + Sort */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex gap-2" role="tablist" aria-label="Event status filter">
          {(["upcoming", "past"] as const).map((status) => (
            <Button
              key={status}
              role="tab"
              aria-selected={currentStatus === status}
              variant={currentStatus === status ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => handleStatusChange(status)}
            >
              {t(`filters.${status}`)}
            </Button>
          ))}
        </div>

        <Select value={currentSort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-full md:w-48 rounded-xl" aria-label="Sort events">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date_desc">{t("sort.dateDesc")}</SelectItem>
            <SelectItem value="date_asc">{t("sort.dateAsc")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tag filters */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by tags">
          {tags.map((tag) => (
            <TagChip
              key={tag.id}
              name={tag.name}
              color={tag.color}
              isActive={currentTags.includes(tag.id)}
              onClick={() => handleTagToggle(tag.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

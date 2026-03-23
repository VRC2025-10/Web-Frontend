import Link from "next/link";
import Image from "next/image";
import { Calendar } from "lucide-react";

import { formatEventDateRange } from "@/lib/date";
import type { Tag } from "@/lib/api/types";

interface EventCardProps {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  hostName: string;
  startTime: string;
  endTime: string | null;
  tags: Tag[];
  locale?: string;
  hostLabel?: string;
}

export function EventCard({
  id,
  title,
  thumbnailUrl,
  hostName,
  startTime,
  endTime,
  tags,
  locale,
  hostLabel,
}: EventCardProps) {
  return (
    <Link
      href={`/events/${id}`}
      className="group block overflow-hidden rounded-2xl border border-border/50 shadow-sm transition-transform transition-shadow duration-200 hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="relative aspect-video overflow-hidden">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
            <Calendar className="h-10 w-10 text-muted-foreground/50" />
          </div>
        )}
      </div>

      <div className="p-5">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium opacity-80"
                style={{ backgroundColor: tag.color, color: "#fff" }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
        <h3 className="mt-2 line-clamp-2 text-lg font-bold">{title}</h3>
        <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-secondary/15 px-3 py-1.5 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 shrink-0" aria-hidden="true" />
          <time dateTime={startTime}>{formatEventDateRange(startTime, endTime, locale)}</time>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {hostLabel ? `${hostLabel}: ${hostName}` : hostName}
        </p>
      </div>
    </Link>
  );
}

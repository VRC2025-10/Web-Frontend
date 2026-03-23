"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface MemberCardProps {
  id: string;
  name: string;
  avatarUrl: string | null;
  bioSummary: string | null;
}

export function MemberCard({ id, name, avatarUrl, bioSummary }: MemberCardProps) {
  return (
    <Link
      href={`/members/${id}`}
      className="group block rounded-2xl border border-border/50 p-6 text-center shadow-sm transition-transform transition-shadow duration-200 hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(232,106,88,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Avatar className="mx-auto h-20 w-20 ring-2 ring-background shadow-md sm:h-24 sm:w-24">
        <AvatarImage src={avatarUrl ?? undefined} alt={`${name}'s avatar`} />
        <AvatarFallback>
          <User className="h-10 w-10" />
        </AvatarFallback>
      </Avatar>
      <h3 className="mt-4 line-clamp-1 text-base font-bold sm:text-lg">{name}</h3>
      {bioSummary && (
        <p className="mt-2 line-clamp-1 text-sm text-muted-foreground sm:line-clamp-2">
          {bioSummary}
        </p>
      )}
    </Link>
  );
}

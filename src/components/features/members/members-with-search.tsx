"use client";

import { useState, useCallback } from "react";
import { MemberSearch } from "@/components/features/members/member-search";
import { MemberCard } from "@/components/features/members/member-card";
import type { PublicMember } from "@/lib/api/types";

interface MembersWithSearchProps {
  children: React.ReactNode;
  placeholder?: string;
}

export function MembersWithSearch({ children, placeholder }: MembersWithSearchProps) {
  const [searchResults, setSearchResults] = useState<PublicMember[] | null>(null);

  const handleResults = useCallback((members: PublicMember[]) => {
    setSearchResults(members);
  }, []);

  const handleClear = useCallback(() => {
    setSearchResults(null);
  }, []);

  return (
    <>
      <div className="mt-6">
        <MemberSearch
          onResults={handleResults}
          onClear={handleClear}
          placeholder={placeholder}
        />
      </div>
      {searchResults !== null ? (
        searchResults.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mt-8">
            {searchResults.map((member) => (
              <MemberCard
                key={member.user_id}
                id={member.user_id}
                name={member.discord_username}
                avatarUrl={member.avatar_url}
                bioSummary={member.bio_summary}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-12">No members found</p>
        )
      ) : (
        children
      )}
    </>
  );
}

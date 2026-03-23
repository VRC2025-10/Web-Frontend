import { getMembers } from "@/lib/api/members";
import { getTranslations } from "next-intl/server";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { MemberCard } from "@/components/features/members/member-card";
import { MembersWithSearch } from "@/components/features/members/members-with-search";
import { UserX } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("members");
  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default async function MembersPage(props: { searchParams: Promise<{ page?: string }> }) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const [t, data] = await Promise.all([
    getTranslations("members"),
    getMembers({ page, per_page: 24 }),
  ]);

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-8 py-12" aria-labelledby="members-heading">
      <SectionHeader title={t("title")} />
      <MembersWithSearch placeholder={t("search.placeholder")}>
        {data.items.length > 0 ? (
          <>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6 lg:grid-cols-5" role="list">
              {data.items.map((member) => (
                <div key={member.user_id} role="listitem">
                  <MemberCard
                    id={member.user_id}
                    name={member.discord_username}
                    avatarUrl={member.avatar_url}
                    bioSummary={member.bio_summary}
                  />
                </div>
              ))}
            </div>
            {data.total_pages > 1 && (
              <div className="mt-12">
                <Pagination currentPage={page} totalPages={data.total_pages} baseUrl="/members" searchParams={searchParams as Record<string, string>} />
              </div>
            )}
          </>
        ) : (
          <div className="mt-8"><EmptyState icon={UserX} message={t("empty")} /></div>
        )}
      </MembersWithSearch>
    </section>
  );
}

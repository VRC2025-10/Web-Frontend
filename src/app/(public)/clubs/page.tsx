import { getClubs } from "@/lib/api/clubs";
import { getTranslations } from "next-intl/server";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ClubCard } from "@/components/features/clubs/club-card";
import { Building2 } from "lucide-react";
import type { Metadata } from "next";
import type { PublicClub } from "@/lib/api/types";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("clubs");
  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default async function ClubsPage() {
  const [t, clubs] = await Promise.all([
    getTranslations("clubs"),
    getClubs().catch(() => [] as PublicClub[]),
  ]);

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-8 py-12" aria-labelledby="clubs-heading">
      <SectionHeader title={t("title")} description={t("meta.description")} />
      {clubs.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" role="list">
          {clubs.map((club) => (
            <div key={club.id} role="listitem">
              <ClubCard
                id={club.id}
                name={club.name}
                description={club.description}
                coverImageUrl={club.cover_image_url}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8"><EmptyState icon={Building2} message={t("empty")} /></div>
      )}
    </section>
  );
}

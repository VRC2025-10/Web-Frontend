import Link from "next/link";
import Image from "next/image";
import { getMembers } from "@/lib/api/members";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { HeroCarousel } from "@/components/features/home/hero-carousel";
import { HeroContent } from "@/components/features/home/hero-content";
import { MemberCarousel } from "@/components/features/home/member-carousel";
import { LeafParticles } from "@/components/shared/leaf-particles";
import { SITE_NAME } from "@/lib/site";
import { UserX } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home");
  return {
    title: SITE_NAME,
    description: t("meta.description"),
    openGraph: {
      title: SITE_NAME,
      description: t("meta.description"),
      images: ["/og-default.png"],
    },
  };
}

export default async function HomePage() {
  const t = await getTranslations("home");
  let members;
  try {
    members = await getMembers({ per_page: 10 });
  } catch {
    members = { items: [], total_count: 0, total_pages: 0 };
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Banner image — shown at natural 16:9 ratio */}
        <Image
          src="/banner.png"
          alt="VRC 2025年10月同期会 banner"
          width={1920}
          height={1080}
          className="w-full h-auto block"
          priority
        />
        <HeroCarousel slides={[]} />
        <LeafParticles count={5} className="z-[5]" />
        {/* Subtle gradient at the bottom for text readability */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background/90 via-background/40 to-transparent z-10" />
        <HeroContent
          subtitle={t("hero.subtitle")}
          ctaClubsLabel={t("hero.cta.clubs")}
          ctaMembersLabel={t("hero.cta.members")}
        />
      </section>

      {/* Members Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" aria-labelledby="members-heading">
        <SectionHeader
          id="members-heading"
          title={t("members.title")}
          action={<Link href="/members" className="text-sm text-primary hover:underline">{t("members.viewAll")}</Link>}
        />
        {members.items.length > 0 ? (
          <MemberCarousel members={members.items} />
        ) : (
          <div className="mt-8"><EmptyState icon={UserX} message={t("members.empty")} /></div>
        )}
      </section>
    </>
  );
}

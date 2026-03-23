import Link from "next/link";
import Image from "next/image";
import { getEvents } from "@/lib/api/events";
import { getMembers } from "@/lib/api/members";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { EventCard } from "@/components/features/events/event-card";
import { HeroCarousel } from "@/components/features/home/hero-carousel";
import { HeroContent } from "@/components/features/home/hero-content";
import { MemberCarousel } from "@/components/features/home/member-carousel";
import { LeafParticles } from "@/components/shared/leaf-particles";
import { SITE_NAME } from "@/lib/site";
import { CalendarX, UserX } from "lucide-react";
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
  let events, members;
  try {
    [events, members] = await Promise.all([
      getEvents({ per_page: 6, status: "published" }),
      getMembers({ per_page: 10 }),
    ]);
  } catch {
    events = { items: [], total_count: 0, total_pages: 0 };
    members = { items: [], total_count: 0, total_pages: 0 };
  }

  const displayEvents = events.items.slice(0, 3);

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
        <HeroCarousel
          slides={displayEvents.map((e) => ({
            id: e.id,
            title: e.title,
            thumbnailUrl: null,
          }))}
        />
        <LeafParticles count={5} className="z-[5]" />
        {/* Subtle gradient at the bottom for text readability */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background/90 via-background/40 to-transparent z-10" />
        <HeroContent
          subtitle={t("hero.subtitle")}
          ctaEventsLabel={t("hero.cta.events")}
          ctaMembersLabel={t("hero.cta.members")}
        />
      </section>

      {/* Events Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" aria-labelledby="events-heading">
        <SectionHeader
          id="events-heading"
          title={t("events.title")}
          action={<Link href="/events" className="text-sm text-primary hover:underline">{t("events.viewAll")}</Link>}
        />
        {displayEvents.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayEvents.map((event) => (
              <div key={event.id}>
                <EventCard
                  id={event.id}
                  title={event.title}
                  thumbnailUrl={null}
                  hostName={event.host_name}
                  startTime={event.start_time}
                  endTime={event.end_time}
                  tags={event.tags}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8"><EmptyState icon={CalendarX} message={t("events.empty")} /></div>
        )}
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

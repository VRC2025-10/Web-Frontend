import { getEvents } from "@/lib/api/events";
import { getTags } from "@/lib/api/tags";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { EventCard } from "@/components/features/events/event-card";
import { EventFilters } from "@/components/features/events/event-filters";
import { CalendarX } from "lucide-react";
import type { Metadata } from "next";
import { getLocaleMessages } from "@/i18n/messages";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("events");
  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default async function EventsPage(props: { searchParams: Promise<{ status?: string; tags?: string; sort?: string; page?: string }> }) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const [locale, t, data, tags] = await Promise.all([
    getLocale(),
    getTranslations("events"),
    getEvents({
      page,
      per_page: 12,
      status: searchParams.status,
      tags: searchParams.tags,
      sort: searchParams.sort,
    }),
    getTags().catch(() => [] as import("@/lib/api/types").Tag[]),
  ]);
  const messages = getLocaleMessages(locale);

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-8 py-12" aria-labelledby="events-heading">
      <SectionHeader title={t("title")} />
      <NextIntlClientProvider
        locale={locale}
        messages={{
          events: {
            filters: messages.events.filters,
            sort: messages.events.sort,
          },
        }}
      >
        <EventFilters tags={tags} />
      </NextIntlClientProvider>
      {data.items.length > 0 ? (
        <>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.items.map((event) => (
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
          {data.total_pages > 1 && (
            <div className="mt-12">
              <Pagination currentPage={page} totalPages={data.total_pages} baseUrl="/events" searchParams={searchParams as Record<string, string>} />
            </div>
          )}
        </>
      ) : (
        <div className="mt-8"><EmptyState icon={CalendarX} message={t("empty")} /></div>
      )}
    </section>
  );
}

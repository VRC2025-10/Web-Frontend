import { getEventById } from "@/lib/api/events";
import { getMe } from "@/lib/api/auth";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, ArrowLeft } from "lucide-react";
import { ReportDialog } from "@/components/shared/report-dialog";
import { formatEventDateRange, getEventStatus } from "@/lib/date";
import { RichTextContent } from "@/components/shared/rich-text-content";
import type { Metadata } from "next";
import { getLocaleMessages } from "@/i18n/messages";

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params;
  try {
    const event = await getEventById(params.id);
    return {
      title: event.title,
      description: event.description_markdown?.slice(0, 160) ?? "",
    };
  } catch {
    return {};
  }
}

export default async function EventDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const tPromise = getTranslations("events");
  const mePromise = getMe();
  const eventPromise = getEventById(params.id);
  const localePromise = getLocale();

  let event;
  try {
    event = await eventPromise;
  } catch {
    notFound();
  }

  const [locale, t, me] = await Promise.all([localePromise, tPromise, mePromise]);
  const messages = getLocaleMessages(locale);
  const status = getEventStatus(event.start_time, event.end_time);

  return (
    <div className="max-w-5xl mx-auto px-4 mt-8 pb-16">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/events"><ArrowLeft className="w-4 h-4 mr-2" />{t("detail.backButton")}</Link>
      </Button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{event.title}</h1>
          <div className="inline-flex items-center gap-2 mt-4">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="bg-secondary/15 text-secondary-foreground rounded-lg px-3 py-1.5 text-sm">
              {formatEventDateRange(event.start_time, event.end_time, locale)}
            </span>
          </div>
          {event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {event.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="rounded-full text-xs px-2.5 py-0.5">{tag.name}</Badge>
              ))}
            </div>
          )}
          {event.description_markdown && (
            <RichTextContent markdown={event.description_markdown} className="mt-8" />
          )}
        </div>

        {/* Sidebar */}
        <aside aria-label="Event actions">
          <Card className="rounded-2xl sticky top-24">
            <CardContent className="p-6">
              {status === "upcoming" && (
                <Button disabled className="rounded-2xl w-full">{t("detail.join.upcoming")}</Button>
              )}
              {status === "ongoing" && (
                <div className="space-y-3">
                  <Button className="rounded-2xl w-full">{t("detail.join.vrchat")}</Button>
                  <Button variant="secondary" className="rounded-2xl w-full">{t("detail.join.discord")}</Button>
                </div>
              )}
              {status === "past" && (
                <p className="text-muted-foreground text-center py-4">{t("detail.join.ended")}</p>
              )}
              {event.location && (
                <>
                  <Separator className="my-4" />
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{event.location}</span>
                  </div>
                </>
              )}
              {me && me.id !== event.host_user_id && (
                <>
                  <Separator className="my-4" />
                  <NextIntlClientProvider locale={locale} messages={{ report: messages.report }}>
                    <ReportDialog
                      targetType="event"
                      targetId={event.id}
                      triggerLabel={t("detail.report")}
                    />
                  </NextIntlClientProvider>
                </>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

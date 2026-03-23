import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ScheduleWorkspace } from "@/components/features/schedule/schedule-workspace";
import { getScheduleBootstrap } from "@/lib/api/schedule";
import { daysInMonth, normalizeMonthValue, startOfMonth, todayJstMonth } from "@/lib/schedule-time";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("schedule.meta");
  return {
    title: t("title"),
    description: t("description"),
    robots: { index: false, follow: false },
  };
}

interface SchedulePageProps {
  searchParams: Promise<{
    month?: string;
  }>;
}

export default async function SchedulePage({ searchParams }: SchedulePageProps) {
  const params = await searchParams;
  const month = normalizeMonthValue(params.month) ?? todayJstMonth();
  const data = await getScheduleBootstrap({
    from: startOfMonth(month),
    days: daysInMonth(month),
  });

  return <ScheduleWorkspace data={data} month={month} />;
}
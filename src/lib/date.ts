import { formatDistanceToNow, parseISO } from "date-fns";
import { ja, enUS } from "date-fns/locale";

const localeMap = { ja, en: enUS } as const;
const intlLocaleMap = { ja: "ja-JP", en: "en-US" } as const;
const DISPLAY_TIME_ZONE = "Asia/Tokyo";

function getLocale(locale: string) {
  return localeMap[locale as keyof typeof localeMap] ?? ja;
}

function getIntlLocale(locale: string) {
  return intlLocaleMap[locale as keyof typeof intlLocaleMap] ?? intlLocaleMap.ja;
}

function getDate(dateStr: string): Date {
  return parseISO(dateStr);
}

function formatWithOptions(date: Date, locale: string, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    timeZone: DISPLAY_TIME_ZONE,
    ...options,
  }).format(date);
}

function formatMonthDay(date: Date, locale: string): string {
  return formatWithOptions(date, locale, { month: "short", day: "numeric" });
}

function formatClock(date: Date, locale: string): string {
  return formatWithOptions(date, locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getCalendarDayKey(date: Date): string {
  return formatWithOptions(date, "en", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatDateLabel(date: Date, locale: string): string {
  return formatWithOptions(date, locale, {
    year: "numeric",
    month: locale === "ja" ? "long" : "short",
    day: "numeric",
  });
}

function formatDateTimeLabel(date: Date, locale: string): string {
  return formatWithOptions(date, locale, {
    year: "numeric",
    month: locale === "ja" ? "long" : "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDate(dateStr: string, locale: string = "ja"): string {
  return formatDateLabel(getDate(dateStr), locale);
}

export function formatDateTime(dateStr: string, locale: string = "ja"): string {
  return formatDateTimeLabel(getDate(dateStr), locale);
}

export function formatEventDateRange(
  startTime: string,
  endTime: string | null,
  locale: string = "ja"
): string {
  const start = getDate(startTime);
  const startStr = `${formatMonthDay(start, locale)} ${formatClock(start, locale)}`;

  if (!endTime) {
    return startStr;
  }

  const end = getDate(endTime);
  if (getCalendarDayKey(start) === getCalendarDayKey(end)) {
    return `${startStr} 〜 ${formatClock(end, locale)}`;
  }

  return `${startStr} 〜 ${formatMonthDay(end, locale)} ${formatClock(end, locale)}`;
}

export function formatTime(dateStr: string, locale: string = "ja"): string {
  return formatClock(getDate(dateStr), locale);
}

export function formatRelativeTime(dateStr: string, locale: string = "ja"): string {
  return formatDistanceToNow(parseISO(dateStr), {
    addSuffix: true,
    locale: getLocale(locale),
  });
}

export function getEventStatus(
  startTime: string,
  endTime: string | null
): "upcoming" | "ongoing" | "past" {
  const now = new Date();
  const start = parseISO(startTime);

  if (now < start) {
    return "upcoming";
  }

  if (endTime) {
    const end = parseISO(endTime);
    if (now <= end) {
      return "ongoing";
    }
  }

  return "past";
}

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

export function shiftToJst(dateLike: string | Date) {
  const date = typeof dateLike === "string" ? new Date(dateLike) : dateLike;
  return new Date(date.getTime() + JST_OFFSET_MS);
}

export function formatDateLabel(date: string) {
  const shifted = shiftToJst(`${date}T00:00:00Z`);
  return shifted.toLocaleDateString("ja-JP", {
    month: "numeric",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatDateLabelForLocale(date: string, locale: string) {
  const shifted = shiftToJst(`${date}T00:00:00Z`);
  return shifted.toLocaleDateString(locale, {
    month: "numeric",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatLongDateLabel(date: string) {
  const shifted = shiftToJst(`${date}T00:00:00Z`);
  return shifted.toLocaleDateString("ja-JP", {
    month: "long",
    day: "numeric",
    weekday: "short",
    timeZone: "UTC",
  });
}

export function formatLongDateLabelForLocale(date: string, locale: string) {
  const shifted = shiftToJst(`${date}T00:00:00Z`);
  return shifted.toLocaleDateString(locale, {
    month: "long",
    day: "numeric",
    weekday: "short",
    timeZone: "UTC",
  });
}

export function minutesFromMidnight(dateLike: string | Date) {
  const shifted = shiftToJst(dateLike);
  return shifted.getUTCHours() * 60 + shifted.getUTCMinutes();
}

export function durationInMinutes(startAt: string, endAt: string) {
  return Math.max(30, Math.round((new Date(endAt).getTime() - new Date(startAt).getTime()) / 60000));
}

export function isoToJstDate(dateLike: string) {
  const shifted = shiftToJst(dateLike);
  return [
    shifted.getUTCFullYear(),
    `${shifted.getUTCMonth() + 1}`.padStart(2, "0"),
    `${shifted.getUTCDate()}`.padStart(2, "0"),
  ].join("-");
}

export function isoToJstTime(dateLike: string) {
  const shifted = shiftToJst(dateLike);
  return `${`${shifted.getUTCHours()}`.padStart(2, "0")}:${`${shifted.getUTCMinutes()}`.padStart(2, "0")}`;
}

export function minutesToTimeString(minutes: number) {
  const normalized = Math.max(0, Math.min(24 * 60, minutes));
  return `${`${Math.floor(normalized / 60)}`.padStart(2, "0")}:${`${normalized % 60}`.padStart(2, "0")}`;
}

export function jstDateTimeToIso(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  return new Date(Date.UTC(year, month - 1, day, hours - 9, minutes)).toISOString();
}

export function jstDateMinutesToIso(date: string, minutes: number) {
  return jstDateTimeToIso(date, minutesToTimeString(minutes));
}

export function addDays(date: string, days: number) {
  const [year, month, day] = date.split("-").map(Number);
  const base = new Date(Date.UTC(year, month - 1, day));
  base.setUTCDate(base.getUTCDate() + days);
  return `${base.getUTCFullYear()}-${`${base.getUTCMonth() + 1}`.padStart(2, "0")}-${`${base.getUTCDate()}`.padStart(2, "0")}`;
}

export function todayJstDate() {
  return isoToJstDate(new Date().toISOString());
}

export function todayJstMonth() {
  return todayJstDate().slice(0, 7);
}

export function normalizeMonthValue(value: string | null | undefined) {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month] = value.split("-").map(Number);
  if (month < 1 || month > 12) {
    return null;
  }

  return `${year}-${`${month}`.padStart(2, "0")}`;
}

export function startOfMonth(month: string) {
  const normalized = normalizeMonthValue(month);
  if (!normalized) {
    throw new Error(`invalid month: ${month}`);
  }

  return `${normalized}-01`;
}

export function daysInMonth(month: string) {
  const normalized = normalizeMonthValue(month);
  if (!normalized) {
    throw new Error(`invalid month: ${month}`);
  }

  const [year, monthValue] = normalized.split("-").map(Number);
  return new Date(Date.UTC(year, monthValue, 0)).getUTCDate();
}

export function addMonths(month: string, diff: number) {
  const normalized = normalizeMonthValue(month);
  if (!normalized) {
    throw new Error(`invalid month: ${month}`);
  }

  const [year, monthValue] = normalized.split("-").map(Number);
  const base = new Date(Date.UTC(year, monthValue - 1 + diff, 1));
  return `${base.getUTCFullYear()}-${`${base.getUTCMonth() + 1}`.padStart(2, "0")}`;
}

export function formatMonthLabel(month: string) {
  const normalized = normalizeMonthValue(month);
  if (!normalized) {
    throw new Error(`invalid month: ${month}`);
  }

  const [year, monthValue] = normalized.split("-").map(Number);
  return new Date(Date.UTC(year, monthValue - 1, 1)).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

export function formatMonthLabelForLocale(month: string, locale: string) {
  const normalized = normalizeMonthValue(month);
  if (!normalized) {
    throw new Error(`invalid month: ${month}`);
  }

  const [year, monthValue] = normalized.split("-").map(Number);
  return new Date(Date.UTC(year, monthValue - 1, 1)).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}
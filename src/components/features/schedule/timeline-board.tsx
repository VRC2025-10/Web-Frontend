"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { useLocale, useTranslations } from "next-intl";

import type { ScheduleTimelineDay, ScheduleTimelineEvent } from "@/lib/api/types";
import {
  formatDateLabelForLocale,
  formatLongDateLabelForLocale,
  isoToJstDate,
  isoToJstTime,
  jstDateMinutesToIso,
  minutesFromMidnight,
  todayJstDate,
} from "@/lib/schedule-time";

const DATE_COLUMN_WIDTH = 112;
const HEADER_HEIGHT = 68;
const PX_PER_MINUTE = 2;
const TRACK_WIDTH = 24 * 60 * PX_PER_MINUTE;
const MIN_SELECTION = 30;

export interface DraftSelection {
  startDate: string;
  startMinutes: number;
  endDate: string;
  endMinutes: number;
}

type PositionedEvent = {
  event: ScheduleTimelineEvent;
  lane: number;
  left: number;
  width: number;
};

type DaySegment = {
  startMinutes: number;
  endMinutes: number;
  left: number;
  width: number;
};

type DayLayout = {
  day: ScheduleTimelineDay;
  placements: PositionedEvent[];
  laneCount: number;
  rowHeight: number;
};

interface TimelineBoardProps {
  days: ScheduleTimelineDay[];
  focusDate: string | null;
  onCreateSelection: (selection: DraftSelection) => void;
  onOpenEvent: (event: ScheduleTimelineEvent) => void;
}

export function TimelineBoard({ days, focusDate, onCreateSelection, onOpenEvent }: TimelineBoardProps) {
  const locale = useLocale();
  const t = useTranslations("schedule.timeline");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const dayRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const dragState = useRef<{ startDate: string; startMinutes: number } | null>(null);
  const [draftSelection, setDraftSelection] = useState<DraftSelection | null>(null);

  const layouts = useMemo(() => days.map(layoutDay), [days]);

  useEffect(() => {
    if (!focusDate) {
      return;
    }

    const container = scrollRef.current;
    const row = dayRefs.current[focusDate];
    if (!container || !row) {
      return;
    }

    const nextTop = row.offsetTop - HEADER_HEIGHT - 24;
    container.scrollTo({ top: Math.max(0, nextTop), behavior: "smooth" });
  }, [focusDate, layouts]);

  useEffect(() => {
    function handleMove(event: MouseEvent) {
      if (!dragState.current) {
        return;
      }

      const point = pointFromPointer(event.clientX, event.clientY);
      if (!point) {
        return;
      }

      setDraftSelection((current) => {
        if (!current) {
          return null;
        }

        return {
          ...current,
          endDate: point.date,
          endMinutes: point.minutes,
        };
      });
    }

    function handleUp() {
      if (!draftSelection) {
        dragState.current = null;
        return;
      }

      onCreateSelection(normalizeSelection(draftSelection));
      dragState.current = null;
      setDraftSelection(null);
    }

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [draftSelection, onCreateSelection]);

  return (
    <section className="rounded-[2rem] border border-border bg-card/90 p-4 shadow-sm backdrop-blur">
      <div className="mb-4 flex flex-col gap-3 px-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">{t("eyebrow")}</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{t("title")}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("description")}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border border-border bg-background/80 px-3 py-2">{t("legendClick")}</span>
          <span className="rounded-full border border-border bg-background/80 px-3 py-2">{t("legendDrag")}</span>
          <span className="rounded-full border border-border bg-background/80 px-3 py-2">{t("legendMasked")}</span>
        </div>
      </div>

      <div ref={scrollRef} className="relative h-[72vh] overflow-auto rounded-[1.75rem] border border-border bg-background/70">
        <div
          className="relative min-w-full"
          style={{
            width: DATE_COLUMN_WIDTH + TRACK_WIDTH,
          }}
        >
          <div
            className="sticky top-0 z-30 flex border-b border-border bg-card/95 backdrop-blur"
            style={{ height: HEADER_HEIGHT }}
          >
            <div
              className="sticky left-0 z-40 flex items-center border-r border-border bg-card px-4"
              style={{ width: DATE_COLUMN_WIDTH }}
            >
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("date")}</span>
            </div>
            <div className="relative" style={{ width: TRACK_WIDTH }}>
              {Array.from({ length: 24 }).map((_, hour) => (
                <div
                  key={hour}
                  className="absolute inset-y-0 border-l border-border"
                  style={{ left: hour * 60 * PX_PER_MINUTE, width: 60 * PX_PER_MINUTE }}
                >
                  <span className="absolute left-2 top-3 text-sm font-medium text-muted-foreground">{`${hour}:00`}</span>
                </div>
              ))}
            </div>
          </div>

          {layouts.map((layout) => {
            const isToday = layout.day.date === todayJstDate();

            return (
              <div
                key={layout.day.date}
                ref={(node) => {
                  dayRefs.current[layout.day.date] = node;
                }}
                className="flex border-b border-border"
                style={{ minHeight: layout.rowHeight }}
              >
                <div
                  className={clsx(
                    "sticky left-0 z-20 border-r border-border px-4 py-4",
                    isToday ? "bg-primary/10" : "bg-card",
                  )}
                  style={{ width: DATE_COLUMN_WIDTH }}
                >
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-semibold text-foreground">{formatDateLabelForLocale(layout.day.date, locale)}</div>
                    {isToday ? <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{t("today")}</span> : null}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{formatLongDateLabelForLocale(layout.day.date, locale)}</div>
                </div>

                <div
                  data-track-date={layout.day.date}
                  className="relative bg-background/50"
                  style={{ width: TRACK_WIDTH, minHeight: layout.rowHeight }}
                  onMouseDown={(event) => {
                    const target = event.target as HTMLElement;
                    if (event.button !== 0 || target.closest("button")) {
                      return;
                    }

                    const minute = Math.min(
                      24 * 60 - MIN_SELECTION,
                      clampMinute(Math.round(pointerToMinutes(event.currentTarget, event.clientX) / 30) * 30),
                    );
                    dragState.current = { startDate: layout.day.date, startMinutes: minute };
                    setDraftSelection({
                      startDate: layout.day.date,
                      startMinutes: minute,
                      endDate: layout.day.date,
                      endMinutes: Math.min(1440, minute + MIN_SELECTION),
                    });
                  }}
                >
                  {Array.from({ length: 48 }).map((_, index) => (
                    <div
                      key={index}
                      className={clsx(
                        "absolute inset-y-0 border-l",
                        index % 2 === 0 ? "border-border" : "border-dashed border-border/60",
                      )}
                      style={{ left: index * 30 * PX_PER_MINUTE }}
                    />
                  ))}

                  {layout.placements.map(({ event, lane, left, width }) => (
                    <button
                      key={`${event.id ?? `${event.start_at}-${event.end_at}`}-${lane}`}
                      type="button"
                      onMouseDown={(clickEvent) => clickEvent.stopPropagation()}
                      onClick={() => {
                        if (event.display_mode === "full") {
                          onOpenEvent(event);
                        }
                      }}
                      className={clsx(
                        "absolute overflow-hidden rounded-2xl border px-3 py-2 text-left transition",
                        event.display_mode === "full"
                          ? "border-primary/20 bg-gradient-to-br from-primary to-cyan-700 text-primary-foreground shadow-md hover:-translate-y-0.5"
                          : "cursor-default border-dashed border-border bg-[repeating-linear-gradient(135deg,rgba(15,23,42,0.05),rgba(15,23,42,0.05)_10px,rgba(255,255,255,0.6)_10px,rgba(255,255,255,0.6)_20px)] text-transparent",
                      )}
                      aria-label={event.display_mode === "full" ? t("ariaOpenEvent") : t("masked")}
                      style={{
                        left,
                        width,
                        top: 12 + lane * 32,
                        height: 28,
                      }}
                    >
                      {event.display_mode === "full" ? (
                        <div className="flex items-center justify-between gap-3">
                          <span className="truncate text-xs font-semibold">
                            {`${isoToJstTime(event.start_at)}-${isoToJstTime(event.end_at)} ${event.title ?? ""}`}
                          </span>
                          {event.editable ? <span className="text-[10px] uppercase tracking-[0.12em] text-primary-foreground/70">{t("editable")}</span> : null}
                        </div>
                      ) : (
                        <span aria-hidden="true">{t("masked")}</span>
                      )}
                    </button>
                  ))}

                  {(() => {
                    const preview = draftSelection ? selectionSegmentForDay(layout.day.date, draftSelection) : null;
                    if (!preview) {
                      return null;
                    }

                    return (
                      <div
                        className="absolute rounded-2xl border border-dashed border-primary bg-primary/10"
                        style={{
                          left: preview.left,
                          width: preview.width,
                          top: 10,
                          height: Math.max(layout.rowHeight - 20, 36),
                        }}
                      />
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function layoutDay(day: ScheduleTimelineDay): DayLayout {
  const sorted = day.events
    .map((event) => ({ event, segment: eventSegmentForDay(day.date, event) }))
    .filter((entry): entry is { event: ScheduleTimelineEvent; segment: DaySegment } => entry.segment !== null)
    .sort((left, right) => left.segment.startMinutes - right.segment.startMinutes || left.segment.endMinutes - right.segment.endMinutes);
  const laneEnds: number[] = [];
  const placements: PositionedEvent[] = [];

  for (const { event, segment } of sorted) {
    let lane = laneEnds.findIndex((laneEnd) => laneEnd <= segment.startMinutes);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(segment.endMinutes);
    } else {
      laneEnds[lane] = segment.endMinutes;
    }

    placements.push({
      event,
      lane,
      left: segment.startMinutes * PX_PER_MINUTE,
      width: Math.max(18, (segment.endMinutes - segment.startMinutes) * PX_PER_MINUTE),
    });
  }

  const laneCount = Math.max(1, laneEnds.length);
  return {
    day,
    placements,
    laneCount,
    rowHeight: Math.max(96, laneCount * 32 + 32),
  };
}

function pointerToMinutes(element: HTMLDivElement, clientX: number) {
  const rect = element.getBoundingClientRect();
  return (clientX - rect.left) / PX_PER_MINUTE;
}

function clampMinute(value: number) {
  return Math.max(0, Math.min(24 * 60, value));
}

function pointFromPointer(clientX: number, clientY: number) {
  const element = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
  const track = element?.closest("[data-track-date]") as HTMLDivElement | null;
  const date = track?.dataset.trackDate;
  if (!track || !date) {
    return null;
  }

  return {
    date,
    minutes: clampMinute(Math.round(pointerToMinutes(track, clientX) / 30) * 30),
  };
}

function normalizeSelection(selection: DraftSelection): DraftSelection {
  const startMs = new Date(jstDateMinutesToIso(selection.startDate, selection.startMinutes)).getTime();
  const endMs = new Date(jstDateMinutesToIso(selection.endDate, selection.endMinutes)).getTime();
  const normalizedStart = Math.min(startMs, endMs);
  const normalizedEnd = Math.max(endMs, normalizedStart + MIN_SELECTION * 60000);

  return {
    startDate: isoToJstDate(new Date(normalizedStart).toISOString()),
    startMinutes: minutesFromMidnight(new Date(normalizedStart)),
    endDate: isoToJstDate(new Date(normalizedEnd).toISOString()),
    endMinutes: minutesFromMidnight(new Date(normalizedEnd)),
  };
}

function selectionSegmentForDay(date: string, selection: DraftSelection) {
  const normalized = normalizeSelection(selection);
  return segmentFromRange(
    date,
    jstDateMinutesToIso(normalized.startDate, normalized.startMinutes),
    jstDateMinutesToIso(normalized.endDate, normalized.endMinutes),
  );
}

function eventSegmentForDay(date: string, event: ScheduleTimelineEvent) {
  return segmentFromRange(date, event.start_at, event.end_at);
}

function segmentFromRange(date: string, startAt: string, endAt: string) {
  const dayStart = new Date(jstDateMinutesToIso(date, 0));
  const dayEnd = new Date(jstDateMinutesToIso(date, 24 * 60));
  const segmentStart = new Date(Math.max(new Date(startAt).getTime(), dayStart.getTime()));
  const segmentEnd = new Date(Math.min(new Date(endAt).getTime(), dayEnd.getTime()));
  if (segmentEnd.getTime() <= segmentStart.getTime()) {
    return null;
  }

  const startMinutes = minutesFromMidnight(segmentStart);
  const endMinutes = segmentEnd.getTime() === dayEnd.getTime() ? 24 * 60 : minutesFromMidnight(segmentEnd);
  return {
    startMinutes,
    endMinutes,
    left: startMinutes * PX_PER_MINUTE,
    width: Math.max(18, (endMinutes - startMinutes) * PX_PER_MINUTE),
  };
}
"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { useTranslations } from "next-intl";

import type {
  ScheduleEventPayload,
  ScheduleManagedRole,
  ScheduleTemplate,
  ScheduleTimelineEvent,
  ScheduleViewer,
} from "@/lib/api/types";
import { isoToJstDate, isoToJstTime, jstDateTimeToIso, minutesToTimeString } from "@/lib/schedule-time";
import type { DraftSelection } from "./timeline-board";

type CreateDraft = {
  mode: "create";
  selection: DraftSelection;
};

type EditDraft = {
  mode: "edit";
  event: ScheduleTimelineEvent;
};

export type EditorDraft = CreateDraft | EditDraft;

interface EventEditorProps {
  viewer: ScheduleViewer;
  roles: ScheduleManagedRole[];
  templates: ScheduleTemplate[];
  draft: EditorDraft | null;
  pending: boolean;
  onClose: () => void;
  onSave: (payload: ScheduleEventPayload, eventId?: string) => Promise<void>;
  onDelete: (eventId: string) => Promise<void>;
}

interface FormState {
  template_id: string;
  title: string;
  description: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  visibility_mode: "public" | "restricted";
  auto_notify_enabled: boolean;
  visible_role_ids: string[];
}

function defaultFormState(draft: EditorDraft | null, defaultTemplate: ScheduleTemplate | null): FormState {
  if (!draft) {
    return {
      template_id: "",
      title: "",
      description: "",
      start_date: "",
      start_time: "09:00",
      end_date: "",
      end_time: "10:00",
      visibility_mode: "public",
      auto_notify_enabled: true,
      visible_role_ids: [],
    };
  }

  if (draft.mode === "create") {
    return {
      template_id: defaultTemplate?.id ?? "",
      title: defaultTemplate?.title ?? "",
      description: defaultTemplate?.description ?? "",
      start_date: draft.selection.startDate,
      start_time: minutesToTimeString(draft.selection.startMinutes),
      end_date: draft.selection.endDate,
      end_time: minutesToTimeString(draft.selection.endMinutes),
      visibility_mode: "public",
      auto_notify_enabled: true,
      visible_role_ids: [],
    };
  }

  return {
    template_id: "",
    title: draft.event.title ?? "",
    description: draft.event.description ?? "",
    start_date: isoToJstDate(draft.event.start_at),
    start_time: isoToJstTime(draft.event.start_at),
    end_date: isoToJstDate(draft.event.end_at),
    end_time: isoToJstTime(draft.event.end_at),
    visibility_mode: draft.event.visibility_mode,
    auto_notify_enabled: draft.event.auto_notify_enabled ?? true,
    visible_role_ids: draft.event.visible_role_ids ?? [],
  };
}

export function EventEditor({ viewer, roles, templates, draft, pending, onClose, onSave, onDelete }: EventEditorProps) {
  const t = useTranslations("schedule.editor");
  const defaultTemplate = useMemo(() => templates.find((template) => template.is_default) ?? null, [templates]);
  const [formState, setFormState] = useState<FormState>(() => defaultFormState(draft, defaultTemplate));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormState(defaultFormState(draft, defaultTemplate));
    setError(null);
  }, [draft, defaultTemplate]);

  const canUseRestricted = viewer.permissions.manage_events || viewer.permissions.view_restricted_events;
  const visibleRoleOptions = useMemo(
    () => roles.filter((role) => role.can_view_restricted_events).sort((left, right) => left.display_name.localeCompare(right.display_name)),
    [roles],
  );
  const templateOptions = useMemo(
    () => [...templates].sort((left, right) => {
      if (left.is_default !== right.is_default) {
        return left.is_default ? -1 : 1;
      }
      return left.name.localeCompare(right.name);
    }),
    [templates],
  );

  useEffect(() => {
    if (!draft) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [draft, onClose]);

  if (!draft) {
    return null;
  }

  const currentDraft = draft;
  const isReadOnly = currentDraft.mode === "edit" && !currentDraft.event.editable;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const currentDraft = draft;
    if (!currentDraft) {
      return;
    }
    if (isReadOnly) {
      return;
    }

    if (formState.visibility_mode === "restricted" && formState.visible_role_ids.length === 0) {
      setError(t("errors.restrictedRoles"));
      return;
    }

    const startAt = jstDateTimeToIso(formState.start_date, formState.start_time);
    const endAt = jstDateTimeToIso(formState.end_date, formState.end_time);
    if (new Date(endAt).getTime() <= new Date(startAt).getTime()) {
      setError(t("errors.timeOrder"));
      return;
    }

    try {
      await onSave(
        {
          title: formState.title.trim(),
          description: formState.description.trim(),
          start_at: startAt,
          end_at: endAt,
          visibility_mode: formState.visibility_mode,
          auto_notify_enabled: formState.auto_notify_enabled,
          visible_role_ids: formState.visibility_mode === "restricted" ? formState.visible_role_ids : [],
        },
        currentDraft.mode === "edit" ? currentDraft.event.id ?? undefined : undefined,
      );
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t("errors.save"));
    }
  }

  async function handleDelete() {
    if (currentDraft.mode !== "edit" || !currentDraft.event.id) {
      return;
    }
    if (!window.confirm(t("confirmDelete"))) {
      return;
    }

    setError(null);
    try {
      await onDelete(currentDraft.event.id);
      onClose();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : t("errors.delete"));
    }
  }

  function applyTemplate(templateId: string) {
    if (!templateId) {
      setFormState((current) => ({ ...current, template_id: "" }));
      return;
    }

    const template = templateOptions.find((entry) => entry.id === templateId);
    if (!template) {
      return;
    }

    const hasExistingContent = formState.title.trim() !== "" || formState.description.trim() !== "";
    if (
      hasExistingContent &&
      (formState.title !== template.title || formState.description !== template.description) &&
      !window.confirm(t("confirmTemplate"))
    ) {
      return;
    }

    setFormState((current) => ({
      ...current,
      template_id: templateId,
      title: template.title,
      description: template.description,
    }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-editor-title"
        className="w-full max-w-2xl rounded-[2rem] border border-border bg-card p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">{t("eyebrow")}</p>
            <h2 id="schedule-editor-title" className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              {currentDraft.mode === "create" ? t("createTitle") : t("editTitle")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{isReadOnly ? t("visibility.help") : t("rangeHint")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
          >
            {t("close")}
          </button>
        </div>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-foreground">{t("template")}</span>
            <select
              value={formState.template_id}
              onChange={(event) => applyTemplate(event.target.value)}
              disabled={isReadOnly}
              className="rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary"
            >
              <option value="">{t("noTemplate")}</option>
              {templateOptions.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.is_default ? t("defaultTemplate", { name: template.name }) : template.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-foreground">{t("title")}</span>
            <input
              required
              value={formState.title}
              onChange={(event) => setFormState((current) => ({ ...current, title: event.target.value }))}
              disabled={isReadOnly}
              className="rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary"
              placeholder={t("titlePlaceholder")}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-foreground">{t("description")}</span>
            <textarea
              rows={4}
              value={formState.description}
              onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))}
              disabled={isReadOnly}
              className="rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary"
              placeholder={t("descriptionPlaceholder")}
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-foreground">{t("startDate")}</span>
              <input
                type="date"
                required
                value={formState.start_date}
                onChange={(event) => setFormState((current) => ({ ...current, start_date: event.target.value }))}
                disabled={isReadOnly}
                className="rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-foreground">{t("endDate")}</span>
              <input
                type="date"
                required
                value={formState.end_date}
                onChange={(event) => setFormState((current) => ({ ...current, end_date: event.target.value }))}
                disabled={isReadOnly}
                className="rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-foreground">{t("startTime")}</span>
              <input
                type="time"
                required
                value={formState.start_time}
                onChange={(event) => setFormState((current) => ({ ...current, start_time: event.target.value }))}
                disabled={isReadOnly}
                className="rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-foreground">{t("endTime")}</span>
              <input
                type="time"
                required
                value={formState.end_time}
                onChange={(event) => setFormState((current) => ({ ...current, end_time: event.target.value }))}
                disabled={isReadOnly}
                className="rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary"
              />
            </label>
          </div>

          <div className="grid gap-3 rounded-[1.5rem] border border-border bg-background/60 p-4">
            <div className="flex flex-wrap gap-3">
              {(["public", "restricted"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  disabled={isReadOnly || (mode === "restricted" && !canUseRestricted)}
                  onClick={() => setFormState((current) => ({ ...current, visibility_mode: mode }))}
                  className={clsx(
                    "rounded-full px-4 py-2 text-sm transition",
                    formState.visibility_mode === mode ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground",
                    mode === "restricted" && !canUseRestricted && "cursor-not-allowed opacity-40",
                  )}
                >
                  {mode === "public" ? t("visibility.public") : t("visibility.restricted")}
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{t("visibility.help")}</p>

            {formState.visibility_mode === "restricted" ? (
              <div className="grid gap-2">
                <p className="text-sm text-muted-foreground">{t("restrictedRoles")}</p>
                <div className="grid gap-2 md:grid-cols-2">
                  {visibleRoleOptions.map((role) => {
                    const checked = formState.visible_role_ids.includes(role.discord_role_id);
                    return (
                      <label key={role.id} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={isReadOnly}
                          onChange={(event) =>
                            setFormState((current) => ({
                              ...current,
                              visible_role_ids: event.target.checked
                                ? [...current.visible_role_ids, role.discord_role_id]
                                : current.visible_role_ids.filter((roleId) => roleId !== role.discord_role_id),
                            }))
                          }
                          className="mt-1"
                        />
                        <span>
                          <span className="block font-semibold text-foreground">{role.display_name}</span>
                          {role.description ? <span className="text-sm text-muted-foreground">{role.description}</span> : null}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          <label className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-border bg-background/70 p-4">
            <div>
              <p className="text-sm font-semibold text-foreground">{t("autoNotifyTitle")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("autoNotifyDescription")}</p>
            </div>
            <input
              type="checkbox"
              checked={formState.auto_notify_enabled}
              onChange={(event) => setFormState((current) => ({ ...current, auto_notify_enabled: event.target.checked }))}
              disabled={isReadOnly}
              className="h-5 w-5"
            />
          </label>

          {error ? <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            {currentDraft.mode === "edit" && currentDraft.event.id ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={pending || isReadOnly}
                className="rounded-full border border-destructive/30 px-4 py-2 text-sm text-destructive transition hover:bg-destructive/5 disabled:opacity-60"
              >
                {t("delete")}
              </button>
            ) : (
              <span className="text-sm text-muted-foreground">{t("rangeHint")}</span>
            )}

            {isReadOnly ? null : (
              <button
                type="submit"
                disabled={pending}
                className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
              >
                {pending ? t("saving") : currentDraft.mode === "create" ? t("create") : t("save")}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
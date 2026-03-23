"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import type {
  ScheduleNotificationRulePayload,
  ScheduleNotificationScheduleType,
  ScheduleNotificationState,
} from "@/lib/api/types";

interface NotificationPanelProps {
  state: ScheduleNotificationState;
  pending: boolean;
  onSaveWebhook: (webhookUrl: string) => Promise<void>;
  onDeleteWebhook: () => Promise<void>;
  onSaveRule: (payload: ScheduleNotificationRulePayload, ruleId?: string) => Promise<void>;
  onDeleteRule: (ruleId: string) => Promise<void>;
}

const defaultBeforeEventRule: ScheduleNotificationRulePayload = {
  name: "",
  enabled: true,
  schedule_type: "before_event",
  offset_minutes: 60,
  body_template: "[{{rule_name}}] {{title}}\nStart: {{start_at}}\n{{description}}",
};

const defaultDailyRule: ScheduleNotificationRulePayload = {
  name: "",
  enabled: true,
  schedule_type: "daily_at",
  time_of_day: "09:00",
  window_start_minutes: 0,
  window_end_minutes: 1440,
  body_template: "[{{rule_name}}] {{event_count}} entries\n{{events_list}}",
  list_item_template: "- {{start_at}} {{title}}",
};

function emptyRuleForm() {
  return { ...defaultBeforeEventRule };
}

export function NotificationPanel({
  state,
  pending,
  onSaveWebhook,
  onDeleteWebhook,
  onSaveRule,
  onDeleteRule,
}: NotificationPanelProps) {
  const t = useTranslations("schedule.notifications");
  const tCommon = useTranslations("common");
  const [webhookUrl, setWebhookUrl] = useState(state.webhook_url);
  const [showWebhook, setShowWebhook] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | undefined>();
  const [formState, setFormState] = useState<ScheduleNotificationRulePayload>(emptyRuleForm);
  const [error, setError] = useState<string | null>(null);
  const [webhookError, setWebhookError] = useState<string | null>(null);

  useEffect(() => {
    setWebhookUrl(state.webhook_url);
  }, [state.webhook_url]);

  useEffect(() => {
    if (!editingRuleId) {
      setFormState(emptyRuleForm());
      return;
    }

    const rule = state.rules.find((entry) => entry.id === editingRuleId);
    if (!rule) {
      setEditingRuleId(undefined);
      setFormState(emptyRuleForm());
      return;
    }

    setFormState({
      name: rule.name,
      enabled: rule.enabled,
      schedule_type: rule.schedule_type,
      offset_minutes: rule.offset_minutes ?? undefined,
      time_of_day: rule.time_of_day ?? undefined,
      window_start_minutes: rule.window_start_minutes ?? undefined,
      window_end_minutes: rule.window_end_minutes ?? undefined,
      body_template: rule.body_template,
      list_item_template: rule.list_item_template ?? undefined,
    });
  }, [editingRuleId, state.rules]);

  const sortedRules = useMemo(() => [...state.rules].sort((left, right) => left.name.localeCompare(right.name)), [state.rules]);

  function switchScheduleType(nextType: ScheduleNotificationScheduleType) {
    setFormState((current) =>
      nextType === "before_event"
        ? { ...defaultBeforeEventRule, name: current.name, enabled: current.enabled }
        : { ...defaultDailyRule, name: current.name, enabled: current.enabled },
    );
  }

  async function handleWebhookSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWebhookError(null);

    try {
      await onSaveWebhook(webhookUrl.trim());
    } catch (saveError) {
      setWebhookError(saveError instanceof Error ? saveError.message : t("errors.saveWebhook"));
    }
  }

  async function handleWebhookDelete() {
    if (!window.confirm(t("confirmDeleteWebhook"))) {
      return;
    }

    setWebhookError(null);
    try {
      await onDeleteWebhook();
    } catch (deleteError) {
      setWebhookError(deleteError instanceof Error ? deleteError.message : t("errors.deleteWebhook"));
    }
  }

  async function handleRuleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      await onSaveRule(formState, editingRuleId);
      setEditingRuleId(undefined);
      setFormState(emptyRuleForm());
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t("errors.saveRule"));
    }
  }

  async function handleRuleDelete(ruleId: string) {
    if (!window.confirm(t("confirmDeleteRule"))) {
      return;
    }

    setError(null);
    try {
      await onDeleteRule(ruleId);
      if (editingRuleId === ruleId) {
        setEditingRuleId(undefined);
        setFormState(emptyRuleForm());
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : t("errors.deleteRule"));
    }
  }

  return (
    <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{t("eyebrow")}</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{t("title")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("description")}</p>
        </div>
        {editingRuleId ? (
          <button
            type="button"
            onClick={() => {
              setEditingRuleId(undefined);
              setFormState(emptyRuleForm());
            }}
            className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
          >
            {t("createNew")}
          </button>
        ) : null}
      </div>

      <form className="mt-5 grid gap-3 rounded-[1.7rem] border border-border bg-background/70 p-4" onSubmit={handleWebhookSave}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">{t("webhookTitle")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("webhookDescription")}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowWebhook((current) => !current)}
            className="rounded-full border border-border px-4 py-2 text-xs text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
          >
            {showWebhook ? t("hide") : t("show")}
          </button>
        </div>
        <input
          type={showWebhook ? "text" : "password"}
          value={webhookUrl}
          onChange={(event) => setWebhookUrl(event.target.value)}
          placeholder="https://discord.com/api/webhooks/..."
          className="rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary"
        />
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? t("actions.saving") : t("saveWebhook")}
          </button>
          <button
            type="button"
            disabled={pending || !state.webhook_url}
            onClick={handleWebhookDelete}
            className="rounded-full border border-destructive/30 px-5 py-3 text-sm text-destructive transition hover:bg-destructive/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("deleteWebhook")}
          </button>
        </div>
        {webhookError ? <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{webhookError}</p> : null}
      </form>

      <div className="mt-4 grid gap-2 rounded-[1.5rem] border border-border bg-background/70 p-4 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">{t("placeholdersTitle")}</p>
        <p>{t("placeholdersBefore")}: {state.placeholders.before_event.join(", ")}</p>
        <p>{t("placeholdersDailyBody")}: {state.placeholders.daily_body.join(", ")}</p>
        <p>{t("placeholdersDailyItem")}: {state.placeholders.daily_item.join(", ")}</p>
      </div>

      <form className="mt-6 grid gap-3" onSubmit={handleRuleSave}>
        <input
          value={formState.name}
          onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
          placeholder={t("ruleName")}
          className="rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary"
        />

        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <label className="grid gap-2 text-sm text-muted-foreground">
            <span>{t("scheduleType")}</span>
            <select
              value={formState.schedule_type}
              onChange={(event) => switchScheduleType(event.target.value as ScheduleNotificationScheduleType)}
              className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary"
            >
              <option value="before_event">{t("scheduleTypes.before_event")}</option>
              <option value="daily_at">{t("scheduleTypes.daily_at")}</option>
            </select>
          </label>
          <label className="flex items-center gap-3 rounded-[1.5rem] border border-border bg-background px-4 py-3 text-sm text-foreground md:self-end">
            <input
              type="checkbox"
              checked={formState.enabled}
              onChange={(event) => setFormState((current) => ({ ...current, enabled: event.target.checked }))}
            />
            <span>{t("enabled")}</span>
          </label>
        </div>

        {formState.schedule_type === "before_event" ? (
          <label className="grid gap-2 text-sm text-muted-foreground">
            <span>{t("offsetMinutes")}</span>
            <input
              type="number"
              min={0}
              value={formState.offset_minutes ?? 0}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  offset_minutes: Number.isNaN(event.target.valueAsNumber) ? undefined : event.target.valueAsNumber,
                }))
              }
              className="rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary"
            />
          </label>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            <label className="grid gap-2 text-sm text-muted-foreground">
              <span>{t("timeOfDay")}</span>
              <input
                type="time"
                value={formState.time_of_day ?? "09:00"}
                onChange={(event) => setFormState((current) => ({ ...current, time_of_day: event.target.value }))}
                className="rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary"
              />
            </label>
            <label className="grid gap-2 text-sm text-muted-foreground">
              <span>{t("windowStart")}</span>
              <input
                type="number"
                value={formState.window_start_minutes ?? 0}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    window_start_minutes: Number.isNaN(event.target.valueAsNumber) ? undefined : event.target.valueAsNumber,
                  }))
                }
                className="rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary"
              />
            </label>
            <label className="grid gap-2 text-sm text-muted-foreground">
              <span>{t("windowEnd")}</span>
              <input
                type="number"
                value={formState.window_end_minutes ?? 1440}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    window_end_minutes: Number.isNaN(event.target.valueAsNumber) ? undefined : event.target.valueAsNumber,
                  }))
                }
                className="rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary"
              />
            </label>
          </div>
        )}

        <textarea
          rows={4}
          value={formState.body_template}
          onChange={(event) => setFormState((current) => ({ ...current, body_template: event.target.value }))}
          placeholder={t("bodyTemplate")}
          className="rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary"
        />

        {formState.schedule_type === "daily_at" ? (
          <textarea
            rows={3}
            value={formState.list_item_template ?? ""}
            onChange={(event) => setFormState((current) => ({ ...current, list_item_template: event.target.value }))}
            placeholder={t("listItemTemplate")}
            className="rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary"
          />
        ) : null}

        {error ? <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? t("actions.saving") : editingRuleId ? t("actions.save") : t("actions.add")}
        </button>
      </form>

      <div className="mt-6 grid gap-3">
        {sortedRules.map((rule) => (
          <article key={rule.id} className="rounded-[1.5rem] border border-border bg-background/80 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-foreground">{rule.name}</h3>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    {rule.schedule_type === "before_event" ? t("scheduleTypes.before_event") : t("scheduleTypes.daily_at")}
                  </span>
                  {!rule.enabled ? <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-xs text-muted-foreground">{t("paused")}</span> : null}
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{rule.body_template}</p>
                {rule.schedule_type === "before_event" ? (
                  <p className="mt-2 text-xs text-muted-foreground">{t("beforeSummary", { minutes: rule.offset_minutes ?? 0 })}</p>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">{t("dailySummary", { time: rule.time_of_day ?? "09:00", start: rule.window_start_minutes ?? 0, end: rule.window_end_minutes ?? 0 })}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRuleId(rule.id)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
                >
                  {tCommon("edit")}
                </button>
                <button
                  type="button"
                  onClick={() => handleRuleDelete(rule.id)}
                  className="rounded-full border border-destructive/30 px-3 py-1.5 text-xs text-destructive transition hover:bg-destructive/5"
                >
                  {tCommon("delete")}
                </button>
              </div>
            </div>
          </article>
        ))}
        {sortedRules.length === 0 ? <p className="text-sm text-muted-foreground">{t("empty")}</p> : null}
      </div>
    </section>
  );
}
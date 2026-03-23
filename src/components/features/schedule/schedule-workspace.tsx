"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Bell, CalendarDays, ChevronLeft, ChevronRight, Plus, ShieldCheck, Sparkles } from "lucide-react";

import {
  createScheduleEventAction,
  createScheduleNotificationRuleAction,
  createScheduleRoleAction,
  createScheduleTemplateAction,
  deleteScheduleEventAction,
  deleteScheduleNotificationRuleAction,
  deleteScheduleRoleAction,
  deleteScheduleTemplateAction,
  deleteScheduleWebhookAction,
  saveScheduleWebhookAction,
  updateScheduleEventAction,
  updateScheduleNotificationRuleAction,
  updateScheduleRoleAction,
  updateScheduleTemplateAction,
} from "@/actions/schedule";
import type {
  ScheduleBootstrapResponse,
  ScheduleEventPayload,
  ScheduleNotificationRulePayload,
  ScheduleRolePayload,
  ScheduleTemplatePayload,
  ScheduleTimelineEvent,
} from "@/lib/api/types";
import { formatUserRoleLabel } from "@/lib/role-labels";
import { addMonths, formatMonthLabelForLocale, minutesFromMidnight, todayJstDate, todayJstMonth } from "@/lib/schedule-time";
import { EventEditor, type EditorDraft } from "./event-editor";
import { NotificationPanel } from "./notification-panel";
import { RolePanel } from "./role-panel";
import { TemplatePanel } from "./template-panel";
import { TimelineBoard, type DraftSelection } from "./timeline-board";

type PanelTab = "timeline" | "roles" | "templates" | "notifications";

interface ScheduleWorkspaceProps {
  data: ScheduleBootstrapResponse;
  month: string;
}

export function ScheduleWorkspace({ data, month }: ScheduleWorkspaceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("schedule");
  const [activeTab, setActiveTab] = useState<PanelTab>("timeline");
  const [pending, setPending] = useState(false);
  const [draft, setDraft] = useState<EditorDraft | null>(null);

  const availableTabs = useMemo<PanelTab[]>(() => {
    const tabs: PanelTab[] = ["timeline"];
    if (data.viewer.permissions.manage_roles) {
      tabs.push("roles");
    }
    if (data.viewer.permissions.manage_templates) {
      tabs.push("templates");
    }
    if (data.notifications) {
      tabs.push("notifications");
    }
    return tabs;
  }, [data.notifications, data.viewer.permissions.manage_roles, data.viewer.permissions.manage_templates]);

  useEffect(() => {
    if (!availableTabs.includes(activeTab)) {
      setActiveTab("timeline");
    }
  }, [activeTab, availableTabs]);

  const stats = [
    {
      label: t("stats.managedRoles"),
      value: data.managed_roles.length,
      icon: ShieldCheck,
    },
    {
      label: t("stats.templates"),
      value: data.templates.length,
      icon: Sparkles,
    },
    {
      label: t("stats.rules"),
      value: data.notifications?.rules.length ?? 0,
      icon: Bell,
    },
  ];
  const roleLabel = formatUserRoleLabel(data.viewer.role, locale);

  const focusDate = month === todayJstMonth() ? todayJstDate() : data.timeline.timeline[0]?.date ?? null;

  function setMonth(nextMonth: string) {
    const params = new URLSearchParams();
    params.set("month", nextMonth);
    router.push(`${pathname}?${params.toString()}`);
  }

  function openQuickCreate() {
    const date = month === todayJstMonth() ? todayJstDate() : data.timeline.timeline[0]?.date ?? todayJstDate();
    const roundedNow = Math.min(1380, Math.ceil(minutesFromMidnight(new Date()) / 30) * 30);
    setDraft({
      mode: "create",
      selection: {
        startDate: date,
        startMinutes: roundedNow,
        endDate: date,
        endMinutes: Math.min(1440, roundedNow + 60),
      },
    });
  }

  function handleCreateSelection(selection: DraftSelection) {
    setDraft({ mode: "create", selection });
  }

  function handleOpenEvent(event: ScheduleTimelineEvent) {
    setDraft({ mode: "edit", event });
  }

  async function runMutation(action: () => Promise<{ error?: string }>, successMessage: string) {
    setPending(true);
    try {
      const result = await action();
      if (result.error) {
        throw new Error(result.error);
      }
      toast.success(successMessage);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function handleEventSave(payload: ScheduleEventPayload, eventId?: string) {
    await runMutation(
      () => (eventId ? updateScheduleEventAction(eventId, payload) : createScheduleEventAction(payload)),
      eventId ? t("toast.eventUpdated") : t("toast.eventCreated"),
    );
  }

  async function handleEventDelete(eventId: string) {
    await runMutation(() => deleteScheduleEventAction(eventId), t("toast.eventDeleted"));
  }

  async function handleRoleSave(payload: ScheduleRolePayload, roleId?: string) {
    await runMutation(
      () => (roleId ? updateScheduleRoleAction(roleId, payload) : createScheduleRoleAction(payload)),
      roleId ? t("toast.roleUpdated") : t("toast.roleCreated"),
    );
  }

  async function handleRoleDelete(roleId: string) {
    await runMutation(() => deleteScheduleRoleAction(roleId), t("toast.roleDeleted"));
  }

  async function handleTemplateSave(payload: ScheduleTemplatePayload, templateId?: string) {
    await runMutation(
      () => (templateId ? updateScheduleTemplateAction(templateId, payload) : createScheduleTemplateAction(payload)),
      templateId ? t("toast.templateUpdated") : t("toast.templateCreated"),
    );
  }

  async function handleTemplateDelete(templateId: string) {
    await runMutation(() => deleteScheduleTemplateAction(templateId), t("toast.templateDeleted"));
  }

  async function handleSaveWebhook(webhookUrl: string) {
    await runMutation(() => saveScheduleWebhookAction(webhookUrl), t("toast.webhookSaved"));
  }

  async function handleDeleteWebhook() {
    await runMutation(() => deleteScheduleWebhookAction(), t("toast.webhookDeleted"));
  }

  async function handleRuleSave(payload: ScheduleNotificationRulePayload, ruleId?: string) {
    await runMutation(
      () => (ruleId ? updateScheduleNotificationRuleAction(ruleId, payload) : createScheduleNotificationRuleAction(payload)),
      ruleId ? t("toast.ruleUpdated") : t("toast.ruleCreated"),
    );
  }

  async function handleRuleDelete(ruleId: string) {
    await runMutation(() => deleteScheduleNotificationRuleAction(ruleId), t("toast.ruleDeleted"));
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-primary/15 bg-[linear-gradient(135deg,rgba(16,185,129,0.08),rgba(14,165,233,0.06),rgba(15,23,42,0.03))] p-6 shadow-sm">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground backdrop-blur">
              <CalendarDays className="h-4 w-4 text-primary" />
              {t("hero.eyebrow")}
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{formatMonthLabelForLocale(month, locale)}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                {t("hero.description")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-background/80 px-3 py-1 text-foreground/80">
                {t("hero.signedInAs", { name: data.viewer.discord_display_name })}
              </span>
              <span className="rounded-full bg-background/80 px-3 py-1 text-foreground/80">{t("hero.role", { role: roleLabel })}</span>
              {data.viewer.permissions.manage_events ? <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">{t("hero.manageEvents")}</span> : null}
              {data.viewer.permissions.view_restricted_events ? <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-cyan-700 dark:text-cyan-300">{t("hero.restrictedAccess")}</span> : null}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 rounded-full border border-border bg-background/80 p-1 backdrop-blur">
              <button
                type="button"
                onClick={() => setMonth(addMonths(month, -1))}
                className="rounded-full p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                aria-label={t("hero.previousMonth")}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setMonth(todayJstMonth())}
                className="rounded-full px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent"
              >
                {t("hero.currentMonth")}
              </button>
              <button
                type="button"
                onClick={() => setMonth(addMonths(month, 1))}
                className="rounded-full p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                aria-label={t("hero.nextMonth")}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={openQuickCreate}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              {t("hero.newEntry")}
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-[1.5rem] border border-border bg-background/75 p-4 backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{item.label}</p>
                    <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{item.value}</p>
                  </div>
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        {availableTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={[
              "rounded-full px-4 py-2 text-sm font-medium transition",
              activeTab === tab ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
            ].join(" ")}
          >
            {t(`tabs.${tab}`)}
          </button>
        ))}
      </section>

      {activeTab === "timeline" ? (
        <TimelineBoard
          days={data.timeline.timeline}
          focusDate={focusDate}
          onCreateSelection={handleCreateSelection}
          onOpenEvent={handleOpenEvent}
        />
      ) : null}

      {activeTab === "roles" ? (
        <RolePanel roles={data.managed_roles} pending={pending} onSave={handleRoleSave} onDelete={handleRoleDelete} />
      ) : null}

      {activeTab === "templates" ? (
        <TemplatePanel templates={data.templates} pending={pending} onSave={handleTemplateSave} onDelete={handleTemplateDelete} />
      ) : null}

      {activeTab === "notifications" && data.notifications ? (
        <NotificationPanel
          state={data.notifications}
          pending={pending}
          onSaveWebhook={handleSaveWebhook}
          onDeleteWebhook={handleDeleteWebhook}
          onSaveRule={handleRuleSave}
          onDeleteRule={handleRuleDelete}
        />
      ) : null}

      <EventEditor
        viewer={data.viewer}
        roles={data.managed_roles}
        templates={data.templates}
        draft={draft}
        pending={pending}
        onClose={() => setDraft(null)}
        onSave={handleEventSave}
        onDelete={handleEventDelete}
      />
    </div>
  );
}
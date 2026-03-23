import { apiClient } from "./client";
import type {
  ScheduleBootstrapResponse,
  ScheduleEventPayload,
  ScheduleManagedRole,
  ScheduleNotificationRule,
  ScheduleNotificationRulePayload,
  ScheduleNotificationState,
  ScheduleRolePayload,
  ScheduleTemplate,
  ScheduleTemplatePayload,
  ScheduleTimelineEvent,
} from "./types";

export async function getScheduleBootstrap(params: { from: string; days: number }): Promise<ScheduleBootstrapResponse> {
  const searchParams = new URLSearchParams({
    from: params.from,
    days: String(params.days),
  });

  return apiClient(`/api/v1/internal/schedule/bootstrap?${searchParams.toString()}`, {
    cache: "no-store",
    withCookies: true,
    timeout: 20_000,
  });
}

export async function createScheduleEvent(payload: ScheduleEventPayload): Promise<ScheduleTimelineEvent> {
  return apiClient("/api/v1/internal/schedule/events", {
    method: "POST",
    body: JSON.stringify(payload),
    cache: "no-store",
    withCookies: true,
  });
}

export async function updateScheduleEvent(eventId: string, payload: ScheduleEventPayload): Promise<ScheduleTimelineEvent> {
  return apiClient(`/api/v1/internal/schedule/events/${encodeURIComponent(eventId)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    cache: "no-store",
    withCookies: true,
  });
}

export async function deleteScheduleEvent(eventId: string): Promise<void> {
  return apiClient(`/api/v1/internal/schedule/events/${encodeURIComponent(eventId)}`, {
    method: "DELETE",
    cache: "no-store",
    withCookies: true,
  });
}

export async function createScheduleRole(payload: ScheduleRolePayload): Promise<ScheduleManagedRole> {
  return apiClient("/api/v1/internal/schedule/roles", {
    method: "POST",
    body: JSON.stringify(payload),
    cache: "no-store",
    withCookies: true,
  });
}

export async function updateScheduleRole(roleId: string, payload: ScheduleRolePayload): Promise<ScheduleManagedRole> {
  return apiClient(`/api/v1/internal/schedule/roles/${encodeURIComponent(roleId)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    cache: "no-store",
    withCookies: true,
  });
}

export async function deleteScheduleRole(roleId: string): Promise<void> {
  return apiClient(`/api/v1/internal/schedule/roles/${encodeURIComponent(roleId)}`, {
    method: "DELETE",
    cache: "no-store",
    withCookies: true,
  });
}

export async function createScheduleTemplate(payload: ScheduleTemplatePayload): Promise<ScheduleTemplate> {
  return apiClient("/api/v1/internal/schedule/templates", {
    method: "POST",
    body: JSON.stringify(payload),
    cache: "no-store",
    withCookies: true,
  });
}

export async function updateScheduleTemplate(templateId: string, payload: ScheduleTemplatePayload): Promise<ScheduleTemplate> {
  return apiClient(`/api/v1/internal/schedule/templates/${encodeURIComponent(templateId)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    cache: "no-store",
    withCookies: true,
  });
}

export async function deleteScheduleTemplate(templateId: string): Promise<void> {
  return apiClient(`/api/v1/internal/schedule/templates/${encodeURIComponent(templateId)}`, {
    method: "DELETE",
    cache: "no-store",
    withCookies: true,
  });
}

export async function saveScheduleWebhook(webhookUrl: string): Promise<ScheduleNotificationState> {
  return apiClient("/api/v1/internal/schedule/notifications/webhook", {
    method: "PUT",
    body: JSON.stringify({ webhook_url: webhookUrl }),
    cache: "no-store",
    withCookies: true,
  });
}

export async function deleteScheduleWebhook(): Promise<void> {
  return apiClient("/api/v1/internal/schedule/notifications/webhook", {
    method: "DELETE",
    cache: "no-store",
    withCookies: true,
  });
}

export async function createScheduleNotificationRule(payload: ScheduleNotificationRulePayload): Promise<ScheduleNotificationRule> {
  return apiClient("/api/v1/internal/schedule/notifications/rules", {
    method: "POST",
    body: JSON.stringify(payload),
    cache: "no-store",
    withCookies: true,
  });
}

export async function updateScheduleNotificationRule(
  ruleId: string,
  payload: ScheduleNotificationRulePayload,
): Promise<ScheduleNotificationRule> {
  return apiClient(`/api/v1/internal/schedule/notifications/rules/${encodeURIComponent(ruleId)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    cache: "no-store",
    withCookies: true,
  });
}

export async function deleteScheduleNotificationRule(ruleId: string): Promise<void> {
  return apiClient(`/api/v1/internal/schedule/notifications/rules/${encodeURIComponent(ruleId)}`, {
    method: "DELETE",
    cache: "no-store",
    withCookies: true,
  });
}
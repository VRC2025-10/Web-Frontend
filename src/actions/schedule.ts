"use server";

import { revalidatePath } from "next/cache";
import { rethrowIfNextControlFlow } from "@/lib/next-control-flow";
import {
  createScheduleEvent,
  createScheduleNotificationRule,
  createScheduleRole,
  createScheduleTemplate,
  deleteScheduleEvent,
  deleteScheduleNotificationRule,
  deleteScheduleRole,
  deleteScheduleTemplate,
  deleteScheduleWebhook,
  saveScheduleWebhook,
  updateScheduleEvent,
  updateScheduleNotificationRule,
  updateScheduleRole,
  updateScheduleTemplate,
} from "@/lib/api/schedule";
import type {
  ScheduleEventPayload,
  ScheduleNotificationRulePayload,
  ScheduleRolePayload,
  ScheduleTemplatePayload,
} from "@/lib/api/types";

function refreshSchedulePaths() {
  revalidatePath("/schedule");
}

export async function createScheduleEventAction(payload: ScheduleEventPayload) {
  try {
    await createScheduleEvent(payload);
    refreshSchedulePaths();
    return { success: true };
  } catch (err) {
    rethrowIfNextControlFlow(err);
    return { error: err instanceof Error ? err.message : "Failed to create schedule event" };
  }
}

export async function updateScheduleEventAction(eventId: string, payload: ScheduleEventPayload) {
  try {
    await updateScheduleEvent(eventId, payload);
    refreshSchedulePaths();
    return { success: true };
  } catch (err) {
    rethrowIfNextControlFlow(err);
    return { error: err instanceof Error ? err.message : "Failed to update schedule event" };
  }
}

export async function deleteScheduleEventAction(eventId: string) {
  try {
    await deleteScheduleEvent(eventId);
    refreshSchedulePaths();
    return { success: true };
  } catch (err) {
    rethrowIfNextControlFlow(err);
    return { error: err instanceof Error ? err.message : "Failed to delete schedule event" };
  }
}

export async function createScheduleRoleAction(payload: ScheduleRolePayload) {
  try {
    await createScheduleRole(payload);
    refreshSchedulePaths();
    return { success: true };
  } catch (err) {
    rethrowIfNextControlFlow(err);
    return { error: err instanceof Error ? err.message : "Failed to create managed role" };
  }
}

export async function updateScheduleRoleAction(roleId: string, payload: ScheduleRolePayload) {
  try {
    await updateScheduleRole(roleId, payload);
    refreshSchedulePaths();
    return { success: true };
  } catch (err) {
    rethrowIfNextControlFlow(err);
    return { error: err instanceof Error ? err.message : "Failed to update managed role" };
  }
}

export async function deleteScheduleRoleAction(roleId: string) {
  try {
    await deleteScheduleRole(roleId);
    refreshSchedulePaths();
    return { success: true };
  } catch (err) {
    rethrowIfNextControlFlow(err);
    return { error: err instanceof Error ? err.message : "Failed to delete managed role" };
  }
}

export async function createScheduleTemplateAction(payload: ScheduleTemplatePayload) {
  try {
    await createScheduleTemplate(payload);
    refreshSchedulePaths();
    return { success: true };
  } catch (err) {
    rethrowIfNextControlFlow(err);
    return { error: err instanceof Error ? err.message : "Failed to create template" };
  }
}

export async function updateScheduleTemplateAction(templateId: string, payload: ScheduleTemplatePayload) {
  try {
    await updateScheduleTemplate(templateId, payload);
    refreshSchedulePaths();
    return { success: true };
  } catch (err) {
    rethrowIfNextControlFlow(err);
    return { error: err instanceof Error ? err.message : "Failed to update template" };
  }
}

export async function deleteScheduleTemplateAction(templateId: string) {
  try {
    await deleteScheduleTemplate(templateId);
    refreshSchedulePaths();
    return { success: true };
  } catch (err) {
    rethrowIfNextControlFlow(err);
    return { error: err instanceof Error ? err.message : "Failed to delete template" };
  }
}

export async function saveScheduleWebhookAction(webhookUrl: string) {
  try {
    await saveScheduleWebhook(webhookUrl);
    refreshSchedulePaths();
    return { success: true };
  } catch (err) {
    rethrowIfNextControlFlow(err);
    return { error: err instanceof Error ? err.message : "Failed to save webhook" };
  }
}

export async function deleteScheduleWebhookAction() {
  try {
    await deleteScheduleWebhook();
    refreshSchedulePaths();
    return { success: true };
  } catch (err) {
    rethrowIfNextControlFlow(err);
    return { error: err instanceof Error ? err.message : "Failed to delete webhook" };
  }
}

export async function createScheduleNotificationRuleAction(payload: ScheduleNotificationRulePayload) {
  try {
    await createScheduleNotificationRule(payload);
    refreshSchedulePaths();
    return { success: true };
  } catch (err) {
    rethrowIfNextControlFlow(err);
    return { error: err instanceof Error ? err.message : "Failed to create notification rule" };
  }
}

export async function updateScheduleNotificationRuleAction(ruleId: string, payload: ScheduleNotificationRulePayload) {
  try {
    await updateScheduleNotificationRule(ruleId, payload);
    refreshSchedulePaths();
    return { success: true };
  } catch (err) {
    rethrowIfNextControlFlow(err);
    return { error: err instanceof Error ? err.message : "Failed to update notification rule" };
  }
}

export async function deleteScheduleNotificationRuleAction(ruleId: string) {
  try {
    await deleteScheduleNotificationRule(ruleId);
    refreshSchedulePaths();
    return { success: true };
  } catch (err) {
    rethrowIfNextControlFlow(err);
    return { error: err instanceof Error ? err.message : "Failed to delete notification rule" };
  }
}
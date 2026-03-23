"use server";

import { apiClient } from "@/lib/api/client";
import { rethrowIfNextControlFlow } from "@/lib/next-control-flow";
import { ReportFormSchema } from "@/lib/validations/report";
import type { ReportTargetType } from "@/lib/api/types";

export async function submitReportAction(
  targetType: ReportTargetType,
  targetId: string,
  reason: string
) {
  const parsed = ReportFormSchema.safeParse({
    target_type: targetType,
    target_id: targetId,
    reason,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await apiClient("/api/v1/internal/reports", {
      method: "POST",
      withCookies: true,
      body: JSON.stringify(parsed.data),
    });
    return { success: true };
  } catch (err) {
    rethrowIfNextControlFlow(err);
    return {
      error: err instanceof Error ? err.message : "Failed to submit report",
    };
  }
}

"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireMe } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { rethrowIfNextControlFlow } from "@/lib/next-control-flow";
import { updateMyProfile } from "@/lib/api/profile";
import { ProfileFormSchema } from "@/lib/validations/profile";

export async function updateProfileAction(formData: unknown) {
  const parsed = ProfileFormSchema.safeParse(formData);
  if (!parsed.success) {
    const details = parsed.error.flatten();
    const fieldMessage = Object.entries(details.fieldErrors)
      .flatMap(([field, messages]) =>
        (messages ?? []).map((message) => `${field}: ${message}`)
      )
      .join("; ");

    return {
      error: fieldMessage || "Validation failed",
      details,
    };
  }

  try {
    await updateMyProfile(parsed.data);
    const me = await requireMe();
    revalidatePath("/settings/profile");
    revalidatePath("/members");
    revalidatePath(`/members/${me.discord_id}`);
    revalidateTag("members", "max");
    revalidateTag(`member-${me.discord_id}`, "max");
    return { success: true };
  } catch (err) {
    rethrowIfNextControlFlow(err);

    if (err instanceof ApiError) {
      console.error("updateProfileAction failed", {
        status: err.status,
        code: err.code,
        message: err.message,
      });
      return {
        error: err.message ? `${err.message} (${err.code})` : `Failed to update profile (${err.code})`,
      };
    }

    return { error: err instanceof Error ? err.message : "Failed to update profile" };
  }
}

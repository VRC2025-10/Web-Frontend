"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireMe } from "@/lib/api/auth";
import { rethrowIfNextControlFlow } from "@/lib/next-control-flow";
import { updateMyProfile } from "@/lib/api/profile";
import { ProfileFormSchema } from "@/lib/validations/profile";

export async function updateProfileAction(formData: unknown) {
  const parsed = ProfileFormSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: "Validation failed", details: parsed.error.flatten() };
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
    return { error: err instanceof Error ? err.message : "Failed to update profile" };
  }
}

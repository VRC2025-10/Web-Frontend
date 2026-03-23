"use server";

import { revalidatePath } from "next/cache";
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
    revalidatePath("/settings/profile");
    revalidatePath("/members");
    return { success: true };
  } catch (err) {
    rethrowIfNextControlFlow(err);
    return { error: err instanceof Error ? err.message : "Failed to update profile" };
  }
}

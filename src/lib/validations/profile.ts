import { z } from "zod";

const VRC_ID_PATTERN = /^usr_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const X_ID_PATTERN = /^[a-zA-Z0-9_]{1,15}$/;

function nullableStringInput() {
  return z.preprocess((value) => {
    if (value == null) {
      return "";
    }

    return value;
  }, z.string());
}

function nullableTrimmedStringInput() {
  return nullableStringInput().pipe(z.string().trim());
}

function toNullableTrimmedValue(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export const ProfileFormSchema = z.object({
  vrc_id: nullableTrimmedStringInput()
    .refine((value) => value === "" || VRC_ID_PATTERN.test(value), {
      message: "Invalid VRChat ID format",
    })
    .transform(toNullableTrimmedValue),
  x_id: nullableTrimmedStringInput()
    .transform((value) => value.replace(/^@/, ""))
    .refine((value) => value === "" || X_ID_PATTERN.test(value), {
      message: "Invalid X (Twitter) ID format",
    })
    .transform((value) => (value === "" ? null : value)),
  bio_markdown: nullableStringInput()
    .pipe(z.string().max(2000, "Bio must be 2000 characters or less"))
    .transform((value) => (value.trim().length === 0 ? null : value)),
  is_public: z.boolean(),
});

export type ProfileFormValues = z.infer<typeof ProfileFormSchema>;

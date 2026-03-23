import { z } from "zod";

export const ProfileFormSchema = z.object({
  vrc_id: z
    .string()
    .max(100, "VRChat ID must be 100 characters or less")
    .optional()
    .or(z.literal(""))
    .transform((val) => val || null),
  short_bio: z
    .string()
    .max(100, "Short bio must be 100 characters or less")
    .optional()
    .or(z.literal("")),
  x_id: z
    .string()
    .max(16, "X ID must be 16 characters or less")
    .regex(/^@?[a-zA-Z0-9_]{0,15}$/, "Invalid X (Twitter) ID format")
    .optional()
    .or(z.literal(""))
    .transform((val) => val || null),
  bio_markdown: z
    .string()
    .min(1, "Bio is required")
    .max(5000, "Bio must be 5000 characters or less"),
  is_public: z.boolean(),
});

export type ProfileFormValues = z.infer<typeof ProfileFormSchema>;

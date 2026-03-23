import { z } from "zod";

export const ReportFormSchema = z.object({
  target_type: z.enum(["profile", "event"], {
    message: "Target type is required",
  }),
  target_id: z.string().uuid("Invalid target ID"),
  reason: z
    .string()
    .min(10, "Reason must be at least 10 characters")
    .max(1000, "Reason must be 1000 characters or less"),
});

export type ReportFormValues = z.infer<typeof ReportFormSchema>;

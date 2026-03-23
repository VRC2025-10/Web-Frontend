import { z } from "zod";

export const UserRoleChangeSchema = z.object({
  new_role: z.enum(["member", "staff", "admin", "super_admin"], {
    message: "Role is required",
  }),
});

export type UserRoleChangeValues = z.infer<typeof UserRoleChangeSchema>;

export const GalleryStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"], {
    message: "Status is required",
  }),
});

export type GalleryStatusValues = z.infer<typeof GalleryStatusSchema>;

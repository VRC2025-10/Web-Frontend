import type { UserRole } from "@/lib/api/types";

const ROLE_LABELS: Record<UserRole, { ja: string; en: string }> = {
  member: { ja: "メンバー", en: "Member" },
  staff: { ja: "スタッフ", en: "Staff" },
  admin: { ja: "管理者", en: "Admin" },
  super_admin: { ja: "スーパー管理者", en: "Super Admin" },
};

export function formatUserRoleLabel(role: UserRole, locale: string): string {
  const labels = ROLE_LABELS[role];
  return locale.startsWith("ja") ? labels.ja : labels.en;
}
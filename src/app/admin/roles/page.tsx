import { forbidden } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { AdminRolePanel } from "@/components/features/admin/admin-role-panel";
import { SectionHeader } from "@/components/shared/section-header";
import { getAdminRoles, getAdminSystemRolePolicies } from "@/lib/api/admin";
import { requireMe } from "@/lib/api/auth";
import type { AdminManagedRole, AdminSystemRolePolicy } from "@/lib/api/types";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.roles.page");

  return {
    title: t("title"),
    robots: { index: false, follow: false },
  };
}

export default async function AdminRolesPage() {
  const [me, t] = await Promise.all([requireMe(), getTranslations("admin.roles")]);
  if (!me.admin_permissions.manage_roles) {
    forbidden();
  }

  let roles: AdminManagedRole[];
  let systemRoles: AdminSystemRolePolicy[];
  try {
    [roles, systemRoles] = await Promise.all([getAdminRoles(), getAdminSystemRolePolicies()]);
  } catch {
    roles = [];
    systemRoles = [];
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t("page.title")}
        description={t("page.description")}
      />
      <AdminRolePanel roles={roles} systemRoles={systemRoles} />
    </div>
  );
}
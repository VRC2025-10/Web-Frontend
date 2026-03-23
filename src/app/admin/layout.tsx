import { requireMe } from "@/lib/api/auth";
import { getTranslations } from "next-intl/server";
import { forbidden } from "next/navigation";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminHeader } from "@/components/layout/admin-header";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [me, tAdmin] = await Promise.all([
    requireMe(),
    getTranslations("admin"),
  ]);
  if (!me.admin_access) {
    forbidden();
  }

  const roleLabel = tAdmin(`roleNames.${me.role}`);

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar permissions={me.admin_permissions} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader permissions={me.admin_permissions} roleLabel={roleLabel} backToSiteLabel={tAdmin("backToSite")} />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

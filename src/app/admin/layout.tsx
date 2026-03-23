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
  if (!["staff", "admin", "super_admin"].includes(me.role)) {
    forbidden();
  }

  const roleLabel = me.role.replace(/_/g, " ");

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar userRole={me.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader userRole={me.role} roleLabel={roleLabel} backToSiteLabel={tAdmin("backToSite")} />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

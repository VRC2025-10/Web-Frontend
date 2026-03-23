"use client";

import { usePathname } from "next/navigation";
import { AdminNavPanel } from "@/components/layout/admin-nav";
import type { AdminPermissionSet } from "@/lib/api/types";

interface AdminSidebarProps {
  permissions: AdminPermissionSet;
}

export function AdminSidebar({ permissions }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden bg-card lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-border">
      <div className="flex flex-1 flex-col p-4">
        <AdminNavPanel permissions={permissions} pathname={pathname} />
      </div>
    </aside>
  );
}

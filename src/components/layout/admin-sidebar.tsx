"use client";

import { usePathname } from "next/navigation";
import { AdminNavPanel } from "@/components/layout/admin-nav";

interface AdminSidebarProps {
  userRole: string;
}

export function AdminSidebar({ userRole }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden bg-card lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-border">
      <div className="flex flex-1 flex-col p-4">
        <AdminNavPanel userRole={userRole} pathname={pathname} />
      </div>
    </aside>
  );
}

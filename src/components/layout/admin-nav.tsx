"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Flag,
  ImageIcon,
  LayoutDashboard,
  Shield,
  Tag,
  Users,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  staffVisible: boolean;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, staffVisible: true },
  { href: "/admin/users", label: "Users", icon: Users, staffVisible: false },
  { href: "/admin/galleries", label: "Galleries", icon: ImageIcon, staffVisible: true },
  { href: "/admin/events", label: "Events", icon: Calendar, staffVisible: false },
  { href: "/admin/tags", label: "Tags", icon: Tag, staffVisible: false },
  { href: "/admin/reports", label: "Reports", icon: Flag, staffVisible: false },
  { href: "/admin/clubs", label: "Clubs", icon: Building2, staffVisible: false },
];

export function getVisibleAdminItems(role: string): AdminNavItem[] {
  if (role === "admin" || role === "super_admin") {
    return ADMIN_NAV_ITEMS;
  }

  return ADMIN_NAV_ITEMS.filter((item) => item.staffVisible);
}

export function getAdminSectionLabel(pathname: string): string {
  const match = [...ADMIN_NAV_ITEMS]
    .sort((left, right) => right.href.length - left.href.length)
    .find((item) => (item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href)));

  return match?.label ?? "Admin";
}

export function AdminNavPanel({
  userRole,
  pathname,
  className,
}: {
  userRole: string;
  pathname: string;
  className?: string;
}) {
  const items = getVisibleAdminItems(userRole);

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <Link
        href="/admin"
        className="mb-6 flex items-center gap-3 rounded-xl border border-border px-4 py-3 transition-colors hover:bg-accent/5"
      >
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">Admin</p>
          <p className="text-xs text-muted-foreground">Control panel</p>
        </div>
      </Link>

      <nav aria-label="Admin navigation" className="flex flex-col gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-foreground/70 hover:bg-accent/10 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground/70 transition-colors hover:bg-accent/10 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to site
        </Link>
      </div>
    </div>
  );
}
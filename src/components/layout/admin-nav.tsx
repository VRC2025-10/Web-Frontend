"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Building2,
  Flag,
  ImageIcon,
  LayoutDashboard,
  Shield,
  Tag,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { AdminPermissionSet } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export interface AdminNavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  isVisible: (permissions: AdminPermissionSet) => boolean;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin", labelKey: "dashboard", icon: LayoutDashboard, isVisible: (permissions) => permissions.view_dashboard },
  { href: "/admin/users", labelKey: "users", icon: Users, isVisible: (permissions) => permissions.manage_users },
  { href: "/admin/roles", labelKey: "roles", icon: Shield, isVisible: (permissions) => permissions.manage_roles },
  { href: "/admin/galleries", labelKey: "galleries", icon: ImageIcon, isVisible: (permissions) => permissions.manage_galleries },
  { href: "/admin/tags", labelKey: "tags", icon: Tag, isVisible: (permissions) => permissions.manage_tags },
  { href: "/admin/reports", labelKey: "reports", icon: Flag, isVisible: (permissions) => permissions.manage_reports },
  { href: "/admin/clubs", labelKey: "clubs", icon: Building2, isVisible: (permissions) => permissions.manage_clubs },
];

export function getVisibleAdminItems(permissions: AdminPermissionSet): AdminNavItem[] {
  return ADMIN_NAV_ITEMS.filter((item) => item.isVisible(permissions));
}

export function getAdminSectionLabel(pathname: string): string {
  const match = [...ADMIN_NAV_ITEMS]
    .sort((left, right) => right.href.length - left.href.length)
    .find((item) => (item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href)));

  return match?.labelKey ?? "title";
}

export function AdminNavPanel({
  permissions,
  pathname,
  className,
}: {
  permissions: AdminPermissionSet;
  pathname: string;
  className?: string;
}) {
  const t = useTranslations("admin.nav");
  const items = getVisibleAdminItems(permissions);

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
          <p className="text-sm font-semibold">{t("title")}</p>
          <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
        </div>
      </Link>

      <nav aria-label={t("ariaLabel")} className="flex flex-col gap-1">
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
              {t(item.labelKey)}
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
          {t("backToSite")}
        </Link>
      </div>
    </div>
  );
}
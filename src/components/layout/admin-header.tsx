"use client";

import Link from "next/link";
import { ArrowLeft, Menu, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AdminNavPanel, getAdminSectionLabel } from "@/components/layout/admin-nav";
import type { AdminPermissionSet } from "@/lib/api/types";

interface AdminHeaderProps {
  permissions: AdminPermissionSet;
  roleLabel: string;
  backToSiteLabel: string;
}

export function AdminHeader({ permissions, roleLabel, backToSiteLabel }: AdminHeaderProps) {
  const pathname = usePathname();
  const tNav = useTranslations("admin.nav");
  const sectionLabel = tNav(getAdminSectionLabel(pathname));

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open admin menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="border-b border-border px-4 py-4 text-left">
                <SheetTitle>{tNav("title")}</SheetTitle>
              </SheetHeader>
              <div className="h-full p-4">
                <AdminNavPanel permissions={permissions} pathname={pathname} />
              </div>
            </SheetContent>
          </Sheet>

          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
              {tNav("title")}
            </div>
            <p className="truncate text-lg font-bold md:text-xl">{sectionLabel}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {backToSiteLabel}
            </Link>
          </Button>
          <div className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium capitalize text-muted-foreground">
            {roleLabel}
          </div>
        </div>
      </div>
    </header>
  );
}
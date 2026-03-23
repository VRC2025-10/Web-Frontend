import { getAdminStats } from "@/lib/api/admin";
import { requireMe } from "@/lib/api/auth";
import { StatCard } from "@/components/features/admin/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  Users,
  CalendarDays,
  Image as ImageIcon,
  Flag,
  ArrowRight,
  ShieldAlert,
  Building2,
  type LucideIcon,
} from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import type { AdminStats } from "@/lib/api/types";
import type { Metadata } from "next";
import { forbidden } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.dashboard");

  return {
    title: t("title"),
    robots: { index: false, follow: false },
  };
}

export default async function AdminDashboardPage() {
  const [locale, t, me] = await Promise.all([
    getLocale(),
    getTranslations("admin.dashboard"),
    requireMe(),
  ]);
  if (!me.admin_permissions.view_dashboard) {
    forbidden();
  }

  let stats: AdminStats;
  try {
    stats = await getAdminStats();
  } catch {
    stats = { total_users: 0, total_events: 0, total_clubs: 0, pending_reports: 0 };
  }

  const numberFormatter = new Intl.NumberFormat(locale);

  const statItems: Array<{
    icon: LucideIcon;
    label: string;
    value: string;
    hint: string;
    className?: string;
    iconClassName?: string;
  }> = [
    {
      icon: Users,
      label: t("totalUsers"),
      value: numberFormatter.format(stats.total_users),
      hint: t("hints.totalUsers"),
    },
    {
      icon: Building2,
      label: t("totalClubs"),
      value: numberFormatter.format(stats.total_clubs),
      hint: t("hints.totalClubs"),
      iconClassName: "bg-[rgba(212,168,67,0.18)] text-[hsl(40_90%_40%)] dark:text-[hsl(40_90%_65%)]",
    },
    {
      icon: Flag,
      label: t("pendingReports"),
      value: numberFormatter.format(stats.pending_reports),
      hint: stats.pending_reports > 0 ? t("hints.pendingReportsActive") : t("hints.pendingReportsClear"),
      iconClassName: "bg-destructive/12 text-destructive",
    },
  ];

  const actionItems = [
    {
      href: "/admin/users",
      icon: Users,
      title: t("actions.membersTitle"),
      description: t("actions.membersDescription"),
      stat: numberFormatter.format(stats.total_users),
      visible: me.admin_permissions.manage_users,
    },
    {
      href: "/schedule",
      icon: CalendarDays,
      title: t("actions.scheduleTitle"),
      description: t("actions.scheduleDescription"),
      stat: t("actions.scheduleStat"),
      visible: me.schedule_access,
    },
    {
      href: "/admin/galleries",
      icon: ImageIcon,
      title: t("actions.galleryTitle"),
      description: t("actions.galleryDescription"),
      stat: numberFormatter.format(stats.total_clubs),
      visible: me.admin_permissions.manage_galleries,
    },
    {
      href: "/admin/reports",
      icon: ShieldAlert,
      title: t("actions.reportsTitle"),
      description: t("actions.reportsDescription"),
      stat: numberFormatter.format(stats.pending_reports),
      visible: me.admin_permissions.manage_reports,
    },
    {
      href: "/admin/roles",
      icon: ShieldAlert,
      title: t("actions.rolesTitle"),
      description: t("actions.rolesDescription"),
      stat: me.admin_permissions.manage_roles ? t("actions.rolesStatActive") : t("actions.rolesStatLocked"),
      visible: me.admin_permissions.manage_roles,
    },
  ].filter((item) => item.visible);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground md:text-base">{t("heroDescription")}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/admin/reports">
              <ShieldAlert className="mr-2 h-4 w-4" />
              {t("ctaReports")}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/galleries">
              <ImageIcon className="mr-2 h-4 w-4" />
              {t("ctaGallery")}
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statItems.map((item) => (
          <StatCard
            key={item.label}
            icon={item.icon}
            label={item.label}
            value={item.value}
            hint={item.hint}
            className={item.className}
            iconClassName={item.iconClassName}
          />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <div>
              <CardTitle className="text-xl">{t("actionsTitle")}</CardTitle>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("actionsDescription")}</p>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {actionItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-xl border border-border bg-background p-4 transition-colors hover:border-primary/30 hover:bg-accent/5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="inline-flex rounded-lg bg-primary/10 p-2 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h2 className="mt-4 text-lg font-semibold">{item.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                  <div className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary/70">{item.stat}</div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">{t("pulseTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border bg-background p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{t("pulsePrimaryLabel")}</div>
              <p className="mt-2 text-sm leading-6 text-foreground/80">
                {stats.pending_reports > 0
                  ? t("pulsePrimaryAlert", { count: numberFormatter.format(stats.pending_reports) })
                  : t("pulsePrimaryCalm")}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{t("pulseTertiaryLabel")}</div>
              <p className="mt-2 text-sm leading-6 text-foreground/80">{t("pulseTertiaryText", { count: numberFormatter.format(stats.total_clubs) })}</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

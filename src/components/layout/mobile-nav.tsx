"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Sun,
  Moon,
  Home,
  CalendarDays,
  Users,
  Building2,
  LogOut,
  Settings,
  User,
  Shield,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { logoutAction } from "@/actions/auth";
import type { AuthMe } from "@/lib/api/types";
import { formatUserRoleLabel } from "@/lib/role-labels";
import { SITE_NAME } from "@/lib/site";

interface MobileNavProps {
  user: AuthMe | null;
}

const baseNavLinks = [
  { href: "/", labelKey: "home", icon: Home },
  { href: "/members", labelKey: "members", icon: Users },
  { href: "/clubs", labelKey: "clubs", icon: Building2 },
] as const;

function getProfileHref(user: AuthMe) {
  return user.profile?.is_public ? `/members/${user.discord_id}` : "/settings/profile";
}

export function MobileNav({ user }: MobileNavProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const tNav = useTranslations("nav");
  const tTheme = useTranslations("theme");
  const { setTheme, resolvedTheme } = useTheme();
  const navLinks = user?.schedule_access
    ? [...baseNavLinks, { href: "/schedule", labelKey: "schedule", icon: CalendarDays }]
    : baseNavLinks;

  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  function toggleLocale() {
    const current = document.cookie
      .split("; ")
      .find((c) => c.startsWith("NEXT_LOCALE="))
      ?.split("=")[1];
    const next = current === "en" ? "ja" : "en";
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000`;
    window.location.reload();
  }

  function currentLocale() {
    if (typeof document === "undefined") return "JA";
    const c = document.cookie
      .split("; ")
      .find((c) => c.startsWith("NEXT_LOCALE="))
      ?.split("=")[1];
    return c === "en" ? "EN" : "JA";
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <SheetContent
      side="right"
      className="w-80 flex flex-col"
      aria-describedby={undefined}
    >
      <SheetHeader className="px-2">
        <SheetTitle className="sr-only">{tNav("mobileMenu")}</SheetTitle>
        <SheetClose asChild>
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="" width={28} height={28} className="rounded-md" aria-hidden="true" />
            <span className="font-heading font-bold text-lg">{SITE_NAME}</span>
          </Link>
        </SheetClose>
      </SheetHeader>

      <nav
        aria-label="Mobile navigation"
        className="flex flex-col gap-1 mt-8"
      >
        {navLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          return (
            <SheetClose key={link.href} asChild>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-base font-medium transition-colors text-foreground/70 hover:text-foreground hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  active && "bg-primary/10 text-primary"
                )}
              >
                <Icon className="h-4 w-4" />
                {tNav(link.labelKey)}
              </Link>
            </SheetClose>
          );
        })}
      </nav>

      <Separator className="my-6" />

      {/* Toggles */}
      <div className="flex flex-col gap-2 px-1">
        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl">
          <span className="text-sm font-medium">{tTheme("label")}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={resolvedTheme === "dark" ? tTheme("light") : tTheme("dark")}
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl">
          <span className="text-sm font-medium">{tNav("language")}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLocale}
            aria-label={locale === "en" ? "Switch language" : "言語を切り替え"}
            className="text-xs font-bold"
          >
            {currentLocale()}
          </Button>
        </div>
      </div>

      <Separator className="my-6" />

      {/* User section */}
      <div className="mt-auto px-1">
        {user ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 px-3 py-2.5">
              <Avatar className="w-10 h-10">
                <AvatarImage
                  src={user.avatar_url ?? undefined}
                  alt={user.discord_username ?? ""}
                />
                <AvatarFallback>
                  {user.discord_username?.charAt(0)?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{user.discord_username}</p>
                <p className="text-xs text-muted-foreground">{formatUserRoleLabel(user.role, locale)}</p>
              </div>
            </div>
            <div className="flex flex-col gap-1 mt-2">
              <SheetClose asChild>
                <Link
                  href={getProfileHref(user)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground/70 hover:bg-accent/10"
                >
                  <User className="h-4 w-4" />
                  {tNav("profile")}
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  href="/settings/profile"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground/70 hover:bg-accent/10"
                >
                  <Settings className="h-4 w-4" />
                  {tNav("settings")}
                </Link>
              </SheetClose>
              {user.schedule_access && (
                <SheetClose asChild>
                  <Link
                    href="/schedule"
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground/70 hover:bg-accent/10"
                  >
                    <CalendarDays className="h-4 w-4" />
                    {tNav("schedule")}
                  </Link>
                </SheetClose>
              )}
              {user.admin_access && (
                <SheetClose asChild>
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground/70 hover:bg-accent/10"
                  >
                    <Shield className="h-4 w-4" />
                    {tNav("admin")}
                  </Link>
                </SheetClose>
              )}
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-destructive hover:bg-accent/10"
                >
                  <LogOut className="h-4 w-4" />
                  {tNav("logout")}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <SheetClose asChild>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/login">{tNav("login")}</Link>
            </Button>
          </SheetClose>
        )}
      </div>
    </SheetContent>
  );
}

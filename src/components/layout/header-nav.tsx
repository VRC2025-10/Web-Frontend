"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { AuthMe } from "@/lib/api/types";

const baseNavLinks = [
  { href: "/", labelKey: "home" },
  { href: "/members", labelKey: "members" },
  { href: "/clubs", labelKey: "clubs" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

interface HeaderNavProps {
  user: AuthMe | null;
}

export function HeaderNav({ user }: HeaderNavProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const navLinks = user?.schedule_access
    ? [...baseNavLinks, { href: "/schedule", labelKey: "schedule" }]
    : baseNavLinks;

  return (
    <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-1">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={isActive(pathname, link.href) ? "page" : undefined}
          className={cn(
            "rounded-xl px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-accent/10 hover:text-foreground",
            isActive(pathname, link.href) && "bg-primary/10 text-primary"
          )}
        >
          {t(link.labelKey)}
        </Link>
      ))}
    </nav>
  );
}
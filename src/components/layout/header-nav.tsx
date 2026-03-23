"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/members", label: "Members" },
  { href: "/clubs", label: "Clubs" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function HeaderNav() {
  const pathname = usePathname();

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
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
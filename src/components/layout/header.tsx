import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/features/auth/user-menu";
import { HeaderFrame } from "@/components/layout/header-frame";
import { HeaderNav } from "@/components/layout/header-nav";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { MobileNavSheet } from "@/components/layout/mobile-nav-sheet";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import type { AuthMe } from "@/lib/api/types";
import { SITE_NAME } from "@/lib/site";
import { getTranslations } from "next-intl/server";

interface HeaderProps {
  user: AuthMe | null;
}

export async function Header({ user }: HeaderProps) {
  const tFooter = await getTranslations("footer");

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-background focus:px-4 focus:py-2 focus:rounded-xl"
      >
        Skip to main content
      </a>
      <HeaderFrame>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-full">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="" width={36} height={36} className="rounded-md" aria-hidden="true" />
            <span className="font-heading font-bold text-xl hidden sm:inline">{SITE_NAME}</span>
          </Link>

          <HeaderNav />

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="hidden sm:block">
              <LanguageSwitcher languageLabel={tFooter("language")} />
            </div>
            <div className="hidden lg:block">
              {user ? <UserMenu user={user} /> : (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/login">Login</Link>
                </Button>
              )}
            </div>
            <MobileNavSheet user={user} />
          </div>
        </div>
      </HeaderFrame>
    </>
  );
}

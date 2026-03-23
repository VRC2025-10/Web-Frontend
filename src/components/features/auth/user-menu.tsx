"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { CalendarDays, LogOut, User, Settings, Shield } from "lucide-react";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/actions/auth";
import type { AuthMe } from "@/lib/api/types";
import { formatUserRoleLabel } from "@/lib/role-labels";

interface UserMenuProps {
  user: AuthMe;
}

function getProfileHref(user: AuthMe): string {
  return user.profile?.is_public ? `/members/${user.discord_id}` : "/settings/profile";
}

export function UserMenu({ user }: UserMenuProps) {
  const locale = useLocale();
  const t = useTranslations("nav");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user.avatar_url ?? undefined}
              alt={user.discord_username}
            />
            <AvatarFallback>
              {user.discord_username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>{user.discord_username}</DropdownMenuLabel>
        <DropdownMenuLabel className="pt-0 text-xs font-normal text-muted-foreground">{formatUserRoleLabel(user.role, locale)}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={getProfileHref(user)}>
            <User className="mr-2 h-4 w-4" />
            {t("profile")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings/profile">
            <Settings className="mr-2 h-4 w-4" />
            {t("settings")}
          </Link>
        </DropdownMenuItem>
        {user.schedule_access && (
          <DropdownMenuItem asChild>
            <Link href="/schedule">
              <CalendarDays className="mr-2 h-4 w-4" />
              {t("schedule")}
            </Link>
          </DropdownMenuItem>
        )}
        {user.admin_access && (
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <Shield className="mr-2 h-4 w-4" />
              {t("admin")}
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <form action={logoutAction}>
            <button type="submit" className="flex w-full items-center">
              <LogOut className="mr-2 h-4 w-4" />
              {t("logout")}
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

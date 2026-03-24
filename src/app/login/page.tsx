import { LoginButton } from "@/components/features/auth/login-button";
import { LeafParticles } from "@/components/shared/leaf-particles";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";
import { getMe } from "@/lib/api/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: `Login | ${SITE_NAME}`,
  robots: { index: false, follow: false },
};

const errorKeys = ["auth_failed", "csrf_failed", "not_guild_member", "discord_error", "suspended"] as const;

export default async function LoginPage(props: {
  searchParams: Promise<{ error?: string; redirect_to?: string }>;
}) {
  const searchParams = await props.searchParams;
  const t = await getTranslations("auth");
  const tLogin = await getTranslations("auth.login");
  const user = await getMe();

  const redirectTo =
    typeof searchParams.redirect_to === "string" && searchParams.redirect_to.startsWith("/")
      ? searchParams.redirect_to
      : undefined;

  if (user) {
    redirect(redirectTo ?? "/");
  }

  const errorKey = searchParams.error;
  const errorMessage =
    errorKey && errorKeys.includes(errorKey as (typeof errorKeys)[number])
      ? t(`errors.${errorKey as (typeof errorKeys)[number]}`)
      : null;

  return (
    <>
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Left illustration panel (hidden on mobile) */}
        <div role="presentation" className="hidden md:flex md:w-1/2 flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/10 p-12 relative overflow-hidden">
          <LeafParticles count={5} className="absolute inset-0" />
          <p className="text-5xl mb-8" aria-hidden="true">🍂</p>
          <p className="text-2xl font-bold text-foreground text-center relative z-10">Welcome to {SITE_NAME}</p>
        </div>
        {/* Right form panel */}
        <main className="w-full md:w-1/2 flex items-center justify-center p-8">
          <Card className="rounded-[2rem] p-12 max-w-md w-full">
            <CardContent className="p-0">
              <h1 className="text-3xl font-bold">{tLogin("title")}</h1>
              <p className="text-muted-foreground mt-2">{tLogin("subtitle")}</p>

              {errorMessage && (
                <div
                  role="alert"
                  className="flex items-start gap-3 mt-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                >
                  <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
                  <p>{errorMessage}</p>
                </div>
              )}

              <div className="mt-8">
                <LoginButton redirectTo={redirectTo} label={tLogin("button")} />
              </div>
              <p className="text-sm text-muted-foreground mt-6 text-center">{tLogin("footnote")}</p>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}

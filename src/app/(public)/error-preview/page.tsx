import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Hourglass, LockKeyhole, ServerCrash, ShieldAlert, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Error Preview",
  robots: { index: false, follow: false },
};

const previewItems = [
  { key: "unauthorized", href: "/error-preview/unauthorized", icon: LockKeyhole },
  { key: "forbidden", href: "/error-preview/forbidden", icon: ShieldAlert },
  { key: "notFound", href: "/error-preview/not-found", icon: TriangleAlert },
  { key: "rateLimit", href: "/too-many-requests", icon: Hourglass },
  { key: "serverError", href: "/error-preview/runtime-error", icon: TriangleAlert },
  { key: "serviceUnavailable", href: "/service-unavailable", icon: ServerCrash },
] as const;

export default async function ErrorPreviewPage() {
  const t = await getTranslations("errorPreview");

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(232,131,107,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(212,168,67,0.18),_transparent_34%),linear-gradient(180deg,_hsl(var(--card)),_hsl(var(--background)))] p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/70">{t("eyebrow")}</p>
        <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">{t("title")}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">{t("description")}</p>
        <p className="mt-4 text-sm font-medium text-foreground/80">{t("note")}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {previewItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.key} className="rounded-[28px] border-border/70 bg-card/90 backdrop-blur-sm">
              <CardHeader>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <CardTitle className="mt-4 text-xl">{t(`items.${item.key}.title`)}</CardTitle>
                <CardDescription className="leading-6">{t(`items.${item.key}.description`)}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-4">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                  {t(`items.${item.key}.code`)}
                </div>
                <Button asChild>
                  <Link href={item.href}>
                    {t("open")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
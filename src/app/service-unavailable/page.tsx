import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { StatusPage } from "@/components/shared/status-page";

export const metadata: Metadata = {
  title: "Service unavailable",
  robots: { index: false, follow: false },
};

export default async function ServiceUnavailablePage(props: { searchParams: Promise<{ retryAfter?: string }> }) {
  const searchParams = await props.searchParams;
  const t = await getTranslations("errors.pages.serviceUnavailable");
  const tCommon = await getTranslations("common");

  const retryAfter = Number(searchParams.retryAfter);
  const description = Number.isFinite(retryAfter) && retryAfter > 0
    ? t("descriptionWithRetryAfter", { seconds: Math.floor(retryAfter) })
    : t("description");

  return (
    <StatusPage
      code={t("code")}
      title={t("title")}
      description={description}
      icon="server"
      tone="danger"
      primaryAction={{ label: tCommon("retry"), kind: "refresh" }}
      secondaryAction={{ label: tCommon("backToHome"), href: "/", variant: "outline" }}
    />
  );
}
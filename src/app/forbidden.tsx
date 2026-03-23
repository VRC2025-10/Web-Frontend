import { getTranslations } from "next-intl/server";
import { StatusPage } from "@/components/shared/status-page";

export default async function ForbiddenPage() {
  const t = await getTranslations("errors.pages.forbidden");
  const tCommon = await getTranslations("common");
  const tNav = await getTranslations("nav");

  return (
    <StatusPage
      code={t("code")}
      title={t("title")}
      description={t("description")}
      icon="shield"
      tone="danger"
      primaryAction={{ label: tCommon("backToHome"), href: "/" }}
      secondaryAction={{ label: tNav("login"), href: "/login", variant: "outline" }}
    />
  );
}
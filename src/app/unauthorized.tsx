import { getTranslations } from "next-intl/server";
import { StatusPage } from "@/components/shared/status-page";

export default async function UnauthorizedPage() {
  const t = await getTranslations("errors.pages.unauthorized");
  const tCommon = await getTranslations("common");
  const tNav = await getTranslations("nav");

  return (
    <StatusPage
      code={t("code")}
      title={t("title")}
      description={t("description")}
      icon="lock"
      tone="warning"
      primaryAction={{ label: tNav("login"), href: "/login" }}
      secondaryAction={{ label: tCommon("backToHome"), href: "/", variant: "outline" }}
    />
  );
}
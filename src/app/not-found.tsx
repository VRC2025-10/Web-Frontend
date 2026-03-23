import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import { NotFoundContent } from "@/components/shared/not-found-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default async function NotFound() {
  const t = await getTranslations("errors.notFound");
  const tCommon = await getTranslations("common");

  return (
    <NotFoundContent
      code={t("code")}
      title={t("title")}
      description={t("description")}
      backLabel={tCommon("backToHome")}
    />
  );
}

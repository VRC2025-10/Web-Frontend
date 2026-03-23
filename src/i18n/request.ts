import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { defaultLocale, type Locale, locales } from "./config";
import { localeMessages } from "./messages";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();

  let locale: Locale = defaultLocale;

  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    locale = cookieLocale as Locale;
  } else {
    const headerStore = await headers();
    const acceptLang = headerStore.get("Accept-Language") ?? "";
    if (acceptLang.includes("en")) {
      locale = "en";
    }
  }

  return {
    locale,
    messages: localeMessages[locale],
  };
});

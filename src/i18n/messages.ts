import { defaultLocale, locales, type Locale } from "./config";
import enMessages from "./messages/en.json";
import jaMessages from "./messages/ja.json";

type Messages = typeof enMessages;

export const localeMessages = {
  en: enMessages,
  ja: jaMessages,
} satisfies Record<Locale, Messages>;

function normalizeLocale(locale: string): Locale {
  return locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
}

export function getLocaleMessages(locale: string): Messages {
  return localeMessages[normalizeLocale(locale)];
}

export function pickMessages<K extends keyof Messages>(locale: string, keys: readonly K[]): Pick<Messages, K> {
  const messages = getLocaleMessages(locale);
  return Object.fromEntries(keys.map((key) => [key, messages[key]])) as Pick<Messages, K>;
}
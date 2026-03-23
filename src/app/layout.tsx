import { Zen_Kaku_Gothic_New, Nunito, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";
import { getLocale } from "next-intl/server";
import { Toaster } from "sonner";
import { getLocaleMessages } from "@/i18n/messages";
import { SITE_NAME } from "@/lib/site";
import "./globals.css";

const zenKaku = Zen_Kaku_Gothic_New({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-zen-kaku",
  preload: true,
  fallback: ["system-ui", "-apple-system", "Hiragino Sans", "sans-serif"],
});

const nunito = Nunito({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
  variable: "--font-nunito",
  preload: true,
  fallback: ["system-ui", "-apple-system", "sans-serif"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-mono",
  preload: false,
  fallback: ["ui-monospace", "Consolas", "monospace"],
});

export const metadata = {
  metadataBase: new URL("https://vrc10.arivell-vm.com"),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: "VRChat 10月同期会のコミュニティサイト",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = getLocaleMessages(locale);

  return (
    <html lang={locale} className={`${zenKaku.variable} ${nunito.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NextIntlClientProvider
            locale={locale}
            messages={{
              common: {
                backToHome: messages.common.backToHome,
              },
              errors: {
                serverError: messages.errors.serverError,
              },
            }}
          >
            {children}
            <Toaster position="bottom-right" richColors closeButton toastOptions={{ duration: 5000, className: "rounded-xl" }} />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";
import { getLocale } from "next-intl/server";
import { Toaster } from "sonner";
import { getLocaleMessages } from "@/i18n/messages";
import { SITE_NAME } from "@/lib/site";
import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://vrc10.arivell-vm.com"),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: "VRChat 10月同期会のコミュニティサイト",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = getLocaleMessages(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NextIntlClientProvider
            locale={locale}
            messages={{
              common: messages.common,
              nav: messages.nav,
              theme: messages.theme,
              admin: messages.admin,
              schedule: messages.schedule,
              errors: messages.errors,
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

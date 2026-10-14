import type { Metadata } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/inter";
import { cookies } from "next/headers";
import "./globals.css";
import { I18nProvider } from "@/components/i18n-provider";
import { PublicLanguageControl } from "@/components/public-language-control";
import { LOCALE_COOKIE_KEY, normalizeLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Luna Planner — Tu tiempo, a tu manera",
  description: "Planner digital interactivo para organizar tus días y alcanzar tus objetivos."
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE_KEY)?.value);
  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <I18nProvider initialLocale={locale}>
          {children}
          <PublicLanguageControl />
        </I18nProvider>
      </body>
    </html>
  );
}

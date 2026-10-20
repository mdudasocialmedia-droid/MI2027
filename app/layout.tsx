import type { Metadata, Viewport } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/inter";
import { cookies } from "next/headers";
import "./globals.css";
import { I18nProvider } from "@/components/i18n-provider";
import { PublicLanguageControl } from "@/components/public-language-control";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { LOCALE_COOKIE_KEY, normalizeLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Luna Planner — Tu tiempo, a tu manera",
  description: "Planner digital interactivo para organizar tus días y alcanzar tus objetivos.",
  applicationName: "Luna Planner",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Luna Planner" },
  icons: {
    icon: [
      { url: "/icons/luna-planner-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/luna-planner-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/luna-planner-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#d96899",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE_KEY)?.value);
  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <I18nProvider initialLocale={locale}>
          {children}
          <PwaInstallPrompt />
          <PublicLanguageControl />
        </I18nProvider>
      </body>
    </html>
  );
}

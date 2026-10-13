import type { Metadata } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/inter";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mi 2027 — Tu año, a tu manera",
  description: "Dashboard de planificación personal para convertir tus días en pequeños logros."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

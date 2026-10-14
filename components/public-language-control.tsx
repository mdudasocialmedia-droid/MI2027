"use client";

import { usePathname } from "next/navigation";
import { LanguageSelector } from "@/components/i18n-provider";

const publicPaths = ["/login", "/registro", "/recuperar", "/redefinir", "/sem-acesso"];
export function PublicLanguageControl() {
  const pathname = usePathname();
  if (!publicPaths.some((path) => pathname.startsWith(path))) return null;
  return <div className="fixed right-4 top-4 z-[80]"><LanguageSelector /></div>;
}


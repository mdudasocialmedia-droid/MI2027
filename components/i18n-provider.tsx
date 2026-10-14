"use client";

import { Languages } from "lucide-react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AppLocale, LOCALE_COOKIE_KEY, LOCALE_STORAGE_KEY, normalizeLocale, translateToPortuguese } from "@/lib/i18n";

type I18nContextValue = { locale: AppLocale; setLocale: (locale: AppLocale) => void };
const I18nContext = createContext<I18nContextValue | null>(null);

function translateElement(element: Element) {
  for (const attribute of ["placeholder", "aria-label", "title"] as const) {
    const current = element.getAttribute(attribute);
    if (!current) continue;
    const translated = translateToPortuguese(current);
    if (translated !== current) element.setAttribute(attribute, translated);
  }
}

function translateNode(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) {
    const parent = root.parentElement;
    if (!parent || parent.closest("[data-no-i18n]") || ["SCRIPT", "STYLE"].includes(parent.tagName)) return;
    const optionValue = parent.tagName === "OPTION" ? (parent as HTMLOptionElement).value : null;
    const current = root.nodeValue ?? "";
    const translated = translateToPortuguese(current);
    if (translated !== current) root.nodeValue = translated;
    if (optionValue !== null) (parent as HTMLOptionElement).value = optionValue;
    return;
  }
  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return;
  if (root.nodeType === Node.ELEMENT_NODE) translateElement(root as Element);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let node = walker.nextNode();
  while (node) {
    if (node.nodeType === Node.TEXT_NODE) translateNode(node);
    else translateElement(node as Element);
    node = walker.nextNode();
  }
}

export function I18nProvider({ children, initialLocale }: { children: React.ReactNode; initialLocale: AppLocale }) {
  const [locale] = useState(initialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = locale === "pt-PT" ? "Luna Planner — O teu tempo, à tua maneira" : "Luna Planner — Tu tiempo, a tu manera";
    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute("content", locale === "pt-PT" ? "Planner digital interativo para organizares os teus dias e alcançares os teus objetivos." : "Planner digital interactivo para organizar tus días y alcanzar tus objetivos.");
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (!stored) {
      const detected = normalizeLocale(window.navigator.language);
      window.localStorage.setItem(LOCALE_STORAGE_KEY, detected);
      document.cookie = `${LOCALE_COOKIE_KEY}=${detected}; path=/; max-age=31536000; samesite=lax`;
      if (detected !== locale) window.location.reload();
    }
  }, [locale]);

  useEffect(() => {
    if (locale !== "pt-PT") return;
    translateNode(document.body);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) translateNode(node);
        if (mutation.type === "characterData") translateNode(mutation.target);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => ({ locale, setLocale(nextLocale) {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    document.cookie = `${LOCALE_COOKIE_KEY}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    window.location.reload();
  } }), [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside I18nProvider");
  return context;
}

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useI18n();
  return <label className={`flex items-center gap-2 rounded-2xl border border-violet-100 bg-white/85 text-navy shadow-sm ${compact ? "px-2 py-1.5" : "px-3 py-2"}`}>
    <Languages aria-hidden="true" className="h-4 w-4 text-violet" />
    <span className={compact ? "sr-only" : "text-xs font-bold"}>Idioma</span>
    <select aria-label="Elige tu idioma" className="min-w-0 bg-transparent text-xs font-bold outline-none focus-visible:ring-2 focus-visible:ring-violet" value={locale} onChange={(event) => setLocale(event.target.value as AppLocale)}>
      <option value="es-ES">ES</option><option value="pt-PT">PT</option>
    </select>
  </label>;
}


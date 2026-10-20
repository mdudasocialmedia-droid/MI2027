"use client";

import { Download, Info, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/i18n-provider";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export function PwaInstallPrompt() {
  const { locale } = useI18n();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service-worker.js", { scope: "/" }).catch(() => {
        // Installation remains available from Chrome's menu; no sensitive details are logged.
      });
    }

    const onBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };
    const onAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  if (installed) return null;
  const pt = locale === "pt-PT";
  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome !== "accepted") setDeferredPrompt(null);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[80] max-w-[calc(100vw-2rem)]" data-no-i18n>
      {deferredPrompt ? (
        <button type="button" onClick={install} className="flex items-center gap-2 rounded-2xl bg-[#c9538c] px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#ad3e75] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7d4fe0] focus-visible:ring-offset-2">
          <Download aria-hidden="true" className="h-4 w-4" />
          Instalar Luna Planner
        </button>
      ) : showHelp ? (
        <div className="relative rounded-2xl border border-pink-100 bg-white p-4 pr-10 text-sm text-slate-700 shadow-lg">
          <button type="button" onClick={() => setShowHelp(false)} aria-label={pt ? "Fechar" : "Cerrar"} className="absolute right-3 top-3 text-slate-500"><X aria-hidden="true" className="h-4 w-4" /></button>
          <p className="font-bold text-slate-900">{pt ? "Instalar no Android" : "Instalar en Android"}</p>
          <p className="mt-1 max-w-xs">{pt ? "No Chrome, abre o menu ⋮ e toca em “Instalar app”. Se essa opção não aparecer, atualiza a página ligada à Internet." : "En Chrome, abre el menú ⋮ y toca “Instalar aplicación”. Si no aparece, actualiza la página con conexión a Internet."}</p>
        </div>
      ) : (
        <button type="button" onClick={() => setShowHelp(true)} className="flex items-center gap-2 rounded-2xl border border-pink-100 bg-white px-3 py-2 text-xs font-bold text-[#9d3e70] shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7d4fe0]">
          <Info aria-hidden="true" className="h-4 w-4" />
          {pt ? "Como instalar" : "Cómo instalar"}
        </button>
      )}
    </div>
  );
}

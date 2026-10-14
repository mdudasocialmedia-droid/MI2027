"use client";

import { CalendarDays, Check, Heart, Home, MoonStar, Sparkles, Target, WalletCards } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { LanguageSelector } from "@/components/i18n-provider";
import { YearSelector } from "@/components/year-selector";

type Page = "dashboard" | "agenda" | "habits" | "goals" | "money" | "diary" | "achievements";

const navItems: { label: string; icon: LucideIcon; page?: Page; href?: string }[] = [
  { label: "Inicio", icon: Home, page: "dashboard", href: "/" },
  { label: "Agenda", icon: CalendarDays, page: "agenda", href: "/agenda" },
  { label: "Hábitos", icon: Heart, page: "habits", href: "/habitos" },
  { label: "Metas", icon: Target, page: "goals", href: "/metas" },
  { label: "Dinero", icon: WalletCards, page: "money", href: "/dinero" },
];

export function Logo() {
  return <Link href="/" aria-label="Ir al inicio" className="inline-flex items-center gap-2 font-display text-[24px] font-extrabold tracking-[-0.045em] text-[#4C2ABC]"><span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-violet to-coral text-white shadow-soft"><MoonStar size={20} fill="currentColor" /></span><span>Luna <span className="text-coral">Planner</span></span></Link>;
}

export function DesktopSidebar({ active }: { active: Page }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[252px] flex-col overflow-y-auto border-r border-violet/10 bg-white/80 px-5 py-7 backdrop-blur-xl lg:flex">
      <Logo />
      <nav className="mt-10 space-y-2" aria-label="Navegación principal">
        {navItems.map(({ label, icon: Icon, page, href }) => {
          const selected = page === active;
          const style = `flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${selected ? "bg-violet text-white shadow-soft" : "text-slate-500 hover:bg-violet/10 hover:text-violet"}`;
          const icon = label === "Hábitos" ? <span className="relative"><Icon size={19} strokeWidth={selected ? 2.5 : 2} /><Check className="absolute -bottom-1 -right-1 rounded-full bg-white p-px text-violet" size={10} strokeWidth={3} /></span> : <Icon size={19} strokeWidth={selected ? 2.5 : 2} />;
          const content = <>{icon}<span>{label}</span></>;
          return href ? <Link key={label} href={href} aria-current={selected ? "page" : undefined} className={style}>{content}</Link> : <button key={label} type="button" className={style} title="Próximamente">{content}</button>;
        })}
      </nav>
      <div className="mt-auto flex gap-2 pt-6"><LanguageSelector compact /><YearSelector compact /></div>
      <div className="mt-3 rounded-[24px] bg-gradient-to-br from-[#EEE8FF] to-[#FFE9EF] p-4">
        <Sparkles className="text-violet" size={24} />
        <p className="mt-3 font-display text-sm font-extrabold">Un pequeño paso cuenta</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">Sigue construyendo tu mejor año, un día cada vez.</p>
      </div>
    </aside>
  );
}

export function MobileNav({ active }: { active: Page }) {
  return (
    <><div className="fixed right-3 top-3 z-40 flex gap-2 lg:hidden"><LanguageSelector compact /><YearSelector compact /></div><nav className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-[24px] border border-white/80 bg-white/95 px-2 py-2 shadow-[0_12px_40px_rgba(50,31,83,.18)] backdrop-blur-xl lg:hidden" aria-label="Navegación móvil">
      {navItems.map(({ label, icon: Icon, page, href }) => {
        const selected = page === active;
        const style = `flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[9px] font-bold transition sm:text-[10px] ${selected ? "bg-violet/10 text-violet" : "text-slate-400"}`;
        const icon = label === "Hábitos" ? <span className="relative"><Icon size={19} fill={selected ? "currentColor" : "none"} /><Check className="absolute -bottom-1 -right-1 rounded-full bg-white p-px text-violet" size={10} strokeWidth={3} /></span> : <Icon size={19} fill={selected ? "currentColor" : "none"} />;
        const content = <>{icon}<span>{label}</span></>;
        return href ? <Link key={label} href={href} aria-current={selected ? "page" : undefined} className={style}>{content}</Link> : <button key={label} type="button" className={style} title="Próximamente">{content}</button>;
      })}
    </nav></>
  );
}

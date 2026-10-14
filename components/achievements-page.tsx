"use client";

import { ArrowLeft, CheckCircle2, CircleDollarSign, Flame, Goal, LockKeyhole, Medal, Sparkles, Star, Target, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { DesktopSidebar, Logo, MobileNav } from "@/components/app-navigation";
import { getAchievementDefinitions, type AchievementArea, type AchievementDefinition } from "@/lib/achievements";
import { calculateCurrentXp, usePlannerStore } from "@/lib/planner-store";

const areaMeta: Record<AchievementArea, { label: string; icon: LucideIcon }> = {
  tasks: { label: "Tareas", icon: CheckCircle2 },
  habits: { label: "Hábitos", icon: Flame },
  goals: { label: "Metas", icon: Goal },
  finance: { label: "Finanzas", icon: CircleDollarSign },
};

export function AchievementsPage() {
  const { data, updateData, ready } = usePlannerStore();
  const definitions = useMemo(() => getAchievementDefinitions(data), [data]);

  useEffect(() => {
    if (!ready) return;
    const stored = new Set(data.achievements.map((item) => item.id));
    const newlyUnlocked = definitions.filter((item) => item.unlocked && !stored.has(item.id));
    if (newlyUnlocked.length > 0) updateData((current) => ({ ...current, achievements: [...current.achievements, ...newlyUnlocked.filter((item) => !current.achievements.some((record) => record.id === item.id)).map((item) => ({ id: item.id, unlockedAt: new Date().toISOString() }))] }));
  }, [data.achievements, definitions, ready, updateData]);

  const xp = calculateCurrentXp(data);
  const level = Math.floor(xp / 200) + 1;
  const levelXp = xp % 200;
  const unlocked = definitions.filter((item) => item.unlocked);
  const locked = definitions.filter((item) => !item.unlocked);
  const next = locked.slice().sort((a, b) => b.progress - a.progress)[0];
  const history = data.achievements.slice().sort((a, b) => b.unlockedAt.localeCompare(a.unlockedAt));

  return <div className="min-h-screen lg:flex">
    <DesktopSidebar active="achievements" />
    <main className="mx-auto w-full max-w-[1550px] px-4 pb-28 pt-5 sm:px-6 lg:ml-[252px] lg:px-8 lg:pb-10 lg:pt-8 xl:px-10">
      <AchievementsHeader />
      <section className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(340px,.7fr)]">
        <LevelCard xp={xp} level={level} levelXp={levelXp} unlocked={unlocked.length} total={definitions.length} />
        <NextAchievement achievement={next} />
      </section>

      <section className="mt-7"><div className="flex items-end justify-between"><div><h2 className="font-display text-xl font-extrabold">Mis insignias</h2><p className="mt-1 text-sm text-slate-400">Desbloqueadas solo con acciones guardadas en Luna Planner.</p></div><span className="rounded-full bg-violet/10 px-3 py-1.5 text-xs font-bold text-violet">{unlocked.length}/{definitions.length}</span></div><div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{definitions.map((achievement) => <BadgeCard key={achievement.id} achievement={achievement} />)}</div></section>

      <section className="mt-7 grid gap-5 lg:grid-cols-[1fr_.65fr]">
        <article className="card p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-display text-lg font-extrabold">Progreso por área</h2><p className="mt-0.5 text-xs text-slate-400">Una vista honesta de tus acciones registradas</p></div><Target className="text-coral" /></div><div className="mt-6 grid gap-4 sm:grid-cols-2">{(Object.keys(areaMeta) as AchievementArea[]).map((area) => { const items = definitions.filter((item) => item.area === area); const completed = items.filter((item) => item.unlocked).length; const meta = areaMeta[area]; const Icon = meta.icon; return <div key={area} className="rounded-2xl bg-[#FFFCF8] p-4"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-violet/10 text-violet"><Icon size={18} /></span><div className="flex-1"><div className="flex justify-between text-xs"><span className="font-bold">{meta.label}</span><span className="text-slate-400">{completed}/{items.length}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-violet" style={{ width: `${items.length ? (completed / items.length) * 100 : 0}%` }} /></div></div></div></div>; })}</div></article>
        <HistoryCard records={history} definitions={definitions} />
      </section>
    </main>
    <MobileNav active="achievements" />
  </div>;
}

function AchievementsHeader() { return <header><div className="lg:hidden"><Logo /></div><Link href="/" className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[.16em] text-violet lg:mt-0"><ArrowLeft size={15} /> Volver al inicio</Link><h1 className="mt-2 font-display text-[32px] font-extrabold tracking-[-.045em] sm:text-[40px]">Mis Logros <span className="inline-block animate-float">🏆</span></h1><p className="mt-1 text-sm text-slate-500 sm:text-base">Cada insignia cuenta una historia que tú hiciste realidad.</p></header>; }
function LevelCard({ xp, level, levelXp, unlocked, total }: { xp: number; level: number; levelXp: number; unlocked: number; total: number }) { return <article className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#7854F6] via-[#9869EC] to-[#ED83A7] p-6 text-white shadow-soft sm:p-8"><div className="absolute -right-12 -top-12 size-56 rounded-full border-[35px] border-white/10" /><Sparkles className="absolute right-8 top-7 text-yellow" /><div className="relative flex flex-col gap-6 sm:flex-row sm:items-center"><span className="grid size-24 shrink-0 place-items-center rounded-[28px] bg-white/15 shadow-inner"><Trophy size={48} className="text-yellow" fill="currentColor" /></span><div className="flex-1"><p className="text-xs font-bold uppercase tracking-[.17em] text-white/70">Nivel actual</p><div className="mt-1 flex items-end gap-3"><span className="font-display text-5xl font-extrabold">{level}</span><span className="mb-2 text-sm text-white/70">{xp} XP totales</span></div><div className="mt-4 h-3 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-yellow" style={{ width: `${(levelXp / 200) * 100}%` }} /></div><div className="mt-2 flex justify-between text-xs"><span>{levelXp}/200 XP</span><span>{200 - levelXp} XP para subir</span></div></div><div className="rounded-2xl bg-white/15 px-5 py-4 text-center"><span className="block font-display text-3xl font-extrabold">{unlocked}</span><span className="text-xs text-white/70">de {total} insignias</span></div></div></article>; }
function NextAchievement({ achievement }: { achievement?: AchievementDefinition }) { return <article className="card p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-coral">Próxima conquista</p><h2 className="mt-2 font-display text-xl font-extrabold">{achievement?.title ?? "Colección completa"}</h2></div><span className="grid size-14 place-items-center rounded-2xl bg-yellow/25 text-[#B57B00]"><Medal size={28} /></span></div>{achievement ? <><p className="mt-3 text-sm text-slate-500">{achievement.description}</p><div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-yellow to-coral" style={{ width: `${achievement.progress}%` }} /></div><div className="mt-2 flex justify-between text-xs"><span className="font-bold text-coral">{achievement.current}/{achievement.target}</span><span className="text-slate-400">{achievement.progress}%</span></div></> : <p className="mt-4 text-sm text-slate-500">Has desbloqueado todas las insignias disponibles.</p>}</article>; }
function BadgeCard({ achievement }: { achievement: AchievementDefinition }) { const meta = areaMeta[achievement.area]; const Icon = meta.icon; return <article className={`relative overflow-hidden rounded-[24px] border p-5 transition ${achievement.unlocked ? "border-white bg-white shadow-card hover:-translate-y-1" : "border-slate-100 bg-white/50 opacity-70"}`}><div className={`absolute right-3 top-3 grid size-7 place-items-center rounded-full ${achievement.unlocked ? "bg-mint text-white" : "bg-slate-100 text-slate-400"}`}>{achievement.unlocked ? <CheckCircle2 size={15} /> : <LockKeyhole size={13} />}</div><span className={`grid size-14 place-items-center rounded-[20px] ${achievement.unlocked ? "animate-pop" : "grayscale"}`} style={{ backgroundColor: `${achievement.color}1F`, color: achievement.color }}><Icon size={27} /></span><p className="mt-4 text-[10px] font-bold uppercase tracking-wider" style={{ color: achievement.color }}>{meta.label}</p><h3 className="mt-1 font-display text-base font-extrabold">{achievement.title}</h3><p className="mt-1.5 min-h-8 text-xs leading-relaxed text-slate-400">{achievement.description}</p><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: `${achievement.progress}%`, backgroundColor: achievement.color }} /></div></article>; }
function HistoryCard({ records, definitions }: { records: { id: string; unlockedAt: string }[]; definitions: AchievementDefinition[] }) { return <article className="card p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-display text-lg font-extrabold">Historial</h2><p className="mt-0.5 text-xs text-slate-400">Momentos que merecen celebrarse</p></div><Star className="text-yellow" fill="currentColor" /></div><div className="mt-5 space-y-4">{records.length === 0 && <p className="py-8 text-center text-sm text-slate-400">Completa una acción para desbloquear tu primer logro.</p>}{records.map((record) => { const achievement = definitions.find((item) => item.id === record.id); if (!achievement) return null; return <div key={record.id} className="flex gap-3"><span className="mt-1 size-3 shrink-0 rounded-full ring-4 ring-white" style={{ backgroundColor: achievement.color }} /><div><p className="text-sm font-bold">{achievement.title}</p><p className="mt-0.5 text-[11px] text-slate-400">{new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(new Date(record.unlockedAt))}</p></div></div>; })}</div></article>; }

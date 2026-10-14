"use client";

import { CheckCircle2, LockKeyhole, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { getAchievementDefinitions } from "@/lib/achievements";
import { usePlannerStore } from "@/lib/planner-store";

export function AchievementsSummary() {
  const { data, updateData, ready } = usePlannerStore();
  const definitions = useMemo(() => getAchievementDefinitions(data), [data]);
  const unlocked = definitions.filter((item) => item.unlocked);
  const next = definitions.filter((item) => !item.unlocked).sort((a, b) => b.progress - a.progress)[0];

  useEffect(() => {
    if (!ready) return;
    const stored = new Set(data.achievements.map((item) => item.id));
    const additions = definitions.filter((item) => item.unlocked && !stored.has(item.id));
    if (additions.length) updateData((current) => ({ ...current, achievements: [...current.achievements, ...additions.filter((item) => !current.achievements.some((record) => record.id === item.id)).map((item) => ({ id: item.id, unlockedAt: new Date().toISOString() }))] }));
  }, [data.achievements, definitions, ready, updateData]);

  return <section className="mt-7"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-coral">Conquistas</p><h2 className="mt-1 font-display text-xl font-extrabold">Celebra tu progreso</h2><p className="mt-1 text-sm text-slate-400">Cada logro se calcula con tus acciones registradas.</p></div><Link href="/logros" className="rounded-xl bg-violet/10 px-4 py-2 text-xs font-bold text-violet hover:bg-violet hover:text-white">Ver todas</Link></div><div className="mt-4 grid gap-4 md:grid-cols-[.8fr_1.2fr]"><article className="rounded-[26px] bg-gradient-to-br from-violet to-coral p-5 text-white shadow-soft"><Trophy className="text-yellow" fill="currentColor" /><p className="mt-4 text-sm text-white/75">Insignias desbloqueadas</p><p className="mt-1 font-display text-4xl font-extrabold">{unlocked.length}<span className="text-lg text-white/70">/{definitions.length}</span></p><p className="mt-3 text-xs text-white/75">Sigue registrando tus avances para desbloquear más.</p></article><article className="card p-5"><div className="flex items-start gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-yellow/25 text-[#B57B00]">{next ? <LockKeyhole size={20} /> : <CheckCircle2 size={20} />}</span><div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-[.13em] text-slate-400">{next ? "Próxima conquista" : "Colección completa"}</p><h3 className="mt-1 font-display text-lg font-extrabold">{next?.title ?? "¡Has desbloqueado todas las insignias!"}</h3><p className="mt-1 text-sm text-slate-500">{next?.description ?? "Tu constancia ya tiene todas las insignias disponibles."}</p></div></div>{next && <><div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-yellow to-coral" style={{ width: `${next.progress}%` }} /></div><p className="mt-2 text-xs text-slate-400">{next.current}/{next.target} · {next.progress}%</p></>}</article></div></section>;
}

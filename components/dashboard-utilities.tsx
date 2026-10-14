"use client";

import { Bell, BookHeart, Check, Heart, Search, Target, X } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { occursOnDate, parseDate, type PlannerData } from "@/lib/planner-store";

const DIARY_STORAGE_KEY = "mi2027-diary-v1";
const READ_NOTIFICATIONS_KEY = "luna-planner-read-notifications";
type DiaryEntry = { id: string; date: string; mood: number; content: string; gratitudes: string[]; createdAt: string; updatedAt: string };
type NotificationItem = { id: string; title: string; detail: string; href: string };

function loadDiaryEntries(): DiaryEntry[] {
  try { const saved = JSON.parse(localStorage.getItem(DIARY_STORAGE_KEY) ?? "[]"); return Array.isArray(saved) ? saved as DiaryEntry[] : []; } catch { return []; }
}

export function getNotifications(data: PlannerData): NotificationItem[] {
  const selected = data.selectedDate;
  const selectedTime = parseDate(selected).getTime();
  const nextWeek = selectedTime + 7 * 86_400_000;
  const eventItems = data.events.filter((event) => occursOnDate(event, selected)).map((event) => ({ id: `event-${event.id}-${selected}`, title: event.title, detail: event.allDay ? "Compromiso para hoy" : `Compromiso a las ${event.startTime}`, href: "/agenda" }));
  const habitItems = data.habitItems.filter((habit) => !habit.checkIns.includes(selected)).map((habit) => ({ id: `habit-${habit.id}-${selected}`, title: habit.title, detail: "Hábito pendiente hoy", href: "/habitos" }));
  const goalItems = data.goals.filter((goal) => { const due = parseDate(goal.dueDate).getTime(); return due >= selectedTime && due <= nextWeek && goal.progress < 100; }).map((goal) => ({ id: `goal-${goal.id}-${goal.dueDate}`, title: goal.title, detail: `Plazo próximo: ${new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" }).format(parseDate(goal.dueDate))}`, href: "/metas" }));
  return [...eventItems, ...habitItems, ...goalItems];
}

export function SearchPanel({ data, onClose }: { data: PlannerData; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [diary, setDiary] = useState<DiaryEntry[]>([]);
  useEffect(() => { setDiary(loadDiaryEntries()); }, []);
  const results = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("es-ES");
    if (!needle) return [];
    const matches = (text: string) => text.toLocaleLowerCase("es-ES").includes(needle);
    return [
      ...data.events.filter((item) => matches(`${item.title} ${item.category} ${item.description}`)).map((item) => ({ id: `event-${item.id}`, title: item.title, category: `Agenda · ${item.category}`, href: "/agenda" })),
      ...data.habitItems.filter((item) => matches(item.title)).map((item) => ({ id: `habit-${item.id}`, title: item.title, category: "Hábitos", href: "/habitos" })),
      ...data.goals.filter((item) => matches(`${item.title} ${item.category}`)).map((item) => ({ id: `goal-${item.id}`, title: item.title, category: `Metas · ${item.category}`, href: "/metas" })),
      ...diary.filter((item) => matches(`${item.content} ${item.gratitudes.join(" ")}`)).map((item) => ({ id: `diary-${item.id}`, title: item.content.slice(0, 80) || "Entrada del diario", category: `Diario · ${item.date}`, href: "/diario" })),
    ].slice(0, 20);
  }, [data.events, data.goals, data.habitItems, diary, query]);
  return <div className="fixed inset-0 z-[70] bg-ink/35 p-4 backdrop-blur-sm sm:p-8" role="dialog" aria-modal="true" aria-label="Buscar"><div className="mx-auto max-w-2xl rounded-[28px] bg-cream p-5 shadow-2xl sm:p-7"><div className="flex items-center gap-3"><Search className="text-violet" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar en agenda, hábitos, metas y diario..." className="field flex-1" /><button onClick={onClose} className="icon-button" aria-label="Cerrar búsqueda"><X size={18} /></button></div><div className="mt-5 space-y-2">{query.trim() && results.length === 0 && <p className="py-8 text-center text-sm text-slate-400">No hay resultados en tus datos actuales.</p>}{results.map((result) => <Link key={result.id} href={result.href} onClick={onClose} className="block rounded-2xl bg-white p-4 transition hover:bg-violet/5"><p className="truncate text-sm font-bold">{result.title}</p><p className="mt-1 text-xs text-slate-400">{result.category}</p></Link>)}</div></div></div>;
}

export function NotificationsPanel({ data, onClose, onReadAll }: { data: PlannerData; onClose: () => void; onReadAll?: (ids: string[]) => void }) {
  const [read, setRead] = useState<string[]>([]);
  const items = getNotifications(data);
  useEffect(() => { try { const value = JSON.parse(localStorage.getItem(READ_NOTIFICATIONS_KEY) ?? "[]"); if (Array.isArray(value)) setRead(value.filter((item): item is string => typeof item === "string")); } catch { /* Ignore malformed local preference. */ } }, []);
  function markAllRead() { const ids = items.map((item) => item.id); const next = Array.from(new Set([...read, ...ids])); setRead(next); localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(next)); onReadAll?.(ids); }
  return <div className="fixed inset-0 z-[70] bg-ink/35 p-4 backdrop-blur-sm sm:p-8" role="dialog" aria-modal="true" aria-label="Notificaciones"><div className="mx-auto max-w-lg rounded-[28px] bg-cream p-5 shadow-2xl sm:p-7"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-violet">Notificaciones</p><h2 className="mt-1 font-display text-2xl font-extrabold">Tu planificación</h2></div><div className="flex items-center gap-2"><button onClick={markAllRead} className="text-xs font-bold text-violet">Marcar como leídas</button><button onClick={onClose} className="icon-button" aria-label="Cerrar notificaciones"><X size={18} /></button></div></div><div className="mt-5 space-y-3">{items.length === 0 && <p className="rounded-2xl bg-white p-5 text-center text-sm text-slate-400">No hay recordatorios pendientes para esta fecha.</p>}{items.map((item) => <Link key={item.id} href={item.href} onClick={onClose} className={`block rounded-2xl p-4 transition hover:-translate-y-0.5 ${read.includes(item.id) ? "bg-white/70" : "bg-violet/10"}`}><p className="text-sm font-bold">{item.title}</p><p className="mt-1 text-xs text-slate-500">{item.detail}</p></Link>)}</div></div></div>;
}

export function DiaryHomeSection({ date }: { date: string }) {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState(3);
  const [saved, setSaved] = useState(false);
  useEffect(() => { const next = loadDiaryEntries(); setEntries(next); const today = next.find((item) => item.date === date); setContent(today?.content ?? ""); setMood(today?.mood ?? 3); setSaved(false); }, [date]);
  function save(event: FormEvent) { event.preventDefault(); const clean = content.trim(); if (!clean) return; const now = new Date().toISOString(); const current = entries.find((item) => item.date === date); const next = current ? entries.map((item) => item.id === current.id ? { ...item, content: clean, mood, updatedAt: now } : item) : [...entries, { id: `entry-${Date.now()}`, date, mood, content: clean, gratitudes: [], createdAt: now, updatedAt: now }]; setEntries(next); localStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify(next)); setSaved(true); }
  const recent = entries.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  return <section className="mt-7 grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><article className="card overflow-hidden"><div className="bg-gradient-to-r from-[#F3EFFF] via-[#FFF0F5] to-[#FFF4DE] p-5 sm:p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-violet">Diario</p><h2 className="mt-1 font-display text-xl font-extrabold">Un momento para ti</h2></div><BookHeart className="text-coral" /></div></div><form onSubmit={save} className="p-5 sm:p-6"><div className="flex gap-2">{["😢", "😕", "😌", "😊", "🤩"].map((emoji, index) => <button type="button" key={emoji} onClick={() => setMood(index + 1)} className={`grid size-9 place-items-center rounded-xl ${mood === index + 1 ? "bg-violet/15 ring-2 ring-violet" : "bg-[#FFFCF8]"}`} aria-label={`Estado ${index + 1}`}>{emoji}</button>)}</div><textarea value={content} onChange={(event) => setContent(event.target.value)} rows={4} placeholder="¿Qué ha hecho especial este día?" className="field mt-4 resize-none" /><div className="mt-4 flex items-center justify-between gap-3"><p className="text-xs text-slate-400">{saved ? "Entrada guardada" : "Se guarda en tu diario actual"}</p><button className="inline-flex items-center gap-2 rounded-xl bg-violet px-4 py-2.5 text-sm font-bold text-white"><Check size={16} /> Guardar</button></div></form></article><article className="card p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-display text-lg font-extrabold">Entradas recientes</h2><p className="mt-1 text-xs text-slate-400">Tus palabras, en un solo lugar.</p></div><Link href="/diario" className="text-xs font-bold text-violet">Ver diario</Link></div><div className="mt-4 space-y-3">{recent.length === 0 && <p className="py-5 text-center text-sm text-slate-400">Aún no hay entradas guardadas.</p>}{recent.map((entry) => <Link key={entry.id} href="/diario" className="block rounded-2xl bg-[#FFFCF8] p-3"><p className="text-xs font-bold text-violet">{entry.date}</p><p className="mt-1 line-clamp-2 text-sm text-slate-600">{entry.content}</p></Link>)}</div></article></section>;
}

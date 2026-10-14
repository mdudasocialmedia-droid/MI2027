"use client";

import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Flame,
  Heart,
  Leaf,
  Pencil,
  Plus,
  Sparkles,
  Star,
  Trash2,
  Waves,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { DesktopSidebar, Logo, MobileNav } from "@/components/app-navigation";
import { createId, parseDate, type HabitFrequency, type PlannerHabit, toDateKey, usePlannerStore } from "@/lib/planner-store";
import { getPlanningYear } from "@/lib/planner-preferences";

const locale = "es-ES";
const habitColors = ["#2DA9E9", "#FF6B78", "#7954F6", "#E74788", "#43C5A2", "#F5B82E"];
const iconOptions: { value: PlannerHabit["icon"]; label: string; icon: LucideIcon }[] = [
  { value: "water", label: "Agua", icon: Waves },
  { value: "exercise", label: "Movimiento", icon: Dumbbell },
  { value: "book", label: "Lectura", icon: BookOpen },
  { value: "heart", label: "Bienestar", icon: Heart },
  { value: "star", label: "Estrella", icon: Star },
  { value: "leaf", label: "Naturaleza", icon: Leaf },
];

function currentDateKey() {
  const today = new Date();
  today.setFullYear(getPlanningYear());
  return toDateKey(today);
}

export function HabitsPage() {
  const { data, updateData } = usePlannerStore();
  const [selectedDate, setSelectedDate] = useState(currentDateKey);
  const [monthDate, setMonthDate] = useState(() => parseDate(currentDateKey()));
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [modal, setModal] = useState<PlannerHabit | "new" | null>(null);
  const [deleting, setDeleting] = useState<PlannerHabit | null>(null);
  const habits = data.habitItems;
  const selectedHabit = habits.find((habit) => habit.id === selectedHabitId) ?? habits[0];

  const weeklyStats = useMemo(() => habits.map((habit) => ({ habit, ...getWeeklyStats(habit, selectedDate) })), [habits, selectedDate]);
  const completedToday = habits.filter((habit) => habit.checkIns.includes(selectedDate)).length;
  const average = habits.length ? Math.round(weeklyStats.reduce((sum, item) => sum + item.percent, 0) / habits.length) : 0;

  function toggleCheckIn(habitId: string, date = selectedDate) {
    updateData((current) => ({
      ...current,
      habits: date === current.selectedDate ? { ...current.habits, [habitId]: !current.habitItems.find((item) => item.id === habitId)?.checkIns.includes(date) } : current.habits,
      habitItems: current.habitItems.map((habit) => habit.id === habitId ? { ...habit, checkIns: habit.checkIns.includes(date) ? habit.checkIns.filter((item) => item !== date) : [...habit.checkIns, date].sort() } : habit),
    }));
  }

  return (
    <div className="min-h-screen lg:flex">
      <DesktopSidebar active="habits" />
      <main className="mx-auto w-full max-w-[1500px] px-4 pb-28 pt-5 sm:px-6 lg:ml-[252px] lg:px-8 lg:pb-10 lg:pt-8 xl:px-10">
        <PageHeader onNew={() => setModal("new")} />

        <section className="mt-7 grid gap-5 md:grid-cols-3">
          <StatCard label="Completados" value={`${completedToday}/${habits.length}`} detail="en la fecha elegida" color="bg-mint/20 text-[#2FA989]" icon={Check} />
          <StatCard label="Progreso semanal" value={`${average}%`} detail="media de tus hábitos" color="bg-violet/10 text-violet" icon={Sparkles} />
          <StatCard label="Mejor racha" value={`${Math.max(0, ...habits.map((habit) => getStreak(habit, selectedDate)))} días`} detail="constancia consecutiva" color="bg-coral/10 text-coral" icon={Flame} />
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,.75fr)]">
          <div className="space-y-5">
            <div className="card p-5 sm:p-6">
              <div className="flex items-center justify-between"><div><h2 className="font-display text-xl font-extrabold">Mis hábitos</h2><p className="mt-1 text-xs text-slate-400">Selecciona uno para ver su seguimiento</p></div><span className="rounded-full bg-violet/10 px-3 py-1.5 text-xs font-bold text-violet">{habits.length} activos</span></div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {weeklyStats.map(({ habit, percent, count, target }) => <HabitCard key={habit.id} habit={habit} selected={selectedHabit?.id === habit.id} checked={habit.checkIns.includes(selectedDate)} percent={percent} count={count} target={target} streak={getStreak(habit, selectedDate)} onSelect={() => setSelectedHabitId(habit.id)} onCheck={() => toggleCheckIn(habit.id)} onEdit={() => setModal(habit)} onDelete={() => setDeleting(habit)} />)}
                {habits.length === 0 && <div className="col-span-full py-14 text-center"><Sparkles className="mx-auto text-yellow" /><p className="mt-3 font-display font-extrabold">Empieza con un hábito pequeño</p><button onClick={() => setModal("new")} className="mt-3 text-sm font-bold text-violet">+ Crear hábito</button></div>}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <TrackingCalendar monthDate={monthDate} selectedDate={selectedDate} habit={selectedHabit} onMonth={setMonthDate} onSelect={setSelectedDate} />
            {selectedHabit && <SelectedHabitSummary habit={selectedHabit} date={selectedDate} onToggle={() => toggleCheckIn(selectedHabit.id)} />}
          </div>
        </section>
      </main>
      <MobileNav active="habits" />
      {modal && <HabitModal initial={modal === "new" ? null : modal} habits={habits} onClose={() => setModal(null)} onSave={(habit) => { updateData((current) => ({ ...current, habitItems: modal === "new" ? [...current.habitItems, habit] : current.habitItems.map((item) => item.id === habit.id ? habit : item) })); setSelectedHabitId(habit.id); setModal(null); }} />}
      {deleting && <DeleteDialog title="¿Eliminar este hábito?" detail={`Se borrará “${deleting.title}” y todo su historial de check-ins.`} onCancel={() => setDeleting(null)} onConfirm={() => { updateData((current) => { const legacy = { ...current.habits }; delete legacy[deleting.id]; return { ...current, habits: legacy, habitItems: current.habitItems.filter((habit) => habit.id !== deleting.id) }; }); setSelectedHabitId(null); setDeleting(null); }} />}
    </div>
  );
}

function PageHeader({ onNew }: { onNew: () => void }) {
  return <header className="flex items-start justify-between gap-4"><div><div className="lg:hidden"><Logo /></div><Link href="/" className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[.16em] text-violet lg:mt-0"><ArrowLeft size={15} /> Volver al inicio</Link><h1 className="mt-2 font-display text-[32px] font-extrabold tracking-[-.045em] sm:text-[40px]">Mis Hábitos <span className="inline-block animate-float">🌱</span></h1><p className="mt-1 text-sm text-slate-500 sm:text-base">La constancia convierte lo pequeño en extraordinario.</p></div><button onClick={onNew} aria-label="Nuevo hábito" className="mt-14 flex shrink-0 items-center gap-2 rounded-2xl bg-violet px-4 py-3 text-sm font-bold text-white shadow-soft sm:mt-8 lg:mt-1"><Plus size={18} /><span className="hidden sm:inline">Nuevo hábito</span></button></header>;
}

function StatCard({ label, value, detail, color, icon: Icon }: { label: string; value: string; detail: string; color: string; icon: LucideIcon }) {
  return <article className="card flex items-center gap-4 p-5"><span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${color}`}><Icon size={23} /></span><div><p className="text-xs font-bold uppercase tracking-[.12em] text-slate-400">{label}</p><p className="mt-1 font-display text-2xl font-extrabold">{value}</p><p className="text-[11px] text-slate-400">{detail}</p></div></article>;
}

function HabitCard({ habit, selected, checked, percent, count, target, streak, onSelect, onCheck, onEdit, onDelete }: { habit: PlannerHabit; selected: boolean; checked: boolean; percent: number; count: number; target: number; streak: number; onSelect: () => void; onCheck: () => void; onEdit: () => void; onDelete: () => void }) {
  const Icon = getHabitIcon(habit.icon);
  return <article onClick={onSelect} className={`cursor-pointer rounded-[22px] border p-4 transition hover:-translate-y-0.5 hover:shadow-md ${selected ? "border-violet/30 bg-violet/[.035]" : "border-slate-100 bg-white"}`}><div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl" style={{ backgroundColor: `${habit.color}18`, color: habit.color }}><Icon size={21} /></span><div className="min-w-0 flex-1"><p className="truncate font-display text-sm font-extrabold">{habit.title}</p><p className="mt-0.5 text-[11px] text-slate-400">{habit.frequency === "daily" ? "Diario" : `${habit.targetPerWeek} veces por semana`}</p></div><button onClick={(event) => { event.stopPropagation(); onCheck(); }} aria-label={checked ? `Desmarcar ${habit.title}` : `Completar ${habit.title}`} className={`grid size-9 shrink-0 place-items-center rounded-xl border-2 transition ${checked ? "border-transparent text-white" : "border-slate-200 text-transparent"}`} style={{ backgroundColor: checked ? habit.color : "white" }}><Check size={18} strokeWidth={3} /></button></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full transition-all" style={{ width: `${percent}%`, backgroundColor: habit.color }} /></div><div className="mt-2 flex items-center justify-between text-[10px]"><span className="font-bold" style={{ color: habit.color }}>{count}/{target} esta semana</span><span className="flex items-center gap-1 text-slate-400"><Flame size={11} /> {streak} días</span></div><div className="mt-3 flex justify-end border-t border-slate-100 pt-2"><button onClick={(event) => { event.stopPropagation(); onEdit(); }} className="icon-button !size-7" aria-label={`Editar ${habit.title}`}><Pencil size={13} /></button><button onClick={(event) => { event.stopPropagation(); onDelete(); }} className="icon-button !size-7 hover:!text-coral" aria-label={`Eliminar ${habit.title}`}><Trash2 size={13} /></button></div></article>;
}

function TrackingCalendar({ monthDate, selectedDate, habit, onMonth, onSelect }: { monthDate: Date; selectedDate: string; habit?: PlannerHabit; onMonth: (date: Date) => void; onSelect: (date: string) => void }) {
  const days = getMonthGrid(monthDate);
  const labelRaw = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(monthDate);
  const label = labelRaw.charAt(0).toLocaleUpperCase(locale) + labelRaw.slice(1);
  return <section className="card p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-display text-lg font-extrabold">Seguimiento</h2><p className="mt-0.5 text-xs text-slate-400">{habit?.title ?? "Selecciona un hábito"}</p></div><div className="flex"><button onClick={() => onMonth(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1, 12))} className="icon-button"><ChevronLeft size={18} /></button><button onClick={() => onMonth(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1, 12))} className="icon-button"><ChevronRight size={18} /></button></div></div><p className="mt-5 text-center text-sm font-bold">{label}</p><div className="mt-3 grid grid-cols-7 text-center text-[10px] font-bold text-slate-400">{["L", "M", "X", "J", "V", "S", "D"].map((day) => <span key={day} className="py-2">{day}</span>)}</div><div className="grid grid-cols-7 gap-1">{days.map((date) => { const key = toDateKey(date); const checked = habit?.checkIns.includes(key); const inMonth = date.getMonth() === monthDate.getMonth(); return <button key={key} onClick={() => onSelect(key)} className={`relative grid aspect-square place-items-center rounded-xl text-xs font-bold transition ${selectedDate === key ? "ring-2 ring-violet ring-offset-1" : ""} ${inMonth ? "text-ink" : "text-slate-300"}`} style={{ backgroundColor: checked ? `${habit?.color}25` : undefined, color: checked ? habit?.color : undefined }}>{date.getDate()}{checked && <span className="absolute bottom-1 size-1 rounded-full" style={{ backgroundColor: habit?.color }} />}</button>; })}</div></section>;
}

function SelectedHabitSummary({ habit, date, onToggle }: { habit: PlannerHabit; date: string; onToggle: () => void }) {
  const checked = habit.checkIns.includes(date); const Icon = getHabitIcon(habit.icon);
  const dateLabel = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }).format(parseDate(date));
  return <section className="relative overflow-hidden rounded-[28px] p-5 text-white shadow-soft sm:p-6" style={{ background: `linear-gradient(135deg, ${habit.color}, #8D67EF)` }}><Sparkles className="absolute right-5 top-5 text-white/40" /><div className="flex items-center gap-3"><span className="grid size-12 place-items-center rounded-2xl bg-white/20"><Icon size={24} /></span><div><p className="text-xs text-white/70">{dateLabel}</p><p className="font-display text-lg font-extrabold">{habit.title}</p></div></div><button onClick={onToggle} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3 text-sm font-bold transition hover:-translate-y-0.5" style={{ color: habit.color }}>{checked ? <><Check size={17} /> Check-in completado</> : <>Hacer check-in</>}</button></section>;
}

function HabitModal({ initial, habits, onClose, onSave }: { initial: PlannerHabit | null; habits: PlannerHabit[]; onClose: () => void; onSave: (habit: PlannerHabit) => void }) {
  const [title, setTitle] = useState(initial?.title ?? ""); const [frequency, setFrequency] = useState<HabitFrequency>(initial?.frequency ?? "daily"); const [target, setTarget] = useState(initial?.targetPerWeek ?? 3); const [color, setColor] = useState(initial?.color ?? habitColors[0]); const [icon, setIcon] = useState<PlannerHabit["icon"]>(initial?.icon ?? "star"); const [error, setError] = useState("");
  function submit(event: FormEvent) { event.preventDefault(); const clean = title.trim(); if (!clean) return setError("Escribe un nombre para el hábito."); if (habits.some((habit) => habit.id !== initial?.id && habit.title.toLocaleLowerCase(locale) === clean.toLocaleLowerCase(locale))) return setError("Ya existe un hábito con ese nombre."); onSave({ id: initial?.id ?? createId("habit"), title: clean, frequency, targetPerWeek: frequency === "daily" ? 7 : target, color, icon, checkIns: initial?.checkIns ?? [], createdAt: initial?.createdAt ?? new Date().toISOString() }); }
  return <div className="fixed inset-0 z-50 grid place-items-end bg-ink/35 backdrop-blur-sm sm:place-items-center sm:p-5" role="dialog" aria-modal="true"><form onSubmit={submit} className="w-full rounded-t-[30px] bg-cream p-5 shadow-2xl sm:max-w-lg sm:rounded-[30px] sm:p-7"><div className="flex justify-between"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-violet">Mis Hábitos</p><h2 className="mt-1 font-display text-2xl font-extrabold">{initial ? "Editar hábito" : "Nuevo hábito"}</h2></div><button type="button" onClick={onClose} className="icon-button bg-white" aria-label="Cerrar"><X size={18} /></button></div><div className="mt-6 space-y-4"><label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-500">Nombre</span><input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} className="field" placeholder="Ej. Meditar" /></label><div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => setFrequency("daily")} className={`rounded-2xl border p-3 text-sm font-bold ${frequency === "daily" ? "border-violet bg-violet/10 text-violet" : "border-slate-200"}`}>Diario</button><button type="button" onClick={() => setFrequency("weekly")} className={`rounded-2xl border p-3 text-sm font-bold ${frequency === "weekly" ? "border-violet bg-violet/10 text-violet" : "border-slate-200"}`}>Semanal</button></div>{frequency === "weekly" && <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-500">Objetivo semanal: {target} veces</span><input type="range" min="1" max="7" value={target} onChange={(event) => setTarget(Number(event.target.value))} className="w-full accent-violet" /></label>}<div><span className="mb-2 block text-xs font-bold text-slate-500">Icono</span><div className="flex flex-wrap gap-2">{iconOptions.map((item) => { const Icon = item.icon; return <button key={item.value} type="button" onClick={() => setIcon(item.value)} aria-label={item.label} className={`grid size-10 place-items-center rounded-xl ${icon === item.value ? "bg-violet text-white" : "bg-white text-slate-400"}`}><Icon size={19} /></button>; })}</div></div><div><span className="mb-2 block text-xs font-bold text-slate-500">Color</span><div className="flex gap-2">{habitColors.map((item) => <button key={item} type="button" onClick={() => setColor(item)} aria-label={`Color ${item}`} className={`size-8 rounded-full ${color === item ? "ring-2 ring-offset-2" : ""}`} style={{ backgroundColor: item, color: item }} />)}</div></div>{error && <p className="rounded-xl bg-coral/10 p-2 text-sm font-semibold text-coral">{error}</p>}</div><div className="mt-6 flex gap-3"><button type="button" onClick={onClose} className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-bold">Cancelar</button><button className="flex-1 rounded-2xl bg-violet py-3 text-sm font-bold text-white">Guardar</button></div></form></div>;
}

function DeleteDialog({ title, detail, onCancel, onConfirm }: { title: string; detail: string; onCancel: () => void; onConfirm: () => void }) { return <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/35 p-5 backdrop-blur-sm" role="alertdialog" aria-modal="true"><div className="w-full max-w-sm rounded-[28px] bg-white p-6 text-center"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-coral/10 text-coral"><Trash2 /></span><h2 className="mt-4 font-display text-xl font-extrabold">{title}</h2><p className="mt-2 text-sm text-slate-500">{detail}</p><div className="mt-6 flex gap-3"><button onClick={onCancel} className="flex-1 rounded-2xl border py-3 text-sm font-bold">Cancelar</button><button onClick={onConfirm} className="flex-1 rounded-2xl bg-coral py-3 text-sm font-bold text-white">Eliminar</button></div></div></div>; }

function getHabitIcon(icon: PlannerHabit["icon"]): LucideIcon { return iconOptions.find((item) => item.value === icon)?.icon ?? Star; }
function getWeekRange(date: string) { const start = parseDate(date); start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); const end = new Date(start); end.setDate(start.getDate() + 6); return [toDateKey(start), toDateKey(end)] as const; }
function getWeeklyStats(habit: PlannerHabit, date: string) { const [start, end] = getWeekRange(date); const count = habit.checkIns.filter((item) => item >= start && item <= end).length; const target = habit.frequency === "daily" ? 7 : habit.targetPerWeek; return { count, target, percent: Math.min(100, Math.round((count / target) * 100)) }; }
function getStreak(habit: PlannerHabit, date: string) { const dates = new Set(habit.checkIns); let cursor = parseDate(date); if (!dates.has(toDateKey(cursor))) cursor.setDate(cursor.getDate() - 1); let streak = 0; while (dates.has(toDateKey(cursor))) { streak += 1; cursor.setDate(cursor.getDate() - 1); } return streak; }
function getMonthGrid(month: Date) { const first = new Date(month.getFullYear(), month.getMonth(), 1, 12); first.setDate(first.getDate() - ((first.getDay() + 6) % 7)); return Array.from({ length: 42 }, (_, index) => { const date = new Date(first); date.setDate(first.getDate() + index); return date; }); }

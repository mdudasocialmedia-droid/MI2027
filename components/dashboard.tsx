"use client";

import {
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  Dumbbell,
  Heart,
  Leaf,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Star,
  Target,
  Trash2,
  Trophy,
  Waves,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { DesktopSidebar, Logo, MobileNav } from "@/components/app-navigation";
import { calculateCurrentXp, createId, parseDate, type PlannerGoal, type PlannerTask, toDateKey, usePlannerStore } from "@/lib/planner-store";

type Task = PlannerTask;
type Habit = { id: string; title: string; done: boolean; icon: LucideIcon; color: string; soft: string };

const habitConfig = [
  { id: "agua", title: "Agua", icon: Waves, color: "#2DA9E9", soft: "#DDF4FF" },
  { id: "ejercicio", title: "Ejercicio", icon: Dumbbell, color: "#FF6B78", soft: "#FFE5E9" },
  { id: "lectura", title: "Lectura", icon: BookOpen, color: "#7954F6", soft: "#ECE6FF" },
  { id: "gratitud", title: "Gratitud", icon: Heart, color: "#E74788", soft: "#FFE1EF" },
] as const;

export function Dashboard() {
  const { data, updateData } = usePlannerStore();
  const tasks = data.tasks.filter((task) => task.date === data.selectedDate);
  const [newTask, setNewTask] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const completedTasks = tasks.filter((task) => task.done).length;
  const completedHabits = data.habitItems.filter((habit) => habit.checkIns.includes(data.selectedDate)).length;
  const totalItems = tasks.length + data.habitItems.length;
  const completedItems = completedTasks + completedHabits;
  const progress = totalItems ? Math.round((completedItems / totalItems) * 100) : 0;
  const xp = calculateCurrentXp(data);
  const level = Math.floor(xp / 200) + 1;
  const levelProgress = xp % 200;

  const habits: Habit[] = useMemo(
    () => data.habitItems.slice(0, 4).map((habit) => {
      const config = habitConfig.find((item) => item.id === habit.id);
      const icons: Record<string, LucideIcon> = { water: Waves, exercise: Dumbbell, book: BookOpen, heart: Heart, star: Star, leaf: Leaf };
      return { id: habit.id, title: habit.title, icon: icons[habit.icon] ?? Heart, color: habit.color, soft: config?.soft ?? `${habit.color}20`, done: habit.checkIns.includes(data.selectedDate) };
    }),
    [data.habitItems, data.selectedDate],
  );
  const annualGoal = data.goals.find((goal) => goal.annual) ?? data.goals[0];

  function addTask(event: FormEvent) {
    event.preventDefault();
    const title = newTask.trim();
    if (!title) return;
    updateData((current) => ({ ...current, tasks: [...current.tasks, { id: createId("task"), title, done: false, date: current.selectedDate, createdAt: new Date().toISOString() }] }));
    setNewTask("");
    setAdding(false);
  }

  function saveEdit(id: string) {
    const title = editTitle.trim();
    if (title) updateData((current) => ({ ...current, tasks: current.tasks.map((task) => (task.id === id ? { ...task, title } : task)) }));
    setEditingId(null);
  }

  return (
    <div className="min-h-screen lg:flex">
      <DesktopSidebar active="dashboard" />

      <main className="mx-auto w-full max-w-[1500px] px-4 pb-28 pt-5 sm:px-6 lg:ml-[252px] lg:px-8 lg:pb-10 lg:pt-8 xl:px-10">
        <Header date={data.selectedDate} />

        <section className="mt-7 grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,.8fr)]">
          <div className="space-y-5">
            <div className="grid gap-5 md:grid-cols-[minmax(0,1.5fr)_minmax(250px,.8fr)]">
              <ProgressCard progress={progress} completed={completedItems} total={totalItems} />
              <XpCard xp={xp} level={level} levelProgress={levelProgress} />
            </div>
            <WeekPicker selected={data.selectedDate} onSelect={(date) => updateData((current) => ({ ...current, selectedDate: date }))} />
            <TasksCard
              tasks={tasks}
              completed={completedTasks}
              adding={adding}
              setAdding={setAdding}
              newTask={newTask}
              setNewTask={setNewTask}
              addTask={addTask}
              editingId={editingId}
              editTitle={editTitle}
              setEditTitle={setEditTitle}
              saveEdit={saveEdit}
              startEdit={(task) => { setEditingId(task.id); setEditTitle(task.title); }}
              toggle={(id) => updateData((current) => ({ ...current, tasks: current.tasks.map((task) => task.id === id ? { ...task, done: !task.done } : task) }))}
              remove={(id) => updateData((current) => ({ ...current, tasks: current.tasks.filter((task) => task.id !== id) }))}
            />
          </div>

          <div className="space-y-5">
            <HabitsCard habits={habits} toggle={(id) => updateData((current) => ({ ...current, habits: { ...current.habits, [id]: !current.habitItems.find((habit) => habit.id === id)?.checkIns.includes(current.selectedDate) }, habitItems: current.habitItems.map((habit) => habit.id === id ? { ...habit, checkIns: habit.checkIns.includes(current.selectedDate) ? habit.checkIns.filter((date) => date !== current.selectedDate) : [...habit.checkIns, current.selectedDate].sort() } : habit) }))} />
            <AnnualGoalCard goal={annualGoal} />
            <MotivationCard />
          </div>
        </section>
      </main>

      <MobileNav active="dashboard" />
    </div>
  );
}

function Header({ date }: { date: string }) {
  const dateLabel = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(parseDate(date));
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <div className="lg:hidden"><Logo /></div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[.19em] text-violet lg:mt-0">{dateLabel}</p>
        <h1 className="mt-2 font-display text-[32px] font-extrabold leading-tight tracking-[-.045em] sm:text-[40px]">¡Hola, Duda! <span className="inline-block animate-float">☀️</span></h1>
        <p className="mt-1 text-sm text-slate-500 sm:text-base">Hoy es un gran día para construir el año que sueñas.</p>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <button className="icon-button hidden sm:inline-flex" aria-label="Buscar"><Search size={20} /></button>
        <button className="icon-button relative" aria-label="Notificaciones"><Bell size={20} /><span className="absolute right-2 top-2 size-2 rounded-full bg-coral ring-2 ring-cream" /></button>
        <button className="ml-1 flex items-center gap-2 rounded-2xl p-1.5 transition hover:bg-white sm:ml-2" aria-label="Abrir perfil">
          <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-yellow via-coral to-violet text-sm font-extrabold text-white ring-4 ring-white">DU</span>
          <span className="hidden text-left sm:block"><span className="block text-sm font-bold">Duda</span><span className="block text-[11px] text-slate-500">Luna Planner</span></span>
          <ChevronDown className="hidden text-slate-400 sm:block" size={16} />
        </button>
      </div>
    </header>
  );
}

function ProgressCard({ progress, completed, total }: { progress: number; completed: number; total: number }) {
  return (
    <article className="relative min-h-[246px] overflow-hidden rounded-[30px] bg-gradient-to-br from-[#8B67FA] via-[#9E72F3] to-[#E084DA] p-6 text-white shadow-soft sm:p-7">
      <div className="absolute -bottom-16 -left-14 size-52 rounded-full bg-white/15 blur-sm" />
      <div className="absolute -right-9 -top-9 size-40 rounded-full bg-[#FFD76A]/30 blur-xl" />
      <Star className="absolute right-[12%] top-8 animate-float text-yellow" size={25} fill="currentColor" />
      <Sparkles className="absolute bottom-8 right-8 text-white/60" size={22} />
      <div className="relative z-10 max-w-[430px]">
        <p className="font-display text-sm font-bold text-white/80">Tu progreso de hoy</p>
        <div className="mt-2 flex items-end gap-3"><strong className="font-display text-6xl font-extrabold tracking-[-.06em]">{progress}%</strong><span className="mb-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold">{completed}/{total} checks</span></div>
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#5E3BC4]/30 p-[3px]"><div className="h-full rounded-full bg-gradient-to-r from-white to-[#FFE6A3] transition-all duration-500" style={{ width: `${progress}%` }} /></div>
        <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/85">{progress >= 75 ? "¡Brillas con luz propia! Sigue así." : "Cada check te acerca un poco más. ¡Vamos!"}</p>
      </div>
      <div className="absolute bottom-[-12px] right-8 hidden h-36 w-32 sm:block">
        <div className="absolute bottom-0 left-1/2 h-24 w-24 -translate-x-1/2 rounded-[48%_48%_42%_42%] bg-[#FFF1E8]" />
        <div className="absolute left-1/2 top-3 size-20 -translate-x-1/2 rounded-full bg-[#F5B795] shadow-[inset_0_-7px_0_rgba(220,117,91,.18)]" />
        <div className="absolute left-1/2 top-0 h-12 w-24 -translate-x-1/2 rounded-[70%_50%_45%_25%] bg-[#4A2535]" />
        <Heart className="absolute bottom-8 left-1/2 -translate-x-1/2 text-coral" size={28} fill="currentColor" />
      </div>
    </article>
  );
}

function XpCard({ xp, level, levelProgress }: { xp: number; level: number; levelProgress: number }) {
  return (
    <article className="card overflow-hidden p-6">
      <div className="flex items-start justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[.16em] text-slate-400">Nivel actual</p><p className="mt-2 font-display text-2xl font-extrabold">Crece a tu ritmo</p></div>
        <span className="grid size-12 place-items-center rounded-2xl bg-yellow text-ink shadow-[0_8px_20px_rgba(255,215,106,.45)]"><Trophy size={25} /></span>
      </div>
      <div className="mt-7 flex items-end gap-2"><span className="font-display text-4xl font-extrabold text-violet">{level}</span><span className="mb-1 text-sm font-semibold text-slate-400">nivel</span></div>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-violet/10"><div className="h-full rounded-full bg-gradient-to-r from-violet to-coral transition-all" style={{ width: `${(levelProgress / 200) * 100}%` }} /></div>
      <div className="mt-3 flex items-center justify-between text-xs"><span className="font-bold text-violet">{xp} XP</span><span className="text-slate-400">{200 - levelProgress} XP para subir</span></div>
    </article>
  );
}

function WeekPicker({ selected, onSelect }: { selected: string; onSelect: (date: string) => void }) {
  const selectedDate = parseDate(selected);
  const monday = new Date(selectedDate);
  monday.setDate(selectedDate.getDate() - ((selectedDate.getDay() + 6) % 7));
  const week = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return { name: new Intl.DateTimeFormat("es-ES", { weekday: "short" }).format(date).replace(".", ""), number: date.getDate(), key: toDateKey(date) };
  });
  const rawMonthLabel = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(selectedDate);
  const monthLabel = rawMonthLabel.charAt(0).toLocaleUpperCase("es-ES") + rawMonthLabel.slice(1);
  return (
    <article className="card p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between"><div><p className="font-display text-lg font-extrabold">Mi semana</p><p className="mt-0.5 text-xs text-slate-400">{monthLabel}</p></div><CalendarDays className="text-violet" size={22} /></div>
      <div className="grid grid-cols-7 gap-2">
        {week.map((day) => <button key={day.key} onClick={() => onSelect(day.key)} className={`rounded-2xl px-1 py-3 text-center transition ${selected === day.key ? "-translate-y-1 bg-violet text-white shadow-soft" : "bg-[#FAF6F2] text-slate-500 hover:bg-violet/10 hover:text-violet"}`} aria-pressed={selected === day.key}><span className="block text-[10px] font-bold capitalize sm:text-xs">{day.name}</span><span className="mt-1 block font-display text-sm font-extrabold sm:text-base">{day.number}</span></button>)}
      </div>
    </article>
  );
}

type TasksCardProps = {
  tasks: Task[]; completed: number; adding: boolean; setAdding: (value: boolean) => void;
  newTask: string; setNewTask: (value: string) => void; addTask: (event: FormEvent) => void;
  editingId: string | null; editTitle: string; setEditTitle: (value: string) => void;
  saveEdit: (id: string) => void; startEdit: (task: Task) => void; toggle: (id: string) => void; remove: (id: string) => void;
};

function TasksCard(props: TasksCardProps) {
  const taskProgress = props.tasks.length ? (props.completed / props.tasks.length) * 100 : 0;
  return (
    <article className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
        <div><h2 className="font-display text-lg font-extrabold">Mis tareas de hoy</h2><p className="mt-0.5 text-xs text-slate-400">{props.completed} de {props.tasks.length} completadas</p></div>
        <button onClick={() => props.setAdding(!props.adding)} className="flex items-center gap-1.5 rounded-full bg-violet/10 px-3.5 py-2 text-xs font-bold text-violet transition hover:bg-violet hover:text-white"><Plus size={15} /> Añadir</button>
      </div>
      {props.adding && <form onSubmit={props.addTask} className="flex gap-2 border-b border-violet/10 bg-violet/[.035] p-4 sm:px-6"><input autoFocus value={props.newTask} onChange={(event) => props.setNewTask(event.target.value)} placeholder="Escribe una nueva tarea..." className="min-w-0 flex-1 rounded-xl border border-violet/15 bg-white px-3 py-2.5 text-sm outline-none" /><button className="rounded-xl bg-violet px-4 text-sm font-bold text-white">Guardar</button><button type="button" onClick={() => props.setAdding(false)} className="icon-button"><X size={18} /></button></form>}
      <div className="divide-y divide-slate-100 px-5 sm:px-6">
        {props.tasks.length === 0 && <div className="py-12 text-center"><Sparkles className="mx-auto text-yellow" /><p className="mt-3 font-display font-bold">Tu lista está lista para empezar</p><p className="mt-1 text-sm text-slate-400">Añade tu primera tarea de hoy.</p></div>}
        {props.tasks.map((task) => (
          <div key={task.id} className="group flex min-h-[60px] items-center gap-3 py-3 animate-pop">
            <button onClick={() => props.toggle(task.id)} aria-label={task.done ? `Marcar ${task.title} como pendiente` : `Completar ${task.title}`} className={`grid size-6 shrink-0 place-items-center rounded-[9px] border-2 transition ${task.done ? "border-violet bg-violet text-white" : "border-slate-300 bg-white hover:border-violet"}`}>{task.done && <Check size={15} strokeWidth={3} />}</button>
            {props.editingId === task.id ? <form onSubmit={(event) => { event.preventDefault(); props.saveEdit(task.id); }} className="flex min-w-0 flex-1 gap-2"><input autoFocus value={props.editTitle} onChange={(event) => props.setEditTitle(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-violet/20 px-2.5 py-1.5 text-sm" /><button className="text-xs font-bold text-violet">Listo</button></form> : <span className={`min-w-0 flex-1 text-sm font-medium transition ${task.done ? "text-slate-400 line-through" : "text-ink"}`}>{task.title}</span>}
            <div className="flex shrink-0 opacity-70 transition sm:opacity-0 sm:group-hover:opacity-100"><button onClick={() => props.startEdit(task)} className="icon-button !size-8" aria-label={`Editar ${task.title}`}><Pencil size={15} /></button><button onClick={() => props.remove(task.id)} className="icon-button !size-8 hover:!bg-coral/10 hover:!text-coral" aria-label={`Eliminar ${task.title}`}><Trash2 size={15} /></button></div>
          </div>
        ))}
      </div>
      <div className="px-5 pb-5 pt-3 sm:px-6"><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-violet to-[#A881FF] transition-all" style={{ width: `${taskProgress}%` }} /></div></div>
    </article>
  );
}

function HabitsCard({ habits, toggle }: { habits: Habit[]; toggle: (id: string) => void }) {
  return (
    <article className="card p-5 sm:p-6">
      <div className="flex items-center justify-between"><div><h2 className="font-display text-lg font-extrabold">Mis hábitos</h2><p className="mt-0.5 text-xs text-slate-400">Un gesto pequeño, todos los días</p></div><Leaf className="text-mint" size={24} /></div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {habits.map((habit) => {
          const Icon = habit.icon;
          return <button key={habit.id} onClick={() => toggle(habit.id)} aria-pressed={habit.done} className={`relative flex items-center gap-3 rounded-[20px] border p-3.5 text-left transition hover:-translate-y-1 ${habit.done ? "border-transparent shadow-sm" : "border-slate-100 bg-white"}`} style={{ backgroundColor: habit.done ? habit.soft : undefined }}><span className="grid size-10 shrink-0 place-items-center rounded-2xl" style={{ backgroundColor: habit.soft, color: habit.color }}><Icon size={20} strokeWidth={2.5} /></span><span><span className="block text-xs font-bold">{habit.title}</span><span className="mt-0.5 block text-[10px] text-slate-400">{habit.done ? "¡Hecho!" : "Pendiente"}</span></span>{habit.done && <span className="absolute -right-1 -top-1 grid size-6 place-items-center rounded-full bg-mint text-white ring-4 ring-white"><Check size={13} strokeWidth={3} /></span>}</button>;
        })}
      </div>
    </article>
  );
}

function AnnualGoalCard({ goal }: { goal?: PlannerGoal }) {
  const progress = goal?.progress ?? 0;
  return (
    <article className="card relative overflow-hidden p-5 sm:p-6">
      <div className="absolute -bottom-10 -right-8 size-32 rounded-full bg-mint/25" />
      <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-coral">Mi meta del año</p><h2 className="mt-2 font-display text-xl font-extrabold">{goal?.title ?? "Crea tu meta anual"}</h2></div><span className="grid size-14 place-items-center rounded-2xl bg-coral/10 text-coral"><Target size={29} /></span></div>
      <div className="relative mt-6 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-mint to-[#52C9AA] transition-all" style={{ width: `${progress}%` }} /></div>
      <div className="relative mt-3 flex justify-between text-xs"><span className="font-bold text-[#3BAE90]">{progress}% completado</span><span className="text-slate-400">{progress}%</span></div>
    </article>
  );
}

function MotivationCard() {
  return (
    <article className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#FFF0F4] to-[#FFF3DE] p-6">
      <div className="absolute -right-8 -top-10 size-32 rounded-full border-[22px] border-white/40" />
      <Sparkles className="text-coral" size={22} />
      <p className="relative mt-3 font-display text-lg font-extrabold leading-snug">Disciplina hoy,<br />resultados mañana.</p>
      <p className="relative mt-2 text-xs text-slate-500">Tu constancia también merece celebrarse.</p>
    </article>
  );
}

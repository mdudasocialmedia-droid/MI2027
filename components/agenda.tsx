"use client";

import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Edit3,
  Plus,
  Repeat2,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { DesktopSidebar, Logo, MobileNav } from "@/components/app-navigation";
import {
  createId,
  occursOnDate,
  parseDate,
  type PlannerEvent,
  type PlannerTask,
  type Recurrence,
  toDateKey,
  usePlannerStore,
} from "@/lib/planner-store";
import { getPlanningYear } from "@/lib/planner-preferences";

type CalendarView = "month" | "week" | "day";

const locale = "es-ES";
const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const categories = ["Personal", "Trabajo", "Salud", "Familia", "Estudios", "Otros"];
const colors = ["#7954F6", "#FF6B78", "#F5B82E", "#43C5A2", "#4AA8E8", "#E85BA5"];
const recurrenceLabels: Record<Recurrence, string> = { none: "No se repite", daily: "Cada día", weekly: "Cada semana", monthly: "Cada mes" };

const emptyEvent = (date: string): Omit<PlannerEvent, "id" | "createdAt"> => ({
  title: "",
  description: "",
  date,
  startTime: "09:00",
  endTime: "10:00",
  category: "Personal",
  color: colors[0],
  allDay: false,
  recurrence: "none",
});

function clampInitialDate() {
  const today = new Date();
  today.setFullYear(getPlanningYear());
  return toDateKey(today);
}

export function Agenda() {
  const { data, updateData, ready } = usePlannerStore();
  const [selectedDate, setSelectedDate] = useState(clampInitialDate);
  const [view, setView] = useState<CalendarView>("month");
  const [eventModal, setEventModal] = useState<PlannerEvent | "new" | null>(null);
  const [deleteEvent, setDeleteEvent] = useState<PlannerEvent | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState("");

  useEffect(() => {
    if (ready && /^\d{4}-\d{2}-\d{2}$/.test(data.selectedDate)) setSelectedDate(data.selectedDate);
  }, [ready, data.selectedDate]);

  const selectedEvents = useMemo(
    () => data.events.filter((event) => occursOnDate(event, selectedDate)).sort(compareEvents),
    [data.events, selectedDate],
  );
  const selectedTasks = data.tasks.filter((task) => task.date === selectedDate);

  function chooseDate(date: string) {
    setSelectedDate(date);
    updateData((current) => ({ ...current, selectedDate: date }));
  }

  function navigate(direction: number) {
    const current = parseDate(selectedDate);
    if (view === "month") current.setMonth(current.getMonth() + direction);
    if (view === "week") current.setDate(current.getDate() + direction * 7);
    if (view === "day") current.setDate(current.getDate() + direction);
    chooseDate(toDateKey(current));
  }

  function addTask(event: FormEvent) {
    event.preventDefault();
    const title = taskTitle.trim();
    if (!title) return;
    const task: PlannerTask = { id: createId("task"), title, done: false, date: selectedDate, createdAt: new Date().toISOString() };
    updateData((current) => current.tasks.some((item) => item.date === selectedDate && item.title.toLocaleLowerCase(locale) === title.toLocaleLowerCase(locale)) ? current : ({ ...current, tasks: [...current.tasks, task] }));
    setTaskTitle("");
  }

  function saveTask(id: string) {
    const title = editingTaskTitle.trim();
    if (title) updateData((current) => ({ ...current, tasks: current.tasks.map((task) => task.id === id ? { ...task, title } : task) }));
    setEditingTask(null);
  }

  return (
    <div className="min-h-screen lg:flex">
      <DesktopSidebar active="agenda" />
      <main className="mx-auto w-full max-w-[1550px] px-4 pb-28 pt-5 sm:px-6 lg:ml-[252px] lg:px-8 lg:pb-10 lg:pt-8 xl:px-10">
        <AgendaHeader onNew={() => setEventModal("new")} />

        <section className="mt-7 grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,.65fr)]">
          <div className="card overflow-hidden">
            <CalendarToolbar view={view} setView={setView} date={selectedDate} onNavigate={navigate} onToday={() => chooseDate(clampInitialDate())} />
            {view === "month" && <MonthView selectedDate={selectedDate} events={data.events} onSelect={chooseDate} />}
            {view === "week" && <WeekView selectedDate={selectedDate} events={data.events} onSelect={chooseDate} />}
            {view === "day" && <DayView date={selectedDate} events={selectedEvents} onEdit={setEventModal} onNew={() => setEventModal("new")} />}
          </div>

          <aside className="space-y-5">
            <DaySummary date={selectedDate} events={selectedEvents} onEdit={setEventModal} onDelete={setDeleteEvent} onNew={() => setEventModal("new")} />
            <TasksPanel
              tasks={selectedTasks}
              title={taskTitle}
              setTitle={setTaskTitle}
              onAdd={addTask}
              editingId={editingTask}
              editingTitle={editingTaskTitle}
              setEditingTitle={setEditingTaskTitle}
              onEdit={(task) => { setEditingTask(task.id); setEditingTaskTitle(task.title); }}
              onSave={saveTask}
              onToggle={(id) => updateData((current) => ({ ...current, tasks: current.tasks.map((task) => task.id === id ? { ...task, done: !task.done } : task) }))}
              onDelete={(id) => updateData((current) => ({ ...current, tasks: current.tasks.filter((task) => task.id !== id) }))}
            />
          </aside>
        </section>
      </main>
      <MobileNav active="agenda" />

      {eventModal && <EventModal
        key={eventModal === "new" ? `new-${selectedDate}` : eventModal.id}
        initial={eventModal === "new" ? emptyEvent(selectedDate) : eventModal}
        editingId={eventModal === "new" ? null : eventModal.id}
        events={data.events}
        onClose={() => setEventModal(null)}
        onSave={(event) => {
          updateData((current) => ({ ...current, events: eventModal === "new" ? [...current.events, event] : current.events.map((item) => item.id === event.id ? event : item) }));
          chooseDate(event.date);
          setEventModal(null);
        }}
      />}
      {deleteEvent && <ConfirmDelete event={deleteEvent} onCancel={() => setDeleteEvent(null)} onConfirm={() => {
        updateData((current) => ({ ...current, events: current.events.filter((event) => event.id !== deleteEvent.id) }));
        setDeleteEvent(null);
      }} />}
    </div>
  );
}

function AgendaHeader({ onNew }: { onNew: () => void }) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <div className="lg:hidden"><Logo /></div>
        <Link href="/" className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[.16em] text-violet transition hover:gap-2.5 lg:mt-0"><ArrowLeft size={15} /> Volver al inicio</Link>
        <h1 className="mt-2 font-display text-[32px] font-extrabold tracking-[-.045em] sm:text-[40px]">Mi Agenda <span className="inline-block animate-float">✨</span></h1>
        <p className="mt-1 text-sm text-slate-500 sm:text-base">Tu tiempo, tus planes y espacio para lo que importa.</p>
      </div>
      <button onClick={onNew} aria-label="Nuevo evento" className="mt-14 flex shrink-0 items-center gap-2 rounded-2xl bg-violet px-4 py-3 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 sm:mt-8 lg:mt-1"><Plus size={18} /> <span className="hidden sm:inline">Nuevo evento</span></button>
    </header>
  );
}

function CalendarToolbar({ view, setView, date, onNavigate, onToday }: { view: CalendarView; setView: (view: CalendarView) => void; date: string; onNavigate: (direction: number) => void; onToday: () => void }) {
  const parsed = parseDate(date);
  const title = capitalizeFirst(view === "month"
    ? new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(parsed)
    : new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(parsed));
  return (
    <div className="border-b border-slate-100 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2"><button onClick={() => onNavigate(-1)} className="icon-button bg-slate-50" aria-label="Periodo anterior"><ChevronLeft size={20} /></button><button onClick={() => onNavigate(1)} className="icon-button bg-slate-50" aria-label="Periodo siguiente"><ChevronRight size={20} /></button><button onClick={onToday} className="rounded-xl border border-violet/15 px-3 py-2 text-xs font-bold text-violet transition hover:bg-violet/10">Hoy</button></div>
        <h2 className="order-first w-full text-center font-display text-xl font-extrabold sm:order-none sm:w-auto sm:text-2xl">{title}</h2>
        <div className="flex rounded-xl bg-[#F5F1EC] p-1" role="group" aria-label="Vista del calendario">
          {(["month", "week", "day"] as CalendarView[]).map((item) => <button key={item} onClick={() => setView(item)} aria-pressed={view === item} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${view === item ? "bg-white text-violet shadow-sm" : "text-slate-500"}`}>{item === "month" ? "Mes" : item === "week" ? "Semana" : "Día"}</button>)}
        </div>
      </div>
    </div>
  );
}

function MonthView({ selectedDate, events, onSelect }: { selectedDate: string; events: PlannerEvent[]; onSelect: (date: string) => void }) {
  const days = getMonthGrid(selectedDate);
  const selectedMonth = parseDate(selectedDate).getMonth();
  const today = toDateKey(new Date());
  return (
    <div className="p-2 sm:p-5">
      <div className="grid grid-cols-7">{weekDays.map((day) => <div key={day} className="py-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-xs">{day}</div>)}</div>
      <div className="grid grid-cols-7 overflow-hidden rounded-[20px] border border-slate-100 bg-slate-100 gap-px">
        {days.map((date) => {
          const key = toDateKey(date);
          const dayEvents = events.filter((event) => occursOnDate(event, key)).slice(0, 3);
          const selected = key === selectedDate;
          const isToday = key === today;
          const muted = date.getMonth() !== selectedMonth;
          return <button key={key} onClick={() => onSelect(key)} className={`group relative min-h-[74px] bg-white p-1.5 text-left transition hover:bg-violet/[.04] sm:min-h-[116px] sm:p-2.5 ${selected ? "z-10 ring-2 ring-inset ring-violet" : ""}`}>
            <span className={`grid size-7 place-items-center rounded-full text-xs font-bold sm:size-8 sm:text-sm ${selected ? "bg-violet text-white" : isToday ? "bg-yellow text-ink" : muted ? "text-slate-300" : "text-ink"}`}>{date.getDate()}</span>
            <div className="mt-1.5 flex flex-wrap gap-1 sm:block sm:space-y-1">
              {dayEvents.map((event) => <div key={event.id} className="flex items-center gap-1 sm:rounded-lg sm:px-1.5 sm:py-1" style={{ backgroundColor: `${event.color}16` }}><span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: event.color }} /><span className="hidden truncate text-[10px] font-semibold sm:block" style={{ color: event.color }}>{event.title}</span></div>)}
            </div>
          </button>;
        })}
      </div>
    </div>
  );
}

function WeekView({ selectedDate, events, onSelect }: { selectedDate: string; events: PlannerEvent[]; onSelect: (date: string) => void }) {
  const days = getWeek(selectedDate);
  const today = toDateKey(new Date());
  return (
    <div className="overflow-x-auto p-3 sm:p-5">
      <div className="grid min-w-[760px] grid-cols-7 gap-2">
        {days.map((date) => {
          const key = toDateKey(date);
          const dayEvents = events.filter((event) => occursOnDate(event, key)).sort(compareEvents);
          const selected = key === selectedDate;
          return <button key={key} onClick={() => onSelect(key)} className={`min-h-[430px] rounded-[20px] border p-2 text-left transition ${selected ? "border-violet bg-violet/[.035] shadow-sm" : "border-slate-100 bg-[#FFFCF8] hover:border-violet/30"}`}>
            <div className="text-center"><span className="block text-[10px] font-bold uppercase text-slate-400">{new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date)}</span><span className={`mx-auto mt-1 grid size-9 place-items-center rounded-full font-display font-extrabold ${selected ? "bg-violet text-white" : key === today ? "bg-yellow" : ""}`}>{date.getDate()}</span></div>
            <div className="mt-4 space-y-2">{dayEvents.map((event) => <div key={event.id} className="rounded-xl border-l-[3px] bg-white p-2 shadow-sm" style={{ borderLeftColor: event.color }}><span className="block truncate text-[10px] font-bold">{event.title}</span><span className="mt-1 block text-[9px] text-slate-400">{event.allDay ? "Todo el día" : event.startTime}</span></div>)}</div>
          </button>;
        })}
      </div>
    </div>
  );
}

function DayView({ date, events, onEdit, onNew }: { date: string; events: PlannerEvent[]; onEdit: (event: PlannerEvent) => void; onNew: () => void }) {
  return (
    <div className="min-h-[540px] p-4 sm:p-6">
      <div className="rounded-[22px] bg-gradient-to-r from-violet/10 to-coral/10 p-5"><p className="text-xs font-bold uppercase tracking-[.16em] text-violet">Plan del día</p><p className="mt-1 font-display text-2xl font-extrabold">{formatLongDate(date)}</p></div>
      <div className="mt-5 space-y-3">
        {events.length === 0 && <EmptyEvents onNew={onNew} />}
        {events.map((event) => <button key={event.id} onClick={() => onEdit(event)} className="flex w-full items-start gap-4 rounded-[20px] border border-slate-100 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"><span className="mt-1 h-12 w-1.5 rounded-full" style={{ backgroundColor: event.color }} /><span className="w-20 shrink-0 text-xs font-bold text-slate-400">{event.allDay ? "Todo el día" : <>{event.startTime}<br /><span className="font-normal">{event.endTime}</span></>}</span><span className="min-w-0"><span className="block font-display font-extrabold">{event.title}</span><span className="mt-1 block text-xs text-slate-500">{event.description || event.category}</span></span></button>)}
      </div>
    </div>
  );
}

function DaySummary({ date, events, onEdit, onDelete, onNew }: { date: string; events: PlannerEvent[]; onEdit: (event: PlannerEvent) => void; onDelete: (event: PlannerEvent) => void; onNew: () => void }) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-coral">Fecha seleccionada</p><h2 className="mt-2 font-display text-xl font-extrabold">{formatLongDate(date)}</h2></div><span className="grid size-11 place-items-center rounded-2xl bg-coral/10 text-coral"><CalendarDays size={22} /></span></div>
      <div className="mt-5 space-y-2.5">
        {events.length === 0 && <p className="rounded-2xl bg-[#FAF6F2] px-4 py-5 text-center text-sm text-slate-400">Sin compromisos todavía.</p>}
        {events.map((event) => <article key={event.id} className="group rounded-[18px] border border-slate-100 p-3.5 transition hover:shadow-sm"><div className="flex gap-3"><span className="mt-1 size-3 shrink-0 rounded-full" style={{ backgroundColor: event.color }} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{event.title}</p><p className="mt-1 text-[11px] text-slate-400">{event.allDay ? "Todo el día" : `${event.startTime}–${event.endTime}`} · {event.category}</p>{event.recurrence !== "none" && <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-violet"><Repeat2 size={11} /> {recurrenceLabels[event.recurrence]}</p>}</div><div className="flex"><button onClick={() => onEdit(event)} className="icon-button !size-7" aria-label={`Editar ${event.title}`}><Edit3 size={14} /></button><button onClick={() => onDelete(event)} className="icon-button !size-7 hover:!bg-coral/10 hover:!text-coral" aria-label={`Eliminar ${event.title}`}><Trash2 size={14} /></button></div></div></article>)}
      </div>
      <button onClick={onNew} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-violet/10 py-3 text-sm font-bold text-violet transition hover:bg-violet hover:text-white"><Plus size={17} /> Añadir compromiso</button>
    </section>
  );
}

type TasksPanelProps = {
  tasks: PlannerTask[]; title: string; setTitle: (value: string) => void; onAdd: (event: FormEvent) => void;
  editingId: string | null; editingTitle: string; setEditingTitle: (value: string) => void;
  onEdit: (task: PlannerTask) => void; onSave: (id: string) => void; onToggle: (id: string) => void; onDelete: (id: string) => void;
};

function TasksPanel(props: TasksPanelProps) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-center justify-between"><div><p className="font-display text-lg font-extrabold">Tareas del día</p><p className="mt-0.5 text-xs text-slate-400">Compartidas con tu dashboard</p></div><Sparkles className="text-yellow" size={22} /></div>
      <form onSubmit={props.onAdd} className="mt-4 flex gap-2"><input value={props.title} onChange={(event) => props.setTitle(event.target.value)} placeholder="Nueva tarea..." aria-label="Título de la nueva tarea" className="min-w-0 flex-1 rounded-xl border border-violet/15 bg-[#FFFCF8] px-3 py-2.5 text-sm" /><button className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet text-white" aria-label="Añadir tarea"><Plus size={18} /></button></form>
      <div className="mt-4 divide-y divide-slate-100">
        {props.tasks.length === 0 && <p className="py-5 text-center text-sm text-slate-400">No hay tareas para este día.</p>}
        {props.tasks.map((task) => <div key={task.id} className="group flex items-center gap-2 py-3"><button onClick={() => props.onToggle(task.id)} className={`grid size-6 shrink-0 place-items-center rounded-lg border-2 ${task.done ? "border-mint bg-mint text-white" : "border-slate-300"}`} aria-label={task.done ? `Marcar ${task.title} como pendiente` : `Completar ${task.title}`}>{task.done && <Check size={14} strokeWidth={3} />}</button>{props.editingId === task.id ? <form onSubmit={(event) => { event.preventDefault(); props.onSave(task.id); }} className="flex min-w-0 flex-1"><input autoFocus value={props.editingTitle} onChange={(event) => props.setEditingTitle(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-violet/20 px-2 py-1 text-sm" /></form> : <span className={`min-w-0 flex-1 text-sm ${task.done ? "text-slate-400 line-through" : "font-medium"}`}>{task.title}</span>}<button onClick={() => props.onEdit(task)} className="icon-button !size-7" aria-label={`Editar ${task.title}`}><Edit3 size={13} /></button><button onClick={() => props.onDelete(task.id)} className="icon-button !size-7 hover:!text-coral" aria-label={`Eliminar ${task.title}`}><Trash2 size={13} /></button></div>)}
      </div>
    </section>
  );
}

function EventModal({ initial, editingId, events, onClose, onSave }: { initial: Omit<PlannerEvent, "id" | "createdAt"> | PlannerEvent; editingId: string | null; events: PlannerEvent[]; onClose: () => void; onSave: (event: PlannerEvent) => void }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    const title = form.title.trim();
    if (!title) return setError("Escribe un título para el compromiso.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date)) return setError("Selecciona una fecha válida.");
    if (!form.allDay && (!form.startTime || !form.endTime || form.endTime <= form.startTime)) return setError("La hora final debe ser posterior a la inicial.");
    const duplicate = events.some((item) => item.id !== editingId && item.title.trim().toLocaleLowerCase(locale) === title.toLocaleLowerCase(locale) && item.date === form.date && item.startTime === form.startTime && item.endTime === form.endTime);
    if (duplicate) return setError("Ya existe un compromiso igual en esa fecha y hora.");
    setSaving(true);
    onSave({ ...form, id: editingId ?? createId("event"), title, description: form.description.trim(), createdAt: "createdAt" in initial ? initial.createdAt : new Date().toISOString() });
  }

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((current) => ({ ...current, [key]: value }));
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-ink/35 p-0 backdrop-blur-sm sm:place-items-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="event-modal-title" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <form onSubmit={submit} className="max-h-[94vh] w-full overflow-y-auto rounded-t-[30px] bg-cream p-5 shadow-2xl sm:max-w-[620px] sm:rounded-[30px] sm:p-7">
        <div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-violet">Mi Agenda</p><h2 id="event-modal-title" className="mt-1 font-display text-2xl font-extrabold">{editingId ? "Editar compromiso" : "Nuevo compromiso"}</h2></div><button type="button" onClick={onClose} className="icon-button bg-white" aria-label="Cerrar"><X size={19} /></button></div>
        <div className="mt-6 space-y-4">
          <Field label="Título"><input autoFocus value={form.title} onChange={(event) => set("title", event.target.value)} placeholder="Ej. Reunión del proyecto" className="field" /></Field>
          <Field label="Descripción"><textarea value={form.description} onChange={(event) => set("description", event.target.value)} placeholder="Añade notas o detalles..." rows={3} className="field resize-none" /></Field>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Fecha"><input type="date" value={form.date} onChange={(event) => set("date", event.target.value)} className="field" /></Field><Field label="Categoría"><select value={form.category} onChange={(event) => set("category", event.target.value)} className="field">{categories.map((category) => <option key={category}>{category}</option>)}</select></Field></div>
          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-violet/10 bg-white px-4 py-3"><span><span className="block text-sm font-bold">Evento de día entero</span><span className="block text-xs text-slate-400">Sin horario específico</span></span><input type="checkbox" checked={form.allDay} onChange={(event) => set("allDay", event.target.checked)} className="size-5 accent-violet" /></label>
          {!form.allDay && <div className="grid grid-cols-2 gap-4"><Field label="Empieza"><input type="time" value={form.startTime} onChange={(event) => set("startTime", event.target.value)} className="field" /></Field><Field label="Termina"><input type="time" value={form.endTime} onChange={(event) => set("endTime", event.target.value)} className="field" /></Field></div>}
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Repetición"><select value={form.recurrence} onChange={(event) => set("recurrence", event.target.value as Recurrence)} className="field">{Object.entries(recurrenceLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field><Field label="Color"><div className="flex h-[46px] items-center gap-2 rounded-xl border border-violet/10 bg-white px-3">{colors.map((color) => <button key={color} type="button" onClick={() => set("color", color)} aria-label={`Elegir color ${color}`} aria-pressed={form.color === color} className={`size-7 rounded-full transition hover:scale-110 ${form.color === color ? "ring-2 ring-offset-2" : ""}`} style={{ backgroundColor: color, color }} />)}</div></Field></div>
          {error && <p role="alert" className="rounded-xl bg-coral/10 px-3 py-2 text-sm font-semibold text-[#C23D4A]">{error}</p>}
        </div>
        <div className="mt-6 flex gap-3"><button type="button" onClick={onClose} className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-500">Cancelar</button><button disabled={saving} className="flex-1 rounded-2xl bg-violet py-3 text-sm font-bold text-white shadow-soft disabled:opacity-60">{editingId ? "Guardar cambios" : "Crear evento"}</button></div>
      </form>
    </div>
  );
}

function ConfirmDelete({ event, onCancel, onConfirm }: { event: PlannerEvent; onCancel: () => void; onConfirm: () => void }) {
  return <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/35 p-5 backdrop-blur-sm" role="alertdialog" aria-modal="true" aria-labelledby="delete-title"><div className="w-full max-w-sm rounded-[28px] bg-white p-6 text-center shadow-2xl"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-coral/10 text-coral"><Trash2 size={26} /></span><h2 id="delete-title" className="mt-4 font-display text-xl font-extrabold">¿Eliminar este compromiso?</h2><p className="mt-2 text-sm text-slate-500">“{event.title}” se eliminará de la agenda. Esta acción no se puede deshacer.</p><div className="mt-6 flex gap-3"><button onClick={onCancel} className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-bold">Cancelar</button><button onClick={onConfirm} className="flex-1 rounded-2xl bg-coral py-3 text-sm font-bold text-white">Sí, eliminar</button></div></div></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-500">{label}</span>{children}</label>;
}

function EmptyEvents({ onNew }: { onNew: () => void }) {
  return <div className="py-16 text-center"><span className="mx-auto grid size-16 place-items-center rounded-3xl bg-violet/10 text-violet"><Clock3 size={28} /></span><p className="mt-4 font-display text-lg font-extrabold">Un día lleno de posibilidades</p><p className="mt-1 text-sm text-slate-400">Todavía no hay compromisos.</p><button onClick={onNew} className="mt-4 text-sm font-bold text-violet">+ Crear el primero</button></div>;
}

function compareEvents(a: PlannerEvent, b: PlannerEvent) {
  if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
  return a.startTime.localeCompare(b.startTime);
}

function formatLongDate(date: string) {
  return capitalizeFirst(new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }).format(parseDate(date)));
}

function capitalizeFirst(value: string) {
  return value.charAt(0).toLocaleUpperCase(locale) + value.slice(1);
}

function getWeek(date: string) {
  const current = parseDate(date);
  const offset = (current.getDay() + 6) % 7;
  current.setDate(current.getDate() - offset);
  return Array.from({ length: 7 }, (_, index) => { const item = new Date(current); item.setDate(current.getDate() + index); return item; });
}

function getMonthGrid(date: string) {
  const current = parseDate(date);
  const first = new Date(current.getFullYear(), current.getMonth(), 1, 12);
  const offset = (first.getDay() + 6) % 7;
  first.setDate(first.getDate() - offset);
  return Array.from({ length: 42 }, (_, index) => { const item = new Date(first); item.setDate(first.getDate() + index); return item; });
}

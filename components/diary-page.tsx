"use client";

import { ArrowLeft, BookHeart, CalendarDays, Check, ChevronLeft, ChevronRight, Heart, Pencil, Save, Search, Sparkles, Trash2, X } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { DesktopSidebar, Logo, MobileNav } from "@/components/app-navigation";
import { getPlanningYear } from "@/lib/planner-preferences";
import { type DiaryEntry, type DiaryMood } from "@/lib/diary-storage";
import { useDiaryStore } from "@/lib/use-diary-store";

const locale = "es-ES";
const moods = [
  { value: 1, emoji: "😢", label: "Muy triste", color: "#8AB7E8" },
  { value: 2, emoji: "😕", label: "Bajo de ánimo", color: "#B59AEF" },
  { value: 3, emoji: "😌", label: "Tranquilo", color: "#76DCC0" },
  { value: 4, emoji: "😊", label: "Feliz", color: "#FFD76A" },
  { value: 5, emoji: "🤩", label: "Genial", color: "#FF8B96" },
] as const;

type Mood = DiaryMood;
type DiaryMoodEntry = DiaryEntry;

function todayKey() {
  const date = new Date();
  return `${getPlanningYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function DiaryPage() {
  const { entries, ready, persist } = useDiaryStore();
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [monthDate, setMonthDate] = useState(() => parseDate(todayKey()));
  const [mood, setMood] = useState<Mood | null>(null);
  const [content, setContent] = useState("");
  const [gratitudes, setGratitudes] = useState(["", "", ""]);
  const [search, setSearch] = useState("");
  const [moodFilter, setMoodFilter] = useState<Mood | "all">("all");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState<DiaryMoodEntry | null>(null);

  const selectedEntry = entries.find((entry) => entry.date === selectedDate);

  useEffect(() => {
    if (!ready) return;
    const entry = entries.find((item) => item.date === selectedDate);
    setMood(entry?.mood ?? null);
    setContent(entry?.content ?? "");
    setGratitudes([entry?.gratitudes[0] ?? "", entry?.gratitudes[1] ?? "", entry?.gratitudes[2] ?? ""]);
    setError("");
    setSaved(false);
  }, [selectedDate, entries, ready]);

  const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
  const monthEntries = entries.filter((entry) => entry.date.startsWith(monthKey));
  const gratitudeCount = monthEntries.reduce((sum, entry) => sum + entry.gratitudes.filter(Boolean).length, 0);
  const history = useMemo(() => entries.filter((entry) => {
    const needle = search.trim().toLocaleLowerCase(locale);
    const matchesText = !needle || `${entry.content} ${entry.gratitudes.join(" ")}`.toLocaleLowerCase(locale).includes(needle);
    return matchesText && (moodFilter === "all" || entry.mood === moodFilter);
  }).sort((a, b) => b.date.localeCompare(a.date)), [entries, search, moodFilter]);

  function saveEntry(event: FormEvent) {
    event.preventDefault();
    const cleanContent = content.trim();
    if (!mood) return setError("Selecciona cómo te has sentido hoy.");
    if (!cleanContent) return setError("Escribe unas líneas en tu diario antes de guardar.");
    const cleanGratitudes = gratitudes.map((item) => item.trim()).filter(Boolean).slice(0, 3);
    const now = new Date().toISOString();
    const entry: DiaryMoodEntry = { id: selectedEntry?.id ?? `entry-${Date.now()}`, date: selectedDate, mood, content: cleanContent, gratitudes: cleanGratitudes, createdAt: selectedEntry?.createdAt ?? now, updatedAt: now };
    persist(selectedEntry ? entries.map((item) => item.id === entry.id ? entry : item) : [...entries, entry]);
    setError("");
    setSaved(true);
  }

  function chooseDate(date: string) {
    setSelectedDate(date);
    setMonthDate(parseDate(date));
  }

  return <div className="min-h-screen lg:flex">
    <DesktopSidebar active="diary" />
    <main className="mx-auto w-full max-w-[1550px] px-4 pb-28 pt-5 sm:px-6 lg:ml-[252px] lg:px-8 lg:pb-10 lg:pt-8 xl:px-10">
      <DiaryHeader />
      <section className="mt-7 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(350px,.65fr)]">
        <EntryEditor date={selectedDate} mood={mood} setMood={setMood} content={content} setContent={setContent} gratitudes={gratitudes} setGratitudes={setGratitudes} error={error} saved={saved} editing={Boolean(selectedEntry)} onSubmit={saveEntry} />
        <aside className="space-y-5"><DiaryCalendar monthDate={monthDate} selectedDate={selectedDate} entries={entries} onMonth={setMonthDate} onSelect={chooseDate} /><div className="grid grid-cols-2 gap-3"><StatCard value={monthEntries.length} label="días escritos" icon={BookHeart} color="bg-violet/10 text-violet" /><StatCard value={gratitudeCount} label="gratitudes" icon={Heart} color="bg-coral/10 text-coral" /></div></aside>
      </section>
      <HistorySection entries={history} search={search} setSearch={setSearch} moodFilter={moodFilter} setMoodFilter={setMoodFilter} onView={chooseDate} onDelete={setDeleting} />
    </main>
    <MobileNav active="diary" />
    {deleting && <DeleteEntry entry={deleting} onCancel={() => setDeleting(null)} onConfirm={() => { persist(entries.filter((entry) => entry.id !== deleting.id)); if (deleting.date === selectedDate) { setMood(null); setContent(""); setGratitudes(["", "", ""]); } setDeleting(null); }} />}
  </div>;
}

function DiaryHeader() { return <header><div className="lg:hidden"><Logo /></div><Link href="/" className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[.16em] text-violet lg:mt-0"><ArrowLeft size={15} /> Volver al inicio</Link><h1 className="mt-2 font-display text-[32px] font-extrabold tracking-[-.045em] sm:text-[40px]">Mi Diario 📖</h1><p className="mt-1 text-sm text-slate-500 sm:text-base">Un poquito de ti, cada día</p></header>; }

type EditorProps = { date: string; mood: Mood | null; setMood: (mood: Mood) => void; content: string; setContent: (value: string) => void; gratitudes: string[]; setGratitudes: (values: string[]) => void; error: string; saved: boolean; editing: boolean; onSubmit: (event: FormEvent) => void };
function EntryEditor(props: EditorProps) {
  const dateLabel = capitalize(new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(parseDate(props.date)));
  return <form onSubmit={props.onSubmit} className="card overflow-hidden"><div className="relative overflow-hidden bg-gradient-to-r from-[#F3EFFF] via-[#FFF0F5] to-[#FFF4DE] p-5 sm:p-7"><div className="absolute -right-12 -top-16 size-44 rounded-full border-[28px] border-white/40" /><p className="relative text-xs font-bold uppercase tracking-[.15em] text-violet">Entrada del día</p><h2 className="relative mt-2 font-display text-2xl font-extrabold">{dateLabel}</h2><p className="relative mt-1 text-xs text-slate-400">{props.editing ? "Esta fecha ya tiene una entrada. Puedes actualizarla." : "Un espacio seguro para escribir sin prisas."}</p></div><div className="space-y-6 p-5 sm:p-7"><fieldset><legend className="font-display text-base font-extrabold">¿Cómo te sientes hoy?</legend><div className="mt-3 grid grid-cols-5 gap-2">{moods.map((item) => <button key={item.value} type="button" onClick={() => props.setMood(item.value)} aria-label={item.label} aria-pressed={props.mood === item.value} className={`rounded-2xl border py-3 text-center transition hover:-translate-y-1 ${props.mood === item.value ? "border-transparent shadow-md ring-2 ring-offset-2" : "border-slate-100 bg-[#FFFCF8]"}`} style={{ backgroundColor: props.mood === item.value ? `${item.color}28` : undefined, color: item.color }}><span className="block text-2xl sm:text-3xl">{item.emoji}</span><span className="mt-1 hidden text-[9px] font-bold sm:block">{item.label}</span></button>)}</div></fieldset><label className="block"><span className="font-display text-base font-extrabold">Querido diario...</span><textarea value={props.content} onChange={(event) => props.setContent(event.target.value)} rows={9} placeholder="¿Qué ha hecho especial este día? Escribe aquí lo que necesites..." className="field mt-3 resize-none leading-relaxed" /></label><fieldset><legend className="flex items-center gap-2 font-display text-base font-extrabold"><Heart size={18} className="text-coral" fill="currentColor" /> Hoy agradezco...</legend><div className="mt-3 space-y-2">{props.gratitudes.map((gratitude, index) => <label key={index} className="flex items-center gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-xl bg-coral/10 text-xs font-extrabold text-coral">{index + 1}</span><input value={gratitude} onChange={(event) => { const next = [...props.gratitudes]; next[index] = event.target.value; props.setGratitudes(next); }} aria-label={`Gratitud ${index + 1}`} placeholder={index === 0 ? "Algo bonito de hoy..." : "Otra cosa que agradeces..."} className="field" /></label>)}</div></fieldset>{props.error && <p role="alert" className="rounded-xl bg-coral/10 px-3 py-2 text-sm font-semibold text-coral">{props.error}</p>}{props.saved && <p role="status" className="flex items-center gap-2 rounded-xl bg-mint/20 px-3 py-2 text-sm font-semibold text-[#24896F]"><Check size={16} /> Entrada guardada correctamente.</p>}<button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet py-3.5 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5"><Save size={18} /> {props.editing ? "Actualizar entrada" : "Guardar entrada"}</button></div></form>;
}

function DiaryCalendar({ monthDate, selectedDate, entries, onMonth, onSelect }: { monthDate: Date; selectedDate: string; entries: DiaryMoodEntry[]; onMonth: (date: Date) => void; onSelect: (date: string) => void }) {
  const days = getMonthGrid(monthDate); const label = capitalize(new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(monthDate)); const entryMap = new Map(entries.map((entry) => [entry.date, entry]));
  return <section className="card p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-display text-lg font-extrabold">Mi calendario</h2><p className="mt-0.5 text-xs text-slate-400">Elige un día para escribir o recordar</p></div><CalendarDays className="text-violet" size={23} /></div><div className="mt-5 flex items-center justify-between"><button onClick={() => onMonth(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1, 12))} className="icon-button" aria-label="Mes anterior"><ChevronLeft size={18} /></button><p className="text-sm font-bold">{label}</p><button onClick={() => onMonth(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1, 12))} className="icon-button" aria-label="Mes siguiente"><ChevronRight size={18} /></button></div><div className="mt-3 grid grid-cols-7 text-center text-[10px] font-bold text-slate-400">{["L", "M", "X", "J", "V", "S", "D"].map((day) => <span key={day} className="py-2">{day}</span>)}</div><div className="grid grid-cols-7 gap-1">{days.map((date) => { const key = toDateKey(date); const entry = entryMap.get(key); const inMonth = date.getMonth() === monthDate.getMonth(); const moodMeta = entry ? moods.find((item) => item.value === entry.mood) : undefined; return <button key={key} onClick={() => onSelect(key)} aria-label={`${date.getDate()}${entry ? ", con entrada" : ""}`} className={`relative grid aspect-square place-items-center rounded-xl text-xs font-bold transition hover:bg-violet/10 ${selectedDate === key ? "bg-violet text-white shadow-soft" : inMonth ? "text-ink" : "text-slate-300"}`}>{date.getDate()}{entry && <span className="absolute -right-0.5 -top-1 text-[10px]" aria-hidden="true">{moodMeta?.emoji}</span>}</button>; })}</div></section>;
}

function StatCard({ value, label, icon: Icon, color }: { value: number; label: string; icon: typeof BookHeart; color: string }) { return <article className="card flex items-center gap-3 p-4"><span className={`grid size-10 place-items-center rounded-2xl ${color}`}><Icon size={19} /></span><div><p className="font-display text-xl font-extrabold">{value}</p><p className="text-[10px] text-slate-400">{label}</p></div></article>; }

function HistorySection({ entries, search, setSearch, moodFilter, setMoodFilter, onView, onDelete }: { entries: DiaryMoodEntry[]; search: string; setSearch: (value: string) => void; moodFilter: Mood | "all"; setMoodFilter: (value: Mood | "all") => void; onView: (date: string) => void; onDelete: (entry: DiaryMoodEntry) => void }) {
  return <section className="mt-7"><div><h2 className="font-display text-xl font-extrabold">Entradas anteriores</h2><p className="mt-1 text-sm text-slate-400">Tus palabras, ordenadas para volver a ellas cuando quieras.</p></div><div className="mt-4 flex flex-col gap-3 sm:flex-row"><label className="relative flex-1"><Search className="absolute left-3.5 top-3 text-slate-400" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Buscar en el diario" placeholder="Buscar por contenido o gratitud..." className="field pl-10" /></label><select value={moodFilter} onChange={(event) => setMoodFilter(event.target.value === "all" ? "all" : Number(event.target.value) as Mood)} aria-label="Filtrar por humor" className="field sm:w-52"><option value="all">Todos los humores</option>{moods.map((item) => <option key={item.value} value={item.value}>{item.emoji} {item.label}</option>)}</select></div><div className="mt-4 grid gap-4 lg:grid-cols-2">{entries.length === 0 && <div className="card col-span-full py-14 text-center"><BookHeart className="mx-auto text-violet" size={32} /><p className="mt-4 font-display text-lg font-extrabold">Todavía no hay entradas aquí</p><p className="mt-1 text-sm text-slate-400">Escribe tu primera página o ajusta los filtros.</p></div>}{entries.map((entry) => { const moodMeta = moods.find((item) => item.value === entry.mood)!; return <article key={entry.id} className="card group p-5 transition hover:-translate-y-0.5"><div className="flex items-start gap-3"><span className="grid size-12 shrink-0 place-items-center rounded-2xl text-2xl" style={{ backgroundColor: `${moodMeta.color}25` }}>{moodMeta.emoji}</span><button onClick={() => onView(entry.date)} className="min-w-0 flex-1 text-left"><p className="text-xs font-bold uppercase tracking-wider text-violet">{formatDate(entry.date)}</p><p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{entry.content}</p></button><button onClick={() => onView(entry.date)} className="icon-button !size-8" aria-label={`Editar entrada del ${formatDate(entry.date)}`}><Pencil size={14} /></button><button onClick={() => onDelete(entry)} className="icon-button !size-8 hover:!text-coral" aria-label={`Eliminar entrada del ${formatDate(entry.date)}`}><Trash2 size={14} /></button></div>{entry.gratitudes.length > 0 && <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-400"><Heart size={13} className="text-coral" fill="currentColor" /><span>{entry.gratitudes.length} {entry.gratitudes.length === 1 ? "gratitud" : "gratitudes"}</span></div>}</article>; })}</div></section>;
}

function DeleteEntry({ entry, onCancel, onConfirm }: { entry: DiaryMoodEntry; onCancel: () => void; onConfirm: () => void }) { return <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/35 p-5 backdrop-blur-sm" role="alertdialog" aria-modal="true" aria-labelledby="delete-entry-title"><div className="w-full max-w-sm rounded-[28px] bg-white p-6 text-center shadow-2xl"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-coral/10 text-coral"><Trash2 size={25} /></span><h2 id="delete-entry-title" className="mt-4 font-display text-xl font-extrabold">¿Eliminar esta entrada?</h2><p className="mt-2 text-sm text-slate-500">La página del {formatDate(entry.date)} se eliminará del diario.</p><div className="mt-6 flex gap-3"><button onClick={onCancel} className="flex-1 rounded-2xl border py-3 text-sm font-bold">Cancelar</button><button onClick={onConfirm} className="flex-1 rounded-2xl bg-coral py-3 text-sm font-bold text-white">Eliminar</button></div></div></div>; }

function parseDate(value: string) { const [year, month, day] = value.split("-").map(Number); return new Date(year, month - 1, day, 12); }
function toDateKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function getMonthGrid(month: Date) { const first = new Date(month.getFullYear(), month.getMonth(), 1, 12); first.setDate(first.getDate() - ((first.getDay() + 6) % 7)); return Array.from({ length: 42 }, (_, index) => { const date = new Date(first); date.setDate(first.getDate() + index); return date; }); }
function capitalize(value: string) { return value.charAt(0).toLocaleUpperCase(locale) + value.slice(1); }
function formatDate(value: string) { return capitalize(new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(parseDate(value))); }

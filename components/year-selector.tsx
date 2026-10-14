"use client";

import { CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";
import { getPlanningYear, setPlanningYear } from "@/lib/planner-preferences";

export function YearSelector({ compact = false }: { compact?: boolean }) {
  const [year, setYear] = useState(new Date().getFullYear());
  useEffect(() => setYear(getPlanningYear()), []);
  const current = new Date().getFullYear();
  const years = Array.from({ length: 13 }, (_, index) => current - 2 + index);
  return <label className={`flex items-center gap-2 rounded-2xl border border-violet-100 bg-white/85 text-navy shadow-sm ${compact ? "px-2 py-1.5" : "px-3 py-2"}`}>
    <CalendarDays aria-hidden="true" className="h-4 w-4 text-coral" />
    <span className={compact ? "sr-only" : "text-xs font-bold"}>Año</span>
    <select aria-label="Año de planificación" className="min-w-0 bg-transparent text-xs font-bold outline-none focus-visible:ring-2 focus-visible:ring-violet" value={year} onChange={(event) => {
      const nextYear = Number(event.target.value); setYear(nextYear); setPlanningYear(nextYear); window.location.reload();
    }}>
      {years.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  </label>;
}


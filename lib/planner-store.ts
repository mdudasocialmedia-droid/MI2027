"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import { createPlannerSnapshotIfAbsent, getPlannerUserId, loadPlannerSnapshot, savePlannerSnapshot } from "@/lib/planner-sync";
import { readLegacyPlannerCache, readPlannerCache, writePlannerCache } from "@/lib/planner-storage";

export const STORAGE_KEY = "mi2027-dashboard";
export const DASHBOARD_DATE = toDateKey(new Date());

export type PlannerTask = {
  id: string;
  title: string;
  done: boolean;
  date: string;
  createdAt: string;
};

export type Recurrence = "none" | "daily" | "weekly" | "monthly";

export type PlannerEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  category: string;
  color: string;
  allDay: boolean;
  recurrence: Recurrence;
  createdAt: string;
};

export type HabitFrequency = "daily" | "weekly";

export type PlannerHabit = {
  id: string;
  title: string;
  frequency: HabitFrequency;
  targetPerWeek: number;
  color: string;
  icon: "water" | "exercise" | "book" | "heart" | "star" | "leaf";
  checkIns: string[];
  createdAt: string;
};

export type GoalCategory = "Personal" | "Finanzas" | "Salud" | "Trabajo" | "Estudios" | "Otros";

export type GoalMilestone = { id: string; title: string; done: boolean };

export type PlannerGoal = {
  id: string;
  title: string;
  category: GoalCategory;
  startDate: string;
  dueDate: string;
  progress: number;
  color: string;
  annual: boolean;
  milestones: GoalMilestone[];
  createdAt: string;
};

export type TransactionType = "income" | "expense";

export type MoneyTransaction = {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
};

export type MonthlyBudget = {
  id: string;
  month: string;
  category: string;
  limit: number;
};

export type AchievementRecord = { id: string; unlockedAt: string };

export type PlannerData = {
  version: 4;
  tasks: PlannerTask[];
  events: PlannerEvent[];
  habits: Record<string, boolean>;
  habitItems: PlannerHabit[];
  goals: PlannerGoal[];
  transactions: MoneyTransaction[];
  budgets: MonthlyBudget[];
  achievements: AchievementRecord[];
  selectedDate: string;
};

const starterTasks: PlannerTask[] = [
  { id: "1", title: "Planificar mi semana", done: true, date: DASHBOARD_DATE, createdAt: DASHBOARD_DATE },
  { id: "2", title: "Revisar mis finanzas", done: false, date: DASHBOARD_DATE, createdAt: DASHBOARD_DATE },
  { id: "3", title: "Entrenar 30 minutos", done: true, date: DASHBOARD_DATE, createdAt: DASHBOARD_DATE },
  { id: "4", title: "Leer 15 minutos", done: false, date: DASHBOARD_DATE, createdAt: DASHBOARD_DATE },
  { id: "5", title: "Preparar las comidas", done: false, date: DASHBOARD_DATE, createdAt: DASHBOARD_DATE },
];

const starterHabitDefinitions = [
  { id: "agua", title: "Agua", icon: "water", color: "#2DA9E9" },
  { id: "ejercicio", title: "Ejercicio", icon: "exercise", color: "#FF6B78" },
  { id: "lectura", title: "Lectura", icon: "book", color: "#7954F6" },
  { id: "gratitud", title: "Gratitud", icon: "heart", color: "#E74788" },
] as const;

function makeStarterHabits(legacy: Record<string, boolean> = { agua: true }): PlannerHabit[] {
  return starterHabitDefinitions.map((habit) => ({ ...habit, frequency: "daily", targetPerWeek: 7, checkIns: legacy[habit.id] ? [DASHBOARD_DATE] : [], createdAt: DASHBOARD_DATE }));
}

const starterGoal: PlannerGoal = {
  id: "goal-annual-savings",
  title: "Ahorrar 6.000 €",
  category: "Finanzas",
  startDate: `${new Date().getFullYear()}-01-01`,
  dueDate: `${new Date().getFullYear()}-12-31`,
  progress: 40,
  color: "#76DCC0",
  annual: true,
  milestones: [
    { id: "goal-step-1", title: "Ahorrar 2.000 €", done: true },
    { id: "goal-step-2", title: "Llegar a 4.000 €", done: false },
    { id: "goal-step-3", title: "Completar 6.000 €", done: false },
  ],
  createdAt: DASHBOARD_DATE,
};

export const defaultPlannerData: PlannerData = {
  version: 4,
  tasks: starterTasks,
  events: [],
  habits: { agua: true },
  habitItems: makeStarterHabits(),
  goals: [starterGoal],
  transactions: [],
  budgets: [],
  achievements: [],
  selectedDate: DASHBOARD_DATE,
};

function isDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(parseDate(value).getTime());
}

export function loadPlannerData(): PlannerData {
  if (typeof window === "undefined") return defaultPlannerData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPlannerData;
    const saved = JSON.parse(raw) as Record<string, unknown>;
    const legacyDay = typeof saved.day === "number" ? saved.day : 13;
    const selectedDate = isDate(saved.selectedDate) ? saved.selectedDate : `${DASHBOARD_DATE.slice(0, 8)}${String(legacyDay).padStart(2, "0")}`;
    const tasks = Array.isArray(saved.tasks)
      ? saved.tasks.map((task, index) => {
          const item = task as Partial<PlannerTask> & { id?: string | number };
          return {
            id: String(item.id ?? `legacy-${index}`),
            title: typeof item.title === "string" ? item.title : "Tarea sin título",
            done: Boolean(item.done),
            date: isDate(item.date) ? item.date : DASHBOARD_DATE,
            createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
          };
        })
      : starterTasks;

    const legacyHabits = saved.habits && typeof saved.habits === "object" ? (saved.habits as Record<string, boolean>) : { agua: true };
    return {
      version: 4,
      tasks,
      events: Array.isArray(saved.events) ? (saved.events as PlannerEvent[]) : [],
      habits: legacyHabits,
      habitItems: Array.isArray(saved.habitItems) ? (saved.habitItems as PlannerHabit[]) : makeStarterHabits(legacyHabits),
      goals: Array.isArray(saved.goals) ? (saved.goals as PlannerGoal[]) : [starterGoal],
      transactions: Array.isArray(saved.transactions) ? (saved.transactions as MoneyTransaction[]) : [],
      budgets: Array.isArray(saved.budgets) ? (saved.budgets as MonthlyBudget[]) : [],
      achievements: Array.isArray(saved.achievements) ? (saved.achievements as AchievementRecord[]) : [],
      selectedDate,
    };
  } catch {
    return defaultPlannerData;
  }
}

export function usePlannerStore() {
  const [data, setData] = useState<PlannerData>(defaultPlannerData);
  const [ready, setReady] = useState(false);
  const [legacyAvailable, setLegacyAvailable] = useState(false);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    let hydrationVersion = 0;
    const supabase = createClient();
    async function hydrate() {
      const version = ++hydrationVersion;
      setReady(false);
      // Do not leave the previous account's planner on screen while the next
      // session is being resolved.
      userIdRef.current = null;
      setData(defaultPlannerData);
      setLegacyAvailable(false);
      const userId = await getPlannerUserId();
      if (!active || version !== hydrationVersion) return;
      userIdRef.current = userId;
      if (!userId) {
        setReady(true);
        return;
      }
      const cached = readPlannerCache(window.localStorage, userId);
      try {
        const remote = await loadPlannerSnapshot(userId);
        if (!active || version !== hydrationVersion || userIdRef.current !== userId) return;
        if (remote) {
          writePlannerCache(window.localStorage, userId, remote);
          setData(remote);
        } else {
          setData(cached ?? defaultPlannerData);
          // Legacy data has no verifiable owner. It is only offered when this
          // account has neither a local nor remote snapshot.
          setLegacyAvailable(Boolean(readLegacyPlannerCache(window.localStorage)) && !cached);
        }
      } catch {
        if (active && version === hydrationVersion && userIdRef.current === userId) {
          setData(cached ?? defaultPlannerData);
        }
      } finally {
        if (active && version === hydrationVersion && userIdRef.current === userId) setReady(true);
      }
    }
    void hydrate();
    const { data: listener } = supabase.auth.onAuthStateChange(() => { void hydrate(); });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  function updateData(updater: (current: PlannerData) => PlannerData) {
    setData((current) => {
      const next = updater(current);
      const userId = userIdRef.current;
      if (userId) {
        writePlannerCache(localStorage, userId, next);
        void savePlannerSnapshot(userId, next).catch(() => {
          // The isolated user cache remains available offline and retries on a later edit.
        });
      }
      return next;
    });
  }

  async function importLegacyData() {
    const userId = userIdRef.current;
    if (!userId) return false;
    const legacy = readLegacyPlannerCache(localStorage);
    if (!legacy) return false;
    try {
      const result = await createPlannerSnapshotIfAbsent(userId, legacy);
      if (result === "created") {
        writePlannerCache(localStorage, userId, legacy);
        setData(legacy);
        setLegacyAvailable(false);
        return true;
      }
      // A concurrent or other-device snapshot won. Keep that source of truth.
      const remote = await loadPlannerSnapshot(userId);
      if (remote) {
        writePlannerCache(localStorage, userId, remote);
        setData(remote);
      }
      setLegacyAvailable(false);
      return false;
    } catch {
      // Unknown-origin legacy data is never assigned while the cloud state
      // cannot be checked. Existing per-user caches continue to work offline.
      return false;
    }
  }

  return { data, updateData, ready, legacyAvailable, importLegacyData };
}

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function calculateCurrentXp(data: PlannerData) {
  const completedTasks = new Set(data.tasks.filter((task) => task.date === data.selectedDate && task.done).map((task) => task.id)).size;
  const completedHabits = data.habitItems.filter((habit) => new Set(habit.checkIns).has(data.selectedDate)).length;
  return completedTasks * 30 + completedHabits * 20;
}

export function occursOnDate(event: PlannerEvent, date: string) {
  if (date < event.date) return false;
  if (event.recurrence === "none") return date === event.date;
  const start = parseDate(event.date);
  const target = parseDate(date);
  const diffDays = Math.round((target.getTime() - start.getTime()) / 86_400_000);
  if (event.recurrence === "daily") return true;
  if (event.recurrence === "weekly") return diffDays % 7 === 0;
  return target.getDate() === start.getDate();
}

export function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

export function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

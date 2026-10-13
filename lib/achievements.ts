import type { PlannerData } from "@/lib/planner-store";

export type AchievementArea = "tasks" | "habits" | "goals" | "finance";

export type AchievementDefinition = {
  id: string;
  title: string;
  description: string;
  area: AchievementArea;
  color: string;
  progress: number;
  current: number;
  target: number;
  unlocked: boolean;
};

export function getAchievementDefinitions(data: PlannerData): AchievementDefinition[] {
  const completedTasks = new Set(data.tasks.filter((task) => task.done).map((task) => task.id)).size;
  const habitCheckIns = new Set(data.habitItems.flatMap((habit) => habit.checkIns.map((date) => `${habit.id}:${date}`))).size;
  const bestStreak = Math.max(0, ...data.habitItems.map((habit) => calculateBestStreak(habit.checkIns)));
  const completedGoals = data.goals.filter((goal) => goal.progress === 100).length;
  const transactionCount = new Set(data.transactions.map((item) => item.id)).size;
  const positiveMonths = countPositiveMonths(data);
  const metrics = [
    ["task-first", "Primer check", "Completa tu primera tarea.", "tasks", "#7954F6", completedTasks, 1],
    ["task-five", "En marcha", "Completa cinco tareas distintas.", "tasks", "#9A6DEB", completedTasks, 5],
    ["habit-first", "Semilla de constancia", "Registra tu primer check-in de hábito.", "habits", "#43C5A2", habitCheckIns, 1],
    ["habit-streak-seven", "Una semana imparable", "Mantén una racha de siete días.", "habits", "#2DA9E9", bestStreak, 7],
    ["goal-complete", "Objetivo cumplido", "Completa una meta al 100%.", "goals", "#FF6B78", completedGoals, 1],
    ["finance-first", "Primer movimiento", "Registra tu primera transacción.", "finance", "#F5B82E", transactionCount, 1],
    ["finance-budget", "Con intención", "Crea un presupuesto mensual.", "finance", "#E85BA5", data.budgets.length, 1],
    ["finance-positive", "Mes en verde", "Cierra un mes registrado con saldo positivo.", "finance", "#43C5A2", positiveMonths, 1],
  ] as const;
  const unlockedIds = new Set(data.achievements.map((item) => item.id));
  return metrics.map(([id, title, description, area, color, current, target]) => ({ id, title, description, area, color, current, target, progress: Math.min(100, Math.round((current / target) * 100)), unlocked: unlockedIds.has(id) || current >= target }));
}

function countPositiveMonths(data: PlannerData) {
  const months = new Set(data.transactions.map((item) => item.date.slice(0, 7)));
  let positive = 0;
  months.forEach((month) => {
    const values = data.transactions.filter((item) => item.date.startsWith(month));
    const income = values.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
    const expenses = values.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
    if (income > expenses && values.length > 0) positive += 1;
  });
  return positive;
}

function calculateBestStreak(checkIns: string[]) {
  const dates = Array.from(new Set(checkIns)).sort();
  let best = 0;
  let current = 0;
  let previous: Date | null = null;
  dates.forEach((value) => {
    const date = new Date(`${value}T12:00:00`);
    const diff = previous ? Math.round((date.getTime() - previous.getTime()) / 86_400_000) : 1;
    current = diff === 1 ? current + 1 : 1;
    best = Math.max(best, current);
    previous = date;
  });
  return best;
}

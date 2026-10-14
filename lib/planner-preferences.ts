export const PLANNING_YEAR_STORAGE_KEY = "luna-planner-year";
const LEGACY_DASHBOARD_KEY = "mi2027-dashboard";

export function getPlanningYear() {
  const fallback = new Date().getFullYear();
  if (typeof window === "undefined") return fallback;
  const stored = Number(window.localStorage.getItem(PLANNING_YEAR_STORAGE_KEY));
  return Number.isInteger(stored) && stored >= 2000 && stored <= 2100 ? stored : fallback;
}

function moveDateToYear(dateValue: string, year: number) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
  if (!match) return dateValue;
  const lastDay = new Date(year, Number(match[2]), 0).getDate();
  return `${year}-${match[2]}-${String(Math.min(Number(match[3]), lastDay)).padStart(2, "0")}`;
}

export function setPlanningYear(year: number) {
  window.localStorage.setItem(PLANNING_YEAR_STORAGE_KEY, String(year));
  try {
    const raw = window.localStorage.getItem(LEGACY_DASHBOARD_KEY);
    if (!raw) return;
    const data = JSON.parse(raw) as Record<string, unknown>;
    if (typeof data.selectedDate === "string") data.selectedDate = moveDateToYear(data.selectedDate, year);
    window.localStorage.setItem(LEGACY_DASHBOARD_KEY, JSON.stringify(data));
  } catch { /* Preserve malformed legacy data instead of replacing it. */ }
}


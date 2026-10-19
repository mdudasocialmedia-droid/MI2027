import type { PlannerData } from "@/lib/planner-store";

export const LEGACY_PLANNER_STORAGE_KEY = "mi2027-dashboard";
const USER_STORAGE_PREFIX = "luna-planner:user:";

export function userPlannerStorageKey(userId: string) {
  return `${USER_STORAGE_PREFIX}${userId}:planner`;
}

export function readPlannerCache(storage: Pick<Storage, "getItem">, userId: string): PlannerData | null {
  try {
    const raw = storage.getItem(userPlannerStorageKey(userId));
    return raw ? (JSON.parse(raw) as PlannerData) : null;
  } catch {
    return null;
  }
}

export function writePlannerCache(storage: Pick<Storage, "setItem">, userId: string, data: PlannerData) {
  storage.setItem(userPlannerStorageKey(userId), JSON.stringify(data));
}

export function readLegacyPlannerCache(storage: Pick<Storage, "getItem">): PlannerData | null {
  try {
    const raw = storage.getItem(LEGACY_PLANNER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PlannerData) : null;
  } catch {
    return null;
  }
}

import assert from "node:assert/strict";
import test from "node:test";
import { readLegacyPlannerCache, readPlannerCache, userPlannerStorageKey, writePlannerCache } from "../lib/planner-storage.ts";
import type { PlannerData } from "../lib/planner-store.ts";

const storage = () => { const values = new Map<string, string>(); return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) }; };
const data: PlannerData = { version: 4, tasks: [], events: [], habits: {}, habitItems: [], goals: [], transactions: [], budgets: [], achievements: [], selectedDate: "2026-10-16" };

test("planner caches are isolated by user id", () => {
  const local = storage();
  writePlannerCache(local, "user-a", data);
  assert.deepEqual(readPlannerCache(local, "user-a"), data);
  assert.equal(readPlannerCache(local, "user-b"), null);
  assert.notEqual(userPlannerStorageKey("user-a"), userPlannerStorageKey("user-b"));
});

test("legacy data is readable but never assigned to a user automatically", () => {
  const local = storage();
  local.setItem("mi2027-dashboard", JSON.stringify(data));
  assert.deepEqual(readLegacyPlannerCache(local), data);
  assert.equal(readPlannerCache(local, "user-a"), null);
});

test("separate browser stores cannot leak a cache between two users", () => {
  const browserA = storage();
  const browserB = storage();
  writePlannerCache(browserA, "user-a", data);

  assert.deepEqual(readPlannerCache(browserA, "user-a"), data);
  assert.equal(readPlannerCache(browserA, "user-b"), null);
  assert.equal(readPlannerCache(browserB, "user-a"), null);
  assert.equal(readPlannerCache(browserB, "user-b"), null);
});

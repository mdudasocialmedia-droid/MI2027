import assert from "node:assert/strict";
import test from "node:test";
import { LEGACY_DIARY_STORAGE_KEY, readDiaryCache, userDiaryStorageKey, writeDiaryCache, type DiaryEntry } from "../lib/diary-storage.ts";

const storage = () => {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) };
};
const entry: DiaryEntry = { id: "entry-a", date: "2026-10-16", mood: 4, content: "Entrada fictícia", gratitudes: [], createdAt: "2026-10-16T10:00:00.000Z", updatedAt: "2026-10-16T10:00:00.000Z" };

test("diary entries are isolated by authenticated user id", () => {
  const local = storage();
  writeDiaryCache(local, "user-a", [entry]);
  assert.deepEqual(readDiaryCache(local, "user-a"), [entry]);
  assert.deepEqual(readDiaryCache(local, "user-b"), []);
  assert.notEqual(userDiaryStorageKey("user-a"), userDiaryStorageKey("user-b"));
});

test("two browser stores do not share diary entries", () => {
  const browserA = storage();
  const browserB = storage();
  writeDiaryCache(browserA, "user-a", [entry]);
  assert.deepEqual(readDiaryCache(browserB, "user-a"), []);
  assert.deepEqual(readDiaryCache(browserB, "user-b"), []);
});

test("legacy diary data remains unassigned", () => {
  const local = storage();
  local.setItem(LEGACY_DIARY_STORAGE_KEY, JSON.stringify([entry]));
  assert.deepEqual(readDiaryCache(local, "user-a"), []);
});

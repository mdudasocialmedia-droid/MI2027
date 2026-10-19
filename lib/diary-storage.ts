export type DiaryMood = 1 | 2 | 3 | 4 | 5;

export type DiaryEntry = {
  id: string;
  date: string;
  mood: DiaryMood;
  content: string;
  gratitudes: string[];
  createdAt: string;
  updatedAt: string;
};

// Kept only for backwards compatibility. It is intentionally never read into
// an authenticated account because it has no trustworthy owner.
export const LEGACY_DIARY_STORAGE_KEY = "mi2027-diary-v1";
const USER_DIARY_STORAGE_PREFIX = "luna-planner:user:";

export function userDiaryStorageKey(userId: string) {
  return `${USER_DIARY_STORAGE_PREFIX}${userId}:diary`;
}

export function readDiaryCache(storage: Pick<Storage, "getItem">, userId: string): DiaryEntry[] {
  try {
    const raw = storage.getItem(userDiaryStorageKey(userId));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed as DiaryEntry[] : [];
  } catch {
    return [];
  }
}

export function writeDiaryCache(storage: Pick<Storage, "setItem">, userId: string, entries: DiaryEntry[]) {
  storage.setItem(userDiaryStorageKey(userId), JSON.stringify(entries));
}

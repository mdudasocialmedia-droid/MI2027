"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import { getPlannerUserId } from "@/lib/planner-sync";
import { readDiaryCache, type DiaryEntry, writeDiaryCache } from "@/lib/diary-storage";

export function useDiaryStore() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [ready, setReady] = useState(false);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    let hydrationVersion = 0;
    const supabase = createClient();

    async function hydrate() {
      const version = ++hydrationVersion;
      // Clear before resolving auth so a previous account's entries cannot be
      // rendered during logout, login, or account switching.
      userIdRef.current = null;
      setEntries([]);
      setReady(false);

      const userId = await getPlannerUserId();
      if (!active || version !== hydrationVersion) return;
      userIdRef.current = userId;
      if (userId) setEntries(readDiaryCache(window.localStorage, userId));
      setReady(true);
    }

    void hydrate();
    const { data: listener } = supabase.auth.onAuthStateChange(() => { void hydrate(); });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  function persist(next: DiaryEntry[]) {
    const userId = userIdRef.current;
    if (!userId) return false;
    setEntries(next);
    writeDiaryCache(window.localStorage, userId, next);
    return true;
  }

  return { entries, ready, persist };
}


import { createClient } from "@/lib/supabase";
import type { PlannerData, PlannerHabit } from "@/lib/planner-store";

const PLANNER_MODULE = "planner";

export async function getPlannerUserId() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user?.id ?? null;
}

export async function loadPlannerSnapshot(userId: string): Promise<PlannerData | null> {
  const supabase = createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user || auth.user.id !== userId) return null;

  const { data, error } = await supabase
    .from("planner_items")
    .select("data")
    .eq("user_id", auth.user.id)
    .eq("module", PLANNER_MODULE)
    .maybeSingle();
  if (error) throw error;
  return data ? (data.data as PlannerData) : null;
}

export async function savePlannerSnapshot(userId: string, snapshot: PlannerData) {
  const supabase = createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user || auth.user.id !== userId) return;

  const { error } = await supabase.from("planner_items").upsert({
    user_id: userId,
    module: PLANNER_MODULE,
    data: snapshot,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id,module" });
  if (error) throw error;
}

/**
 * Used only for an explicit legacy import. `insert` deliberately refuses to
 * replace an existing cloud snapshot, including one created on another device.
 */
export async function createPlannerSnapshotIfAbsent(userId: string, snapshot: PlannerData) {
  const supabase = createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user || auth.user.id !== userId) return "unauthenticated" as const;

  const { error } = await supabase.from("planner_items").insert({
    user_id: userId,
    module: PLANNER_MODULE,
    data: snapshot,
    updated_at: new Date().toISOString(),
  });
  if (!error) return "created" as const;
  if (error.code === "23505") return "exists" as const;
  throw error;
}

export async function carregarHabitos() {
  const supabase = createClient();

  const { data: auth, error: authError } =
    await supabase.auth.getUser();

  if (authError || !auth.user) {
    throw new Error("Usuário não autenticado");
  }

  const { data, error } = await supabase
    .from("planner_items")
    .select("data")
    .eq("user_id", auth.user.id)
    .eq("module", "habitos")
    .maybeSingle();

  if (error) throw error;

  return data ? (data.data as PlannerHabit[]) : null;
}

export async function salvarHabitos(habitos: PlannerHabit[]) {
  const supabase = createClient();

  const { data: auth, error: authError } =
    await supabase.auth.getUser();

  if (authError || !auth.user) {
    throw new Error("Usuário não autenticado");
  }

  const { error } = await supabase
    .from("planner_items")
    .upsert(
      {
        user_id: auth.user.id,
        module: "habitos",
        data: habitos,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,module" }
    );

  if (error) throw error;
}

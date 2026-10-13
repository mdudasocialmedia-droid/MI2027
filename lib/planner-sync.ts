
import { createClient } from "@/lib/supabase";
import type { PlannerHabit } from "@/lib/planner-store";

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

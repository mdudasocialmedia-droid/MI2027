import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  HOTMART_PRODUCT_ID,
  matchesHotmartHottok,
  validateHotmartPayload,
} from "@/lib/hotmart-webhook-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const hottok = process.env.HOTMART_WEBHOOK_HOTTOK;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!hottok || !supabaseUrl || !serviceRole) {
    console.error("Hotmart webhook is not configured.");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  if (!matchesHotmartHottok(request.headers.get("x-hotmart-hottok"), hottok)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try { payload = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const validation = validateHotmartPayload(payload);
  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.reason === "other_product" ? "Product not accepted" : "Invalid Hotmart payload" },
      { status: 400 }
    );
  }

  const { eventId, event, action, email, transaction, createdAt } = validation.value;

  if (!action) {
    // An authenticated event for this product that is not relevant to access is acknowledged.
    return NextResponse.json({ received: true, processed: false }, { status: 202 });
  }

  const supabase = createClient(supabaseUrl, serviceRole, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data, error } = await supabase.rpc("process_hotmart_purchase_event", {
    p_event_id: eventId,
    p_event_type: event,
    p_event_created_at: Math.trunc(createdAt),
    p_transaction_id: transaction,
    p_product_id: HOTMART_PRODUCT_ID,
    p_buyer_email: email,
    p_action: action,
    p_payload: payload,
  });

  if (error) {
    console.error("Hotmart webhook processing failed", { eventId, transaction, message: error.message });
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true, processed: true, result: data });
}

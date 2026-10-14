import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRODUCT_ID = 8732001;
const EVENT_ACTIONS: Record<string, "approved" | "revoked"> = {
  PURCHASE_APPROVED: "approved",
  PURCHASE_REFUNDED: "revoked",
  PURCHASE_CHARGEBACK: "revoked",
  PURCHASE_CANCELED: "revoked",
};

type HotmartPayload = {
  id?: string;
  version?: string;
  event?: string;
  creation_date?: number;
  data?: {
    product?: { id?: number | string };
    buyer?: { email?: string };
    purchase?: { transaction?: string; status?: string };
  };
};

function constantTimeTokenMatch(received: string | null, expected: string) {
  if (!received) return false;
  const left = Buffer.from(received, "utf8");
  const right = Buffer.from(expected, "utf8");
  return left.length === right.length && timingSafeEqual(left, right);
}

function isPayload(value: unknown): value is HotmartPayload {
  return Boolean(value && typeof value === "object");
}

export async function POST(request: Request) {
  const hottok = process.env.HOTMART_WEBHOOK_HOTTOK;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!hottok || !supabaseUrl || !serviceRole) {
    console.error("Hotmart webhook is not configured.");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  if (!constantTimeTokenMatch(request.headers.get("x-hotmart-hottok"), hottok)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try { payload = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!isPayload(payload)) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const eventId = payload.id?.trim();
  const event = payload.event;
  const action = event ? EVENT_ACTIONS[event] : undefined;
  const productId = Number(payload.data?.product?.id);
  const email = payload.data?.buyer?.email?.trim().toLowerCase();
  const transaction = payload.data?.purchase?.transaction?.trim();
  const createdAt = payload.creation_date;

  if (payload.version !== "2.0.0" || !eventId || !event || !email || !transaction || typeof createdAt !== "number" || !Number.isFinite(createdAt)) {
    return NextResponse.json({ error: "Invalid Hotmart payload" }, { status: 400 });
  }

  // This endpoint is exclusively for the Luna Planner product.
  if (productId !== PRODUCT_ID) {
    return NextResponse.json({ error: "Product not accepted" }, { status: 400 });
  }

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
    p_product_id: PRODUCT_ID,
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

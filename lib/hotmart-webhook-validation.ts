import { timingSafeEqual } from "node:crypto";

export const HOTMART_PRODUCT_ID = 8732001;

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
    purchase?: { transaction?: string };
  };
};

export type ValidatedHotmartEvent = {
  eventId: string;
  event: string;
  action: "approved" | "revoked" | undefined;
  productId: number;
  email: string;
  transaction: string;
  createdAt: number;
};

export function matchesHotmartHottok(received: string | null, expected: string) {
  if (!received) return false;
  const left = Buffer.from(received, "utf8");
  const right = Buffer.from(expected, "utf8");
  return left.length === right.length && timingSafeEqual(left, right);
}

export function validateHotmartPayload(value: unknown):
  | { ok: true; value: ValidatedHotmartEvent }
  | { ok: false; reason: "invalid" | "other_product" } {
  if (!value || typeof value !== "object") return { ok: false, reason: "invalid" };
  const payload = value as HotmartPayload;
  const eventId = payload.id?.trim();
  const event = payload.event;
  const productId = Number(payload.data?.product?.id);
  const email = payload.data?.buyer?.email?.trim().toLowerCase();
  const transaction = payload.data?.purchase?.transaction?.trim();
  const createdAt = payload.creation_date;

  if (
    payload.version !== "2.0.0" || !eventId || !event || !email || !transaction ||
    typeof createdAt !== "number" || !Number.isFinite(createdAt)
  ) {
    return { ok: false, reason: "invalid" };
  }
  if (productId !== HOTMART_PRODUCT_ID) return { ok: false, reason: "other_product" };

  return {
    ok: true,
    value: { eventId, event, action: EVENT_ACTIONS[event], productId, email, transaction, createdAt },
  };
}

import assert from "node:assert/strict";
import test from "node:test";
import {
  HOTMART_PRODUCT_ID,
  matchesHotmartHottok,
  validateHotmartPayload,
} from "../lib/hotmart-webhook-validation.ts";

const approvedPayload = {
  id: "evt-approved-1",
  version: "2.0.0",
  event: "PURCHASE_APPROVED",
  creation_date: 1_800_000_000_000,
  data: {
    product: { id: HOTMART_PRODUCT_ID },
    buyer: { email: " Buyer@Example.com " },
    purchase: { transaction: " transaction-1 " },
  },
};

test("accepts an approved event for Luna Planner and normalizes buyer identifiers", () => {
  const result = validateHotmartPayload(approvedPayload);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(result.value, {
    eventId: "evt-approved-1",
    event: "PURCHASE_APPROVED",
    action: "approved",
    productId: HOTMART_PRODUCT_ID,
    email: "buyer@example.com",
    transaction: "transaction-1",
    createdAt: 1_800_000_000_000,
  });
});

test("rejects Hotmart's generic product-id 0 test without invoking the database", () => {
  const payload = structuredClone(approvedPayload);
  payload.data.product.id = 0;
  assert.deepEqual(validateHotmartPayload(payload), { ok: false, reason: "other_product" });
});

test("rejects malformed payloads and authenticates only the exact Hottok", () => {
  assert.deepEqual(validateHotmartPayload({}), { ok: false, reason: "invalid" });
  assert.equal(matchesHotmartHottok("correct-secret", "correct-secret"), true);
  assert.equal(matchesHotmartHottok("wrong-secret", "correct-secret"), false);
  assert.equal(matchesHotmartHottok(null, "correct-secret"), false);
});

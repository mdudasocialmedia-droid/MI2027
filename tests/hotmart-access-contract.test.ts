import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

type EventAction = "approved" | "revoked";
type Purchase = { status: EventAction; until?: number; timestamp: number };

class IsolatedAccessModel {
  private eventIds = new Set<string>();
  private purchases = new Map<string, Purchase>();

  process(eventId: string, transaction: string, action: EventAction, timestamp: number) {
    if (this.eventIds.has(eventId)) return "duplicate";
    this.eventIds.add(eventId);
    const existing = this.purchases.get(transaction);
    const isOutOfOrder = existing && (
      existing.timestamp > timestamp ||
      (existing.timestamp === timestamp && !(action === "revoked" && existing.status === "approved"))
    );
    if (isOutOfOrder) return "out_of_order";

    this.purchases.set(transaction, {
      status: action,
      until: action === "approved" ? timestamp + 365 * 24 * 60 * 60 * 1000 : undefined,
      timestamp,
    });
    return "processed";
  }

  accessUntil() {
    return Math.max(0, ...Array.from(this.purchases.values())
      .filter((purchase) => purchase.status === "approved")
      .map((purchase) => purchase.until ?? 0));
  }

  linkConfirmedAccount(account: { email: string; confirmed: boolean }, purchaseEmail: string) {
    return account.confirmed && account.email.toLowerCase() === purchaseEmail.toLowerCase();
  }
}

test("approval grants exactly 365 days", () => {
  const model = new IsolatedAccessModel();
  const approvedAt = 1_800_000_000_000;
  assert.equal(model.process("event-1", "transaction-1", "approved", approvedAt), "processed");
  assert.equal(model.accessUntil(), approvedAt + 365 * 24 * 60 * 60 * 1000);
});

test("refund, cancellation, and chargeback revoke only their transaction", () => {
  for (const revokedEvent of ["refund", "cancellation", "chargeback"]) {
    const model = new IsolatedAccessModel();
    model.process(`${revokedEvent}-approved-a`, "transaction-a", "approved", 1_800_000_000_000);
    model.process(`${revokedEvent}-approved-b`, "transaction-b", "approved", 1_800_000_100_000);
    assert.equal(model.process(`${revokedEvent}-revoked`, "transaction-a", "revoked", 1_800_000_200_000), "processed");
    assert.equal(model.accessUntil(), 1_800_000_100_000 + 365 * 24 * 60 * 60 * 1000);
  }
});

test("duplicates and old events cannot change access; equal-time revocation wins", () => {
  const model = new IsolatedAccessModel();
  model.process("approved", "transaction-1", "approved", 1_800_000_000_000);
  const originalUntil = model.accessUntil();
  assert.equal(model.process("approved", "transaction-1", "approved", 1_800_000_000_000), "duplicate");
  assert.equal(model.process("older-refund", "transaction-1", "revoked", 1_799_999_999_999), "out_of_order");
  assert.equal(model.accessUntil(), originalUntil);
  assert.equal(model.process("same-time-refund", "transaction-1", "revoked", 1_800_000_000_000), "processed");
  assert.equal(model.accessUntil(), 0);
  assert.equal(model.process("same-time-reapproval", "transaction-1", "approved", 1_800_000_000_000), "out_of_order");
});

test("purchases link only to accounts with a confirmed matching email", () => {
  const model = new IsolatedAccessModel();
  assert.equal(model.linkConfirmedAccount({ email: "buyer@example.com", confirmed: true }, "BUYER@example.com"), true);
  assert.equal(model.linkConfirmedAccount({ email: "buyer@example.com", confirmed: false }, "buyer@example.com"), false);
});

test("the installed SQL contract protects product, access expiry, locks, and RPC execution", () => {
  const sql = readFileSync(new URL("../supabase/hotmart-access.sql", import.meta.url), "utf8");
  assert.match(sql, /if p_product_id <> 8732001 then/);
  assert.match(sql, /now\(\) - interval '1 second'/);
  assert.match(sql, /pg_advisory_xact_lock\(hashtext\(trim\(p_transaction_id\)\)\)/);
  assert.match(sql, /email_confirmed_at is not null/);
  assert.match(sql, /revoke all on function public\.process_hotmart_purchase_event[\s\S]*from public, anon, authenticated/);
  assert.match(sql, /grant execute on function public\.process_hotmart_purchase_event[\s\S]*to service_role/);
});

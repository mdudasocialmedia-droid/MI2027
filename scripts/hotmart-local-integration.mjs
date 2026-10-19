import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createClient } from "@supabase/supabase-js";

const baseUrl = process.env.HOTMART_TEST_BASE_URL || "http://127.0.0.1:3100";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const hottok = process.env.HOTMART_WEBHOOK_HOTTOK;
const createdUsers = [];
const prefix = `local-it-${randomUUID()}`;

function requireLocalUrl(value, name) {
  if (!value) throw new Error(`${name} is required.`);
  const url = new URL(value);
  if (!['127.0.0.1', 'localhost'].includes(url.hostname)) {
    throw new Error(`${name} must use localhost or 127.0.0.1.`);
  }
  return url;
}

requireLocalUrl(baseUrl, "HOTMART_TEST_BASE_URL");
requireLocalUrl(supabaseUrl, "NEXT_PUBLIC_SUPABASE_URL");
if (!serviceRole || !hottok) throw new Error("Local test variables are required.");

const admin = createClient(supabaseUrl, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function event(type, transaction, email, createdAt, suffix) {
  return {
    id: `${prefix}-${suffix}`,
    version: "2.0.0",
    event: type,
    creation_date: createdAt,
    data: {
      product: { id: 8732001 },
      buyer: { email },
      purchase: { transaction },
    },
  };
}

async function post(payload, token = hottok) {
  return fetch(`${baseUrl}/api/webhooks/hotmart`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-hotmart-hottok": token },
    body: JSON.stringify(payload),
  });
}

async function createConfirmedUser(email) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: `LocalOnly-${randomUUID()}-Aa1!`,
    email_confirm: true,
  });
  if (error || !data.user) throw new Error(`Could not create local test user: ${error?.message}`);
  createdUsers.push(data.user.id);
  return data.user;
}

async function purchase(transaction) {
  const { data, error } = await admin.from("hotmart_purchases").select("*").eq("transaction_id", transaction).single();
  if (error) throw new Error(`Could not read local purchase: ${error.message}`);
  return data;
}

async function access(userId) {
  const { data, error } = await admin.from("user_access").select("status, access_until").eq("user_id", userId).single();
  if (error) throw new Error(`Could not read local access: ${error.message}`);
  return data;
}

async function cleanup() {
  const transactions = ["a", "b", "c", "pending"].map((name) => `${prefix}-${name}`);
  await admin.from("hotmart_webhook_events").delete().like("event_id", `${prefix}%`);
  await admin.from("hotmart_purchases").delete().in("transaction_id", transactions);
  if (createdUsers.length) {
    await admin.from("hotmart_managed_access").delete().in("user_id", createdUsers);
    await admin.from("user_access").delete().in("user_id", createdUsers);
    await Promise.all(createdUsers.map((id) => admin.auth.admin.deleteUser(id)));
  }
}

async function waitForServer(child) {
  const deadline = Date.now() + 45_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error("Local Next.js server stopped before tests started.");
    try {
      await fetch(`${baseUrl}/api/webhooks/hotmart`, { signal: AbortSignal.timeout(1_000) });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }
  throw new Error("Timed out waiting for the local Next.js server.");
}

async function stopServer(child) {
  if (child.exitCode !== null) return;

  child.kill();
  await Promise.race([
    once(child, "exit"),
    new Promise((resolve) => setTimeout(resolve, 5_000)),
  ]);

  if (child.exitCode === null) {
    child.kill("SIGKILL");
    await Promise.race([
      once(child, "exit"),
      new Promise((resolve) => setTimeout(resolve, 5_000)),
    ]);
  }
}

const next = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "-p", "3100"], {
  cwd: process.cwd(), env: process.env, stdio: "ignore", windowsHide: true,
});

try {
  await waitForServer(next);
  const now = Date.now();
  const existingEmail = `${prefix}-existing@example.test`;
  const existingUser = await createConfirmedUser(existingEmail);

  const approvedA = event("PURCHASE_APPROVED", `${prefix}-a`, existingEmail, now, "approved-a");
  assert.equal((await post(approvedA)).status, 200, "approved purchase must be accepted");
  const savedA = await purchase(`${prefix}-a`);
  assert.equal(savedA.status, "active");
  assert.equal(savedA.user_id, existingUser.id);
  const firstAccess = await access(existingUser.id);
  assert.equal(firstAccess.status, "active");
  assert.ok(Math.abs(new Date(firstAccess.access_until).getTime() - (now + 365 * 86_400_000)) < 1_000, "access must last 365 days");

  const duplicate = await post(approvedA);
  assert.equal(duplicate.status, 200);
  assert.equal((await duplicate.json()).result.outcome, "duplicate");

  const wrongToken = await post(event("PURCHASE_APPROVED", `${prefix}-bad-token`, existingEmail, now, "bad-token"), "wrong-local-token");
  assert.equal(wrongToken.status, 401);
  const wrongProduct = structuredClone(approvedA);
  wrongProduct.id = `${prefix}-wrong-product`;
  wrongProduct.data.product.id = 0;
  assert.equal((await post(wrongProduct)).status, 400);

  const oldRefund = await post(event("PURCHASE_REFUNDED", `${prefix}-a`, existingEmail, now - 1, "old-refund"));
  assert.equal(oldRefund.status, 200);
  assert.equal((await oldRefund.json()).result.outcome, "out_of_order");

  assert.equal((await post(event("PURCHASE_APPROVED", `${prefix}-b`, existingEmail, now + 1_000, "approved-b"))).status, 200);
  assert.equal((await post(event("PURCHASE_REFUNDED", `${prefix}-a`, existingEmail, now + 2_000, "refund-a"))).status, 200);
  assert.equal((await access(existingUser.id)).status, "active", "refund must preserve another valid purchase");

  assert.equal((await post(event("PURCHASE_APPROVED", `${prefix}-c`, existingEmail, now + 3_000, "approved-c"))).status, 200);
  assert.equal((await post(event("PURCHASE_CANCELED", `${prefix}-b`, existingEmail, now + 4_000, "cancel-b"))).status, 200);
  assert.equal((await access(existingUser.id)).status, "active", "cancellation must preserve another valid purchase");
  assert.equal((await post(event("PURCHASE_CHARGEBACK", `${prefix}-c`, existingEmail, now + 5_000, "chargeback-c"))).status, 200);
  assert.ok(new Date((await access(existingUser.id)).access_until).getTime() < Date.now(), "final revocation must expire access");

  const pendingEmail = `${prefix}-pending@example.test`;
  assert.equal((await post(event("PURCHASE_APPROVED", `${prefix}-pending`, pendingEmail, now + 6_000, "approved-pending"))).status, 200);
  assert.equal((await purchase(`${prefix}-pending`)).user_id, null, "purchase before account must remain unlinked");
  const confirmedLater = await createConfirmedUser(pendingEmail);
  assert.equal((await purchase(`${prefix}-pending`)).user_id, confirmedLater.id, "confirmed account must link prior purchase");

  console.log("Local Hotmart integration: 10 scenarios passed.");
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown local integration failure.";
  // The test data is synthetic and the message never includes environment values.
  console.error(`Local Hotmart integration failed: ${message}`);
  process.exitCode = 1;
} finally {
  try {
    await cleanup();
  } finally {
    await stopServer(next);
  }
}

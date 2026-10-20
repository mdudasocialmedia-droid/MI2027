import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file: string) => readFileSync(path.join(root, file), "utf8");

test("manifest exposes Luna Planner as a standalone installable application", () => {
  const manifest = JSON.parse(read("public/manifest.webmanifest"));
  assert.equal(manifest.name, "Luna Planner");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.scope, "/");
  assert.equal(manifest.display, "standalone");
  assert.ok(manifest.icons.some((icon: { sizes: string }) => icon.sizes === "192x192"));
  assert.ok(manifest.icons.some((icon: { sizes: string }) => icon.sizes === "512x512"));
  assert.ok(manifest.icons.some((icon: { purpose: string }) => icon.purpose === "maskable"));
  for (const icon of manifest.icons) assert.ok(existsSync(path.join(root, "public", icon.src)));
});

test("worker stays network-only and does not cache private responses", () => {
  const worker = read("public/service-worker.js");
  assert.match(worker, /respondWith\(fetch\(event\.request\)\)/);
  assert.doesNotMatch(worker, /caches\.(open|match|put)/);
});

test("middleware leaves PWA installation resources publicly reachable", () => {
  const middleware = read("middleware.ts");
  assert.match(middleware, /path === "\/manifest\.webmanifest"/);
  assert.match(middleware, /path === "\/service-worker\.js"/);
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const middleware = readFileSync(new URL("../middleware.ts", import.meta.url), "utf8");

test("password recovery routes remain public while paid access remains enforced", () => {
  assert.match(middleware, /"\/recuperar"/);
  assert.match(middleware, /"\/redefinir"/);
  assert.doesNotMatch(middleware, /"\/nova-senha"/);
  assert.match(middleware, /access\?\.status === "active"/);
  assert.match(middleware, /access\?\.access_until/);
  assert.match(middleware, /url\.pathname = "\/sem-acesso"/);
});

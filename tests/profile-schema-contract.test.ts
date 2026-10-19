import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const profileClient = readFileSync(new URL("../lib/profile.ts", import.meta.url), "utf8");
const profileStorageSql = readFileSync(new URL("../supabase/profile-storage.sql", import.meta.url), "utf8");

test("profile client matches the production user_id schema and avatar migration", () => {
  assert.match(profileClient, /\.eq\("user_id", user\.id\)/);
  assert.match(profileClient, /user_id: auth\.user\.id, display_name: clean/);
  assert.match(profileClient, /user_id: auth\.user\.id, avatar_path: avatarPath/);
  assert.match(profileStorageSql, /add column if not exists avatar_path text/);
  assert.match(profileStorageSql, /profile-photos/);
  assert.match(profileStorageSql, /storage\.foldername\(name\)\)\[1\] = \(select auth\.uid\(\)::text\)/);
});

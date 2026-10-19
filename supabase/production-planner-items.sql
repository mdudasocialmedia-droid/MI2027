-- PRODUCTION: align the existing planner_items table with the current client.
--
-- Preconditions verified by production-preflight.sql on 2026-10-17:
--   * public.planner_items already exists and has a unique (user_id, module) key;
--   * the paid-access RLS policies and public.has_planner_access() already exist.
--
-- This script deliberately does NOT create a replacement table or replace RLS
-- policies. It preserves the existing paid-access policy predicates and only:
--   1. accepts the snapshot module written by lib/planner-sync.ts ("planner");
--   2. removes direct table privileges that neither the browser nor the app need.
--
-- Run manually in the Supabase production SQL Editor only after approval.

begin;

do $preflight$
begin
  if to_regclass('public.planner_items') is null then
    raise exception 'Expected public.planner_items to exist; stop and investigate.';
  end if;

  if to_regprocedure('public.has_planner_access()') is null then
    raise exception 'Expected public.has_planner_access() to exist; stop and investigate.';
  end if;

  if not exists (
    select 1
    from pg_constraint c
    where c.conrelid = 'public.planner_items'::regclass
      and c.contype = 'u'
      and pg_get_constraintdef(c.oid) = 'UNIQUE (user_id, module)'
  ) then
    raise exception 'Expected UNIQUE (user_id, module) on public.planner_items; stop and investigate.';
  end if;
end
$preflight$;

-- Production currently accepts the six legacy module names, while the current
-- client writes one RLS-protected snapshot with module = 'planner'. Extend
-- (never narrow) the allowed list. Re-running this block is a no-op.
do $module_constraint$
declare
  constraint_definition text;
begin
  select pg_get_constraintdef(c.oid)
    into constraint_definition
  from pg_constraint c
  where c.conrelid = 'public.planner_items'::regclass
    and c.conname = 'planner_items_module_check'
    and c.contype = 'c';

  if constraint_definition is null then
    raise exception 'Expected planner_items_module_check; stop and investigate.';
  end if;

  if position('''planner''' in constraint_definition) = 0 then
    alter table public.planner_items
      drop constraint planner_items_module_check;
    alter table public.planner_items
      add constraint planner_items_module_check
      check (module = any (array[
        'agenda', 'habitos', 'metas', 'dinero', 'diario', 'logros', 'planner'
      ]::text[]));
  end if;
end
$module_constraint$;

alter table public.planner_items enable row level security;

-- Keep the existing RLS policies intact. The authenticated browser needs only
-- the operations used by the upsert-based snapshot synchronizer.
revoke all on table public.planner_items from anon;
revoke delete, references, trigger, truncate on table public.planner_items from authenticated;
grant select, insert, update on table public.planner_items to authenticated;

-- The browser only reads its own entitlement through RLS/middleware. Hotmart
-- writes remain server-side through the service role and SECURITY DEFINER RPCs.
revoke all on table public.user_access from anon;
revoke delete, insert, update, references, trigger, truncate on table public.user_access from authenticated;
grant select on table public.user_access to authenticated;

commit;

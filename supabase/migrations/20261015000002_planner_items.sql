-- Per-user planner snapshots. Existing browser localStorage remains a cache and
-- is never deleted by this migration.
create table if not exists public.planner_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  module text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, module),
  constraint planner_items_module_check check (module in ('planner'))
);

alter table public.planner_items enable row level security;

drop policy if exists "Users manage own planner items" on public.planner_items;
create policy "Users manage own planner items"
on public.planner_items
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

revoke all on table public.planner_items from anon;
grant select, insert, update on table public.planner_items to authenticated;

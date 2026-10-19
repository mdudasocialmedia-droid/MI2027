-- Local integration-test prerequisite. This migration is intended for the
-- Supabase CLI local stack only and contains no production credentials.
create table if not exists public.user_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null check (status = 'active'),
  access_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_access enable row level security;

drop policy if exists "Users can read their own access" on public.user_access;
create policy "Users can read their own access"
on public.user_access
for select
to authenticated
using ((select auth.uid()) = user_id);

revoke all on table public.user_access from anon;
grant select on table public.user_access to authenticated;

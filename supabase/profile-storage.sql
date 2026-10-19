-- PRODUCTION REVIEW REQUIRED. This file is not executed by the application.
-- It targets the existing production schema: public.profiles(user_id, display_name, created_at).
-- It does not create or replace the table, alter profile RLS policies, or touch user data.

begin;

do $preflight$
begin
  if to_regclass('public.profiles') is null then
    raise exception 'Expected public.profiles to exist; stop and investigate.';
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles'
      and column_name = 'user_id' and data_type = 'uuid'
  ) then
    raise exception 'Expected public.profiles.user_id uuid; stop and investigate.';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
      and policyname = 'profiles_select_own' and cmd = 'SELECT'
  ) or not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
      and policyname = 'profiles_insert_own' and cmd = 'INSERT'
  ) or not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
      and policyname = 'profiles_update_own' and cmd = 'UPDATE'
  ) then
    raise exception 'Expected existing user-scoped profiles RLS policies; stop and investigate.';
  end if;
end
$preflight$;

alter table public.profiles add column if not exists avatar_path text;
alter table public.profiles enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-photos', 'profile-photos', false, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $storage_policy$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'Users manage their own profile photos'
  ) then
    create policy "Users manage their own profile photos"
      on storage.objects for all to authenticated
      using (
        bucket_id = 'profile-photos'
        and (storage.foldername(name))[1] = (select auth.uid()::text)
      )
      with check (
        bucket_id = 'profile-photos'
        and (storage.foldername(name))[1] = (select auth.uid()::text)
      );
  end if;
end
$storage_policy$;

commit;

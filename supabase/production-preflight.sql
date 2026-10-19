-- READ-ONLY production preflight. Run in the Supabase SQL Editor and save the
-- result before applying any production migration. This script changes nothing.

select
  to_regclass('public.user_access') as user_access,
  to_regclass('public.hotmart_webhook_events') as hotmart_webhook_events,
  to_regclass('public.hotmart_purchases') as hotmart_purchases,
  to_regclass('public.hotmart_managed_access') as hotmart_managed_access,
  to_regclass('public.planner_items') as planner_items;

select table_name, column_name, data_type, udt_name, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in ('user_access', 'planner_items')
order by table_name, ordinal_position;

select c.conrelid::regclass as table_name, c.conname, c.contype,
       pg_get_constraintdef(c.oid) as definition
from pg_constraint c
where c.conrelid in ('public.user_access'::regclass, 'public.planner_items'::regclass)
order by c.conrelid::regclass::text, c.contype, c.conname;

select c.relname as table_name, c.relrowsecurity as rls_enabled,
       c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('user_access', 'hotmart_webhook_events', 'hotmart_purchases', 'hotmart_managed_access', 'planner_items')
order by c.relname;

select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('user_access', 'hotmart_webhook_events', 'hotmart_purchases', 'hotmart_managed_access', 'planner_items')
order by tablename, policyname;

select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('user_access', 'hotmart_webhook_events', 'hotmart_purchases', 'hotmart_managed_access', 'planner_items')
order by table_name, grantee, privilege_type;

select n.nspname as schema_name, p.proname as function_name,
       pg_get_function_identity_arguments(p.oid) as arguments,
       p.prosecdef as security_definer
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'process_hotmart_purchase_event',
    'sync_luna_user_access',
    'link_hotmart_purchases_for_user',
    'link_hotmart_purchase_after_email_confirmation'
  )
order by p.proname;

select pg_get_functiondef('public.has_planner_access()'::regprocedure) as has_planner_access_definition;

select tgname as trigger_name, tgrelid::regclass as table_name, tgenabled
from pg_trigger
where not tgisinternal
  and tgrelid = 'auth.users'::regclass
  and tgname = 'on_auth_user_link_hotmart_purchase';

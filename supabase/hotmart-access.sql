-- REVIEW AND APPLY IN THE SUPABASE SQL EDITOR ONLY AFTER APPROVAL.
-- This script is not executed by the application or by this task.
-- Prerequisite to verify in the target project: public.user_access has
-- user_id uuid, status (accepting the existing lower-case value 'active'),
-- and access_until timestamptz.

create table if not exists public.hotmart_webhook_events (
  event_id text primary key,
  event_type text not null,
  event_created_at bigint not null,
  received_at timestamptz not null default now(),
  outcome text not null default 'received',
  payload jsonb not null
);

create table if not exists public.hotmart_purchases (
  transaction_id text primary key,
  product_id bigint not null check (product_id = 8732001),
  buyer_email text not null,
  user_id uuid references auth.users(id) on delete set null,
  status text not null check (status in ('active', 'revoked')),
  approved_at timestamptz,
  access_until timestamptz,
  revoked_at timestamptz,
  last_event_created_at bigint not null,
  last_event_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tracks only user_access records that this integration owns. This prevents a
-- refund from overwriting a valid access granted by another source.
create table if not exists public.hotmart_managed_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_hotmart_access_until timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists hotmart_purchases_email_idx on public.hotmart_purchases (lower(buyer_email));
create index if not exists hotmart_purchases_active_user_idx on public.hotmart_purchases (user_id, access_until) where status = 'active';

alter table public.hotmart_webhook_events enable row level security;
alter table public.hotmart_purchases enable row level security;
alter table public.hotmart_managed_access enable row level security;

-- There are intentionally no browser policies. The server invokes only the
-- public RPC below with the server-only service_role key.
revoke all on table public.hotmart_webhook_events, public.hotmart_purchases, public.hotmart_managed_access from anon, authenticated;

create or replace function public.sync_luna_user_access(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_access_until timestamptz;
  v_is_hotmart_managed boolean;
  v_existing_status text;
  v_existing_access_until timestamptz;
begin
  if p_user_id is null then return; end if;

  -- Serializes updates made by separate Hotmart transactions for one user.
  perform pg_advisory_xact_lock(hashtext(p_user_id::text));

  select max(access_until) into v_access_until
  from public.hotmart_purchases
  where user_id = p_user_id
    and status = 'active'
    and access_until > now();

  select exists(
    select 1 from public.hotmart_managed_access where user_id = p_user_id
  ) into v_is_hotmart_managed;

  if v_is_hotmart_managed then
    -- The existing middleware grants access only when status is exactly active
    -- and access_until is in the future. A timestamp strictly in the past
    -- revokes access without assuming that an "inactive" status is valid.
    update public.user_access
    set status = 'active',
        access_until = coalesce(v_access_until, now() - interval '1 second')
    where user_id = p_user_id;

    update public.hotmart_managed_access
    set last_hotmart_access_until = v_access_until, updated_at = now()
    where user_id = p_user_id;
    return;
  end if;

  -- A first valid Hotmart purchase can create its own access record.
  if v_access_until is null then return; end if;

  select status, access_until
  into v_existing_status, v_existing_access_until
  from public.user_access
  where user_id = p_user_id
  for update;

  if not found then
    insert into public.user_access (user_id, status, access_until)
    values (p_user_id, 'active', v_access_until);
  elsif v_existing_status is distinct from 'active'
     or (v_existing_access_until is not null and v_existing_access_until <= now()) then
    -- Only a non-granting legacy record is taken over. A currently valid
    -- non-Hotmart record (including a null/unlimited expiry) is untouched.
    update public.user_access
    set status = 'active', access_until = v_access_until
    where user_id = p_user_id;
  else
    return;
  end if;

  insert into public.hotmart_managed_access (user_id, last_hotmart_access_until)
  values (p_user_id, v_access_until);
end;
$$;

create or replace function public.link_hotmart_purchases_for_user(p_user_id uuid, p_email text)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if p_user_id is null or nullif(trim(p_email), '') is null then return; end if;

  -- Uses the same email lock as webhook processing so signup confirmation and
  -- a just-arriving purchase cannot pass each other without linking.
  perform pg_advisory_xact_lock(hashtext(lower(trim(p_email))));

  update public.hotmart_purchases
  set user_id = p_user_id, updated_at = now()
  where user_id is null
    and lower(buyer_email) = lower(trim(p_email));

  perform public.sync_luna_user_access(p_user_id);
end;
$$;

create or replace function public.process_hotmart_purchase_event(
  p_event_id text,
  p_event_type text,
  p_event_created_at bigint,
  p_transaction_id text,
  p_product_id bigint,
  p_buyer_email text,
  p_action text,
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_existing public.hotmart_purchases%rowtype;
  v_user_id uuid;
  v_approved_at timestamptz;
  v_access_until timestamptz;
begin
  -- Defense in depth: the Next.js route validates these fields too.
  if p_product_id <> 8732001 then
    raise exception 'Unsupported Hotmart product';
  end if;
  if not (
    (p_event_type = 'PURCHASE_APPROVED' and p_action = 'approved') or
    (p_event_type in ('PURCHASE_REFUNDED', 'PURCHASE_CHARGEBACK', 'PURCHASE_CANCELED') and p_action = 'revoked')
  ) then
    raise exception 'Unsupported Hotmart event or action';
  end if;
  if nullif(trim(p_event_id), '') is null
     or nullif(trim(p_transaction_id), '') is null
     or nullif(trim(p_buyer_email), '') is null
     or p_event_created_at < 0 then
    raise exception 'Invalid Hotmart event';
  end if;

  -- The event id is the idempotency key. A duplicate cannot change a purchase.
  insert into public.hotmart_webhook_events (event_id, event_type, event_created_at, payload)
  values (trim(p_event_id), p_event_type, p_event_created_at, p_payload)
  on conflict (event_id) do nothing;
  if not found then return jsonb_build_object('outcome', 'duplicate'); end if;

  -- Serialize different events for the same transaction before reading it.
  perform pg_advisory_xact_lock(hashtext(trim(p_transaction_id)));
  select * into v_existing
  from public.hotmart_purchases
  where transaction_id = trim(p_transaction_id)
  for update;

  -- A later event always wins. For an equal timestamp, a revocation takes
  -- precedence over approval; an approval can never reinstate a revocation.
  if found
     and (
       v_existing.last_event_created_at > p_event_created_at
       or (
         v_existing.last_event_created_at = p_event_created_at
         and not (p_action = 'revoked' and v_existing.status = 'active')
       )
     ) then
    update public.hotmart_webhook_events
    set outcome = 'out_of_order'
    where event_id = trim(p_event_id);
    return jsonb_build_object('outcome', 'out_of_order');
  end if;

  -- Serializes against the auth.users trigger for this email. Existing users
  -- are linked immediately only when their email is confirmed.
  perform pg_advisory_xact_lock(hashtext(lower(trim(p_buyer_email))));
  select id into v_user_id
  from auth.users
  where lower(email) = lower(trim(p_buyer_email))
    and email_confirmed_at is not null
  order by created_at asc
  limit 1;

  if p_action = 'approved' then
    v_approved_at := to_timestamp(p_event_created_at / 1000.0);
    v_access_until := v_approved_at + interval '365 days';
    insert into public.hotmart_purchases (
      transaction_id, product_id, buyer_email, user_id, status, approved_at,
      access_until, last_event_created_at, last_event_id
    ) values (
      trim(p_transaction_id), p_product_id, lower(trim(p_buyer_email)), v_user_id,
      'active', v_approved_at, v_access_until, p_event_created_at, trim(p_event_id)
    ) on conflict (transaction_id) do update set
      buyer_email = excluded.buyer_email,
      user_id = coalesce(excluded.user_id, hotmart_purchases.user_id),
      status = 'active', approved_at = excluded.approved_at,
      access_until = excluded.access_until, revoked_at = null,
      last_event_created_at = excluded.last_event_created_at,
      last_event_id = excluded.last_event_id, updated_at = now();
  else
    -- Refund, chargeback and cancellation revoke only this transaction, then
    -- the user's remaining active Hotmart purchases are recalculated.
    insert into public.hotmart_purchases (
      transaction_id, product_id, buyer_email, user_id, status, revoked_at,
      last_event_created_at, last_event_id
    ) values (
      trim(p_transaction_id), p_product_id, lower(trim(p_buyer_email)), v_user_id,
      'revoked', now(), p_event_created_at, trim(p_event_id)
    ) on conflict (transaction_id) do update set
      buyer_email = excluded.buyer_email,
      user_id = coalesce(excluded.user_id, hotmart_purchases.user_id),
      status = 'revoked', revoked_at = now(),
      last_event_created_at = excluded.last_event_created_at,
      last_event_id = excluded.last_event_id, updated_at = now();
  end if;

  select user_id into v_user_id
  from public.hotmart_purchases
  where transaction_id = trim(p_transaction_id);

  perform public.sync_luna_user_access(v_user_id);
  update public.hotmart_webhook_events set outcome = 'processed' where event_id = trim(p_event_id);
  return jsonb_build_object('outcome', 'processed');
end;
$$;

create or replace function public.link_hotmart_purchase_after_email_confirmation()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if new.email_confirmed_at is not null
     and (tg_op = 'INSERT' or old.email_confirmed_at is null or lower(old.email) is distinct from lower(new.email)) then
    perform public.link_hotmart_purchases_for_user(new.id, new.email);
  end if;
  return new;
end;
$$;

-- Must be created by a role allowed to create triggers on auth.users.
drop trigger if exists on_auth_user_link_hotmart_purchase on auth.users;
create trigger on_auth_user_link_hotmart_purchase
after insert or update of email, email_confirmed_at on auth.users
for each row execute function public.link_hotmart_purchase_after_email_confirmation();

-- SECURITY DEFINER helpers and the trigger function cannot be invoked directly
-- by browser roles. The public webhook RPC is server-role-only.
revoke all on function public.process_hotmart_purchase_event(text, text, bigint, text, bigint, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.sync_luna_user_access(uuid) from public, anon, authenticated;
revoke all on function public.link_hotmart_purchases_for_user(uuid, text) from public, anon, authenticated;
revoke all on function public.link_hotmart_purchase_after_email_confirmation() from public, anon, authenticated;

grant usage on schema public to service_role;
grant execute on function public.process_hotmart_purchase_event(text, text, bigint, text, bigint, text, text, jsonb) to service_role;

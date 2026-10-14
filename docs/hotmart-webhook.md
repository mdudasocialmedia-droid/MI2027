# Hotmart → Supabase access integration

The endpoint path is `/api/webhooks/hotmart`. Configure the complete production URL as `https://YOUR_VERCEL_PRODUCTION_DOMAIN/api/webhooks/hotmart` after the production domain is known. Do not use a preview deployment URL.

## Required environment variables

```dotenv
HOTMART_WEBHOOK_HOTTOK=the-value-from-Hotmart-Webhook-Authentication
SUPABASE_SERVICE_ROLE_KEY=server-only-service-role-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
```

`HOTMART_WEBHOOK_HOTTOK` and `SUPABASE_SERVICE_ROLE_KEY` must be set in Vercel only as server-side secrets. They must never use the `NEXT_PUBLIC_` prefix or be placed in frontend code.

## Supabase setup (approval required)

1. Before applying anything, run this read-only inspection in the Supabase SQL Editor and save the result:

   ```sql
   select column_name, data_type, udt_name, is_nullable, column_default
   from information_schema.columns
   where table_schema = 'public' and table_name = 'user_access'
   order by ordinal_position;

   select conname, pg_get_constraintdef(oid)
   from pg_constraint
   where conrelid = 'public.user_access'::regclass;
   ```

   The integration requires `user_id`, `status`, and `access_until`, and only writes the already-used lower-case value `active`. It does **not** assume that `inactive` is permitted. Revocation sets `access_until` to the current time, which the existing middleware denies.
2. Review `supabase/hotmart-access.sql` against that result, then run it in the Supabase SQL Editor with an owner/admin role.
3. Confirm that the executing role is allowed to create a trigger on `auth.users`. The trigger links purchases only after `email_confirmed_at` is set; it also covers users already registered when the purchase event arrives.
4. Do not add browser RLS policies for `hotmart_purchases`, `hotmart_webhook_events`, or `hotmart_managed_access`. Browser roles have no table permissions and no `EXECUTE` permission on the security-definer helpers. Only `service_role` receives `EXECUTE` on the webhook RPC.

## Hotmart setup

1. In Hotmart, register a Webhook 2.0.0 for product `8732001`.
2. Paste the production endpoint URL.
3. Select `PURCHASE_APPROVED`, `PURCHASE_REFUNDED`, `PURCHASE_CHARGEBACK`, and `PURCHASE_CANCELED`.
4. Copy the Hottok shown in Hotmart's Webhook Authentication screen to `HOTMART_WEBHOOK_HOTTOK`.

## Safe test plan before sales are enabled

1. Deploy to a non-production Vercel environment with a separate Supabase test project and test Hottok.
2. Use Hotmart's webhook test/sandbox event for product `8732001` and `PURCHASE_APPROVED`.
3. Verify one row is created in `hotmart_webhook_events`, one in `hotmart_purchases`, and that `user_access.status` is exactly `active` with an `access_until` 365 days after the event timestamp.
4. Send the exact same event again: it must return success with `duplicate` and not change access.
5. Send an older event for the same transaction: it must return `out_of_order` and not change access.
6. Send refund, chargeback, and cancellation tests. Confirm only that transaction becomes revoked and another valid transaction for the same user keeps `user_access` active.
7. Test a purchase before registration, then register and confirm the same email. The trigger must link the purchase only after email confirmation.
8. Test a wrong Hottok and another product id. They must not create database rows.
9. Submit two different events for the same transaction concurrently. The transaction lock must leave only the newest Hotmart event effective. An older timestamp must be recorded as `out_of_order`; at an equal timestamp, refund, chargeback, or cancellation must take precedence over approval.
10. Confirm a separately granted, currently valid `user_access` record is not changed when a Hotmart purchase is revoked. The integration manages only access rows it created itself.

# Supabase migration and RLS verification runbook

Use this before private beta after creating or refreshing the target Supabase project.

## 1. Apply the migration

The required migrations are:

```text
supabase/migrations/20260427015000_production_foundation.sql
supabase/migrations/20260427025000_launch_schema_extensions.sql
```

Apply it with the Supabase CLI or paste/run it in the Supabase SQL editor for the target project.

Recommended CLI flow when the project is linked:

```bash
supabase db push
```

If using the SQL editor, run the full migration once and confirm it completes without errors.

## 2. Confirm required tables exist

Run in Supabase SQL editor:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'organizations',
    'profiles',
    'organization_memberships',
    'organization_invitations',
    'subscriptions',
    'billing_customers',
    'controls',
    'evidence_items',
    'control_activity_events',
    'control_comments',
    'admin_support_notes',
    'stripe_webhook_events'
  )
order by table_name;
```

Expected: every listed table appears.

Then confirm launch extension columns exist:

```sql
select table_name, column_name
from information_schema.columns
where table_schema = 'public'
  and (
    (table_name = 'organizations' and column_name in ('canada_buys_id', 'primary_contact_name', 'primary_contact_email', 'primary_contact_phone', 'readiness_scope', 'systems_in_scope'))
    or (table_name = 'organization_invitations' and column_name in ('delivery_status', 'delivery_provider', 'provider_message_id', 'last_delivery_error', 'last_sent_at'))
    or (table_name = 'organization_memberships' and column_name in ('disabled_at', 'disabled_by_membership_id', 'role_updated_at', 'role_updated_by_membership_id'))
  )
order by table_name, column_name;
```

Expected: all listed launch extension columns appear.

## 3. Confirm RLS is enabled

```sql
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'organizations',
    'profiles',
    'organization_memberships',
    'organization_invitations',
    'subscriptions',
    'billing_customers',
    'controls',
    'evidence_items',
    'control_activity_events',
    'control_comments',
    'admin_support_notes',
    'stripe_webhook_events'
  )
order by tablename;
```

Expected: `rowsecurity = true` for every table.

## 4. Confirm browser policies do not expose service-only tables

```sql
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('admin_support_notes', 'stripe_webhook_events')
order by tablename, policyname;
```

Expected: no rows unless a future audited support/admin workflow intentionally adds policies.

## 5. Private-beta tenant isolation smoke test

Create two test users and two organizations through the app. Then confirm each user only sees their own organization through the Supabase client/API path.

Minimum manual app test:

1. Sign up as User A and complete test-mode checkout.
2. Sign up as User B and complete test-mode checkout.
3. As User A, create/update a control and evidence record.
4. As User B, confirm User A's organization, controls, evidence, billing customer, and invitations are not visible.
5. As User A owner/admin, invite User B only if you intentionally want cross-membership; otherwise keep orgs isolated.

## 6. Invitation lifecycle smoke test

1. As an owner/admin, create an invitation in `/settings`.
2. Confirm one row appears in `organization_invitations` with `status = 'pending'`.
3. If `RESEND_API_KEY` and `INVITE_FROM_EMAIL` are configured, confirm the invite email arrives and `delivery_status = 'sent'`.
4. Accept the invitation while signed in as the invited email.
5. Confirm the invitation row changes to `accepted`.
6. Confirm `organization_memberships` has an active membership for the invited user.
7. Try revoking an already accepted invite; expected behavior: no pending invite should be revoked.

## 7. Webhook idempotency smoke test

Send the same Stripe test event twice.

Expected:

- first delivery inserts `stripe_webhook_events.status = 'processed'`
- duplicate delivery returns successfully without reprocessing
- subscription/org state remains stable

## 8. Record evidence

For each verification run, record:

- Supabase project name
- migration date/time
- tester emails used
- Stripe test customer/subscription IDs
- pass/fail notes
- screenshots or logs for any failures

Do not move to broad paid launch until this runbook passes against the actual production-like Supabase project.

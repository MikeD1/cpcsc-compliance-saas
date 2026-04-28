# Trust Gate Verification

This file records production-like trust-gate checks for ComplianceOne. These checks support private-beta readiness; they do not represent certification, audit assurance, or Government of Canada approval.

## 2026-04-27 trust-gate run

Environment under test:

- App URL: `http://10.0.0.204:3000`
- Supabase project URL: `https://dznaipvkmyfmcfbeqfil.supabase.co`
- Stripe mode: test-mode credentials from local `.env`
- Runner: local development environment

### Supabase/RLS and tenant isolation

Command:

```bash
node scripts/trust-gate-supabase-check.mjs
```

Result: **PASS**

Checks completed:

- Required table reachability via service-role client:
  - `organizations`
  - `profiles`
  - `organization_memberships`
  - `organization_invitations`
  - `subscriptions`
  - `billing_customers`
  - `controls`
  - `evidence_items`
  - `control_activity_events`
  - `control_comments`
  - `admin_support_notes`
  - `stripe_webhook_events`
- Created two temporary authenticated test users.
- Created two temporary organizations, one per user.
- Created one control and one evidence record per organization.
- Signed in through browser-client credentials for each user.
- Confirmed each user could see their own organization, control, and evidence record.
- Confirmed each user could not see the other user's organization, control, or evidence record.
- Confirmed each user could not update the other organization's control.
- Cleaned up temporary test users, organizations, controls, evidence, subscriptions, memberships, profiles, and auth users.

Important scope note:

- This is a practical tenant-isolation smoke test through Supabase authenticated client access.
- It does not replace manual SQL inspection of `pg_tables` / `pg_policies` from `docs/db-rls-verification.md` when direct SQL access is available.

### Stripe checkout, portal, reconcile, and webhook idempotency

Command:

```bash
node scripts/trust-gate-stripe-check.mjs
```

Result: **PASS**

Checks completed:

- Created a temporary authenticated test user and organization.
- Established the app session through `/api/auth/login`.
- Confirmed `/api/billing/checkout-link?plan=start&organizationId=...` redirects to Stripe Checkout.
- Confirmed a Stripe billing customer is recorded in Supabase.
- Created a Stripe test subscription with a trial period for the billing customer.
- Confirmed `/api/billing/reconcile` syncs the test subscription back into Supabase.
- Confirmed `/api/billing/portal` redirects to Stripe Billing Portal.
- Posted a signed `customer.subscription.updated` webhook event to `/api/stripe/webhook`.
- Posted the same signed webhook event a second time.
- Confirmed the duplicate webhook returned as idempotent.
- Confirmed the `stripe_webhook_events` row status was `processed`.
- Cleaned up temporary Supabase and Stripe records.

Important scope note:

- This verifies checkout-session creation and Stripe integration paths programmatically.
- It does not replace a full browser payment-card checkout run using Stripe's hosted checkout UI and test card.

## Remaining trust gates before broader paid launch

- Run a full hosted Stripe Checkout payment in-browser with a Stripe test card.
- Confirm `/dashboard?checkout=success&session_id=...` activates the workspace immediately after hosted checkout return.
- Run the manual SQL portions of `docs/db-rls-verification.md` if direct SQL access is available.
- Add automated regression tests for auth/session, route authorization, tenant isolation, evidence/control mutations, and webhook idempotency.
- Formalize billing recovery, invite delivery failure, webhook failure, support escalation, and data isolation incident runbooks.

# CPCSC Compliance SaaS

ComplianceOne is a CPCSC Level 1 readiness SaaS for Canadian defence suppliers. This repo contains the marketing site, Supabase-backed auth and workspace data, Stripe billing hooks, and the protected compliance workspace for controls, evidence, and reporting.

## Current state

This is an active product prototype moving toward live testing.

Working now:
- marketing homepage and pricing page
- Supabase-backed signup/login flow
- organization bootstrap on signup
- Stripe checkout session creation
- gated application shell
- dashboard, controls, evidence, reports, settings, and PDF export routes
- member-backed control ownership and review actions
- owner/admin team invitations with manual invite links, accept/revoke flows, role editing, and disable/reactivate lifecycle controls
- evidence register create/edit/relink/archive actions
- Stripe checkout, reconciliation, webhook sync, and customer portal route
- read-only admin/support console gated by `ADMIN_EMAILS`
- production build passes

Known cleanup items:
- apply `supabase/migrations/20260427015000_production_foundation.sql` to the target Supabase project and verify RLS behavior
- run Stripe webhook idempotency through test-mode events
- add transactional email delivery and richer member lifecycle polish
- file uploads still require Supabase Storage policy, signed URL, retention, and audit design

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase (auth + app data)
- Stripe (subscriptions)

## Key routes

### Public
- `/`
- `/pricing`
- `/signup`
- `/login`
- `/security`
- `/privacy`
- `/terms`
- `/faq`
- `/contact`

### Protected app
- `/dashboard`
- `/controls`
- `/evidence`
- `/reports`
- `/settings`
- `/invite/accept`
- `/exports/assessment.pdf`

### API
- `/api/auth/login`
- `/api/auth/logout`
- `/api/auth/signup`
- `/api/billing/checkout`
- `/api/billing/checkout-link`
- `/api/billing/reconcile`
- `/api/billing/portal`
- `/api/controls/[controlId]`
- `/api/evidence`
- `/api/evidence/[evidenceId]`
- `/api/organization/settings`
- `/api/organization/invitations`
- `/api/organization/invitations/[invitationId]`
- `/api/organization/invitations/accept`
- `/api/stripe/webhook`

### Admin
- `/admin` — read-only support console, restricted by `ADMIN_EMAILS`

## Environment variables

Copy `.env.example` to `.env` and fill in real values.

Required for app auth/data:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Required for billing:
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `STRIPE_START_PRODUCT_ID`
- `STRIPE_START_PRICE_ID`
- `STRIPE_GROWTH_PRODUCT_ID`
- `STRIPE_GROWTH_PRICE_ID`

Recommended for launch:
- `NEXT_PUBLIC_SUPPORT_EMAIL`
- `NEXT_PUBLIC_SECURITY_EMAIL`
- `ADMIN_EMAILS`

Optional for transactional invite email delivery:
- `RESEND_API_KEY`
- `INVITE_FROM_EMAIL`

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`

## Build

```bash
npm run build
npm start
```

## Documentation

- `PRODUCTION_READINESS.md` — product-readiness tracker
- `PRODUCTION_FUNCTIONALITY_GAPS.md` — production-level missing functionality inventory
- `EXTERNAL_TESTER_SCRIPT.md` — private-launch test script
- `docs/supabase-schema.md` — current schema assumptions and migration checklist
- `supabase/migrations/20260427015000_production_foundation.sql` — executable baseline tables, RLS policies, invitation foundation, audit/support tables, and Stripe webhook idempotency table
- `supabase/migrations/20260427025000_launch_schema_extensions.sql` — organization profile fields, invitation delivery audit columns, member lifecycle audit columns, and pending-invite uniqueness
- `supabase/migrations/20260427030000_controlplane_to_complianceone_upgrade.sql` — compatibility upgrade for Supabase projects that already applied the original ControlPlane schema
- `docs/security-boundaries.md` — authorization and service-role boundaries
- `docs/db-rls-verification.md` — migration, RLS, invitation, and webhook verification runbook

## Launch-test checklist

Before external testing:
1. apply the production foundation Supabase migration for a fresh project, or the ControlPlane compatibility upgrade if the old schema already exists
2. apply the launch schema extension migration
3. configure Supabase env vars
4. configure Stripe env vars
5. confirm Stripe price/product IDs match the intended test products
6. verify signup creates org, membership, subscription row, and controls
7. verify checkout success updates organization subscription status and records webhook events once
8. verify gated routes unlock after billing
9. run `docs/db-rls-verification.md` against the target Supabase project

## Architecture note

This app is intentionally **Supabase-first** right now.

- Supabase Auth handles identity
- Supabase tables hold organizations, memberships, subscriptions, controls, profiles, and evidence metadata
- Stripe handles billing and webhook-driven subscription state
- Next.js provides the marketing site, app shell, and server routes

If Prisma returns later, it should be added for a clear reason and against the real production datastore rather than as a leftover local SQLite path.

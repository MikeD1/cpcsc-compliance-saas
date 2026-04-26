# CPCSC Compliance SaaS

ComplianceOne is a CPCSC Level 1 readiness SaaS for Canadian defence suppliers. This repo contains the marketing site, signup/login flow, Stripe billing hooks, and the protected compliance workspace for controls, evidence, and reporting.

## Current state

This is an active product prototype moving toward live testing.

Working now:
- marketing homepage and pricing page
- Supabase-backed signup/login flow
- organization bootstrap on signup
- Stripe checkout session creation
- gated application shell
- dashboard, controls, evidence, reports, and PDF export routes
- production build passes

Known cleanup items:
- Prisma schema is present, but the app currently behaves as a Supabase-first product
- local Prisma SQLite artifacts should not be treated as production data
- env/config setup must be completed before live billing tests

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase (auth + app data)
- Stripe (subscriptions)
- Prisma (currently transitional / partial)

## Key routes

### Public
- `/`
- `/pricing`
- `/signup`
- `/login`

### Protected app
- `/dashboard`
- `/controls`
- `/evidence`
- `/reports`
- `/exports/assessment.pdf`

### API
- `/api/auth/login`
- `/api/auth/logout`
- `/api/auth/signup`
- `/api/billing/checkout`
- `/api/billing/checkout-link`
- `/api/billing/reconcile`
- `/api/controls/[controlId]`
- `/api/evidence`
- `/api/stripe/webhook`

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

Optional / local:
- `DATABASE_URL`

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

## Launch-test checklist

Before external testing:
1. configure Supabase env vars
2. configure Stripe env vars
3. confirm Stripe price/product IDs match the intended test products
4. verify signup creates org, membership, subscription row, and controls
5. verify checkout success updates organization subscription status
6. verify gated routes unlock after billing
7. remove local-only tracked artifacts like `prisma/dev.db`

## Product note

Right now, the real source of truth appears to be Supabase-backed product flows, not Prisma/SQLite. Keep that explicit while testing so the architecture stays understandable.

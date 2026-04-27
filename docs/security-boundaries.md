# Security and Authorization Boundaries

ComplianceOne currently uses Next.js server routes with Supabase service-role access. This keeps privileged keys server-side, but it means each route must enforce organization scoping explicitly.

## Current server-side authorization rules

- Authentication is based on the app session cookie created from a Supabase access token.
- Protected pages call `getCurrentAccess()` and redirect unauthenticated users to `/login`.
- Subscription-gated pages require organization status `active` or `trialing`.
- Mutating API routes derive organization identity from `getCurrentUser()` instead of accepting client-supplied organization IDs, except where an ID is used only after membership validation.
- Control owner assignment validates the owner membership belongs to the current organization and is active.
- Evidence create/update/archive validates records belong to the current organization.
- Billing portal/reconcile endpoints require current organization membership.
- Admin/support console is restricted by `ADMIN_EMAILS` and is read-only.

## Current known risks

- The app stores a raw Supabase access token in an httpOnly app cookie.
- Webhook idempotency is not backed by a `stripe_webhook_events` table yet.
- There is no route-level role distinction beyond organization membership for most user actions.
- Admin console has no support-note audit table yet.
- Supabase schema and RLS policies are not represented as executable migrations in this repo.

## Route review checklist

For every new API route:

1. Call `getCurrentUser()` or an admin-specific access helper.
2. Never trust `organizationId` from request body without verifying current membership.
3. Scope every Supabase query by organization ID when reading or mutating org-owned records.
4. Validate foreign keys like control IDs, evidence IDs, and membership IDs against the same organization.
5. Return 401 for unauthenticated users and 403/400 for unauthorized or invalid org-scoped resources.
6. Keep service-role keys server-only.
7. Prefer archival status changes over hard deletes until retention policy is formalized.

## Recommended hardening backlog

- Add Supabase migrations and RLS policy documentation.
- Add `stripe_webhook_events` and process webhooks idempotently.
- Add activity/audit events for control changes, evidence changes, billing support actions, and admin reads.
- Add role permissions (`owner`, `admin`, `member`) before enabling member invites and role edits.
- Replace raw app-session token storage with a more purpose-built session strategy.

# Security and Authorization Boundaries

ComplianceOne uses Next.js server routes with Supabase service-role access for privileged database work. Service-role keys stay server-side, so every route that reads or mutates workspace data must enforce authentication, membership, and organization scoping in application code.

## Current server-side authorization rules

- Authentication is based on the app session cookie created from a Supabase access token.
- Protected pages call `getCurrentAccess()` and redirect unauthenticated users to `/login`.
- Subscription-gated pages require organization status `active` or `trialing`.
- Mutating API routes derive organization identity from `getCurrentUser()` instead of trusting client-supplied organization IDs.
- Where a request includes an organization, membership, control, evidence, or invitation ID, the route validates that resource against the current user's organization before acting.
- Control owner assignment validates that the selected owner membership belongs to the current organization and is active.
- Evidence create/update/archive validates records belong to the current organization.
- Billing checkout, portal, and reconcile endpoints require current organization membership; reconcile/portal require owner/admin billing permissions.
- Team invitation and member lifecycle routes use role checks from `src/lib/permissions.ts`.
- Admin/support console access is restricted by `ADMIN_EMAILS`. Destructive user cleanup should remain manual/owner-approved until the support model is formalized.

## Database and RLS posture

Executable Supabase migrations are represented in this repo:

- `supabase/migrations/20260427015000_production_foundation.sql` for fresh projects.
- `supabase/migrations/20260427030000_controlplane_to_complianceone_upgrade.sql` for existing ControlPlane-origin projects.
- `supabase/migrations/20260427025000_launch_schema_extensions.sql` for launch profile, invitation delivery, and member audit columns.
- `supabase/migrations/20260427120500_normalize_legacy_plan_codes.sql` for legacy plan-code cleanup.

The intended browser-client boundary is tenant isolation through Supabase RLS. The app still uses service-role access for server routes, so RLS verification must be paired with route-level authorization review.

Verification helpers:

- `docs/db-rls-verification.md` describes the manual SQL/app verification process.
- `scripts/trust-gate-supabase-check.mjs` performs a practical service-role table reachability and two-user/two-org browser-client isolation smoke test.
- `docs/trust-gate-verification.md` records dated trust-gate results.

## Stripe and billing boundaries

- Stripe subscription state is synchronized through checkout return sync, webhook events, and the owner/admin reconcile endpoint.
- Webhook idempotency is backed by `stripe_webhook_events` and unique Stripe event IDs.
- Duplicate webhook deliveries should return successfully without reprocessing already processed or in-flight events.
- Customer portal access requires current organization membership and owner/admin billing permission.
- Refunds, disputes, and money-moving support actions should be handled in Stripe first until an audited support workflow exists in the app.

Verification helper:

- `scripts/trust-gate-stripe-check.mjs` performs checkout-session creation, billing customer creation, test subscription reconcile, customer portal redirect, signed webhook delivery, and duplicate webhook idempotency checks.

## Evidence boundary

Evidence is currently a **register**, not a file vault.

The app stores evidence metadata such as title, type, control link, and source/reference location. It does not yet provide production file uploads, storage retention, signed URL access, malware scanning, or file-level audit trails.

Do not market ComplianceOne as a secure document vault until Supabase Storage policies, retention rules, signed URL behavior, audit logging, and pricing impact are designed and verified.

## Current known risks

- The app stores a raw Supabase access token in an httpOnly app cookie. This is acceptable for private beta but should be revisited before broader scale.
- Most server routes rely on route-level organization scoping because service-role access bypasses RLS.
- Automated regression tests are still missing; current gates are lint/build plus manual/scripted trust-gate checks.
- Support/admin audit workflows are incomplete; support actions should be minimal, documented, and owner-approved.
- File upload/storage is intentionally not implemented yet.

## Route review checklist

For every new API route:

1. Call `getCurrentUser()` or an admin-specific access helper.
2. Never trust `organizationId` from request body without verifying current membership.
3. Scope every Supabase query by organization ID when reading or mutating org-owned records.
4. Validate foreign keys like control IDs, evidence IDs, invitation IDs, and membership IDs against the same organization.
5. Check role permissions for owner/admin-only actions.
6. Return 401 for unauthenticated users and 403/400 for unauthorized or invalid org-scoped resources.
7. Keep service-role keys server-only.
8. Prefer archival/status changes over hard deletes until retention policy is formalized.
9. Add or update a trust-gate/test case when a route affects auth, billing, tenant isolation, or evidence integrity.

## Recommended hardening backlog

- Add automated tests for auth/session handling, organization isolation, control/evidence mutation scoping, invite lifecycle, and Stripe webhook idempotency.
- Add activity/audit events for control changes, evidence changes, billing support actions, and admin reads.
- Formalize support runbooks for billing recovery, invite delivery failure, webhook failure, and data isolation incident response.
- Replace raw app-session token storage with a more purpose-built session strategy before broad launch.
- Design Supabase Storage evidence upload architecture before implementing file upload.

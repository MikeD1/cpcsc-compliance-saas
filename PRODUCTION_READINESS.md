# Production Readiness Tracker

This file is the durable working checklist for turning ComplianceOne from a credible prototype into a production-ready CPCSC readiness SaaS.

Use this as the source of truth for iterative cleanup. Update it as items are completed, reprioritized, or split into implementation tickets.

## Current focus

**External tester readiness** comes before deeper workflow expansion.

Reason: before we invite real users, the product must not break trust at signup, checkout, app entry, support, legal/trust, or the first control/evidence/report loop.

---

## P0 — Must fix before real external testers

### Account, signup, and activation

- [x] Fix signup/workspace bootstrap after auth hardening.
  - Current risk: signup form sends an Authorization bearer token, but server-side `getCurrentUser()` now only trusts the app session cookie.
  - Outcome: new users reliably create organization, profile, membership, subscription row, and controls.

- [x] Add clear email-confirmation messaging.
  - If Supabase requires email confirmation, `/login?signup=check-email&plan=...` should explain what happened and what the user must do next.

- [x] Add resume-checkout path for existing incomplete organizations.
  - Activation gate should not send users into a signup loop.
  - Outcome: user can resume billing checkout for their existing organization.

- [x] Add a visible “recheck billing” action on the subscription gate.
  - Use existing reconcile API or a safer equivalent.

### Customer-facing trust breaks

- [x] Remove hardcoded customer/demo copy from the app shell.
  - Completed: app shell now displays the actual organization name or neutral fallback.
  - Outcome: shell displays the actual organization name or neutral fallback.

- [x] Remove remaining internal/prototype language across protected app pages.
  - Controls, evidence, reports, dashboard, sidebar.
  - Outcome: user sees buyer/customer language, not builder language.

- [x] Add real public support/contact details.
  - Support email.
  - Billing escalation path.
  - Security contact path.
  - Expected response time.

- [x] Make privacy/terms launch-safe.
  - Completed: pages are honest, lightweight, and no longer describe themselves as placeholder notes.
  - Outcome: honest, lightweight, launch-safe policy pages.

### First-use product clarity

- [x] Add post-activation onboarding checklist.
  - Suggested items:
    - confirm organization profile
    - define readiness scope
    - assign first controls
    - add first evidence record
    - generate readiness report
    - invite teammate / add owner when team management exists

- [x] Reposition “Evidence vault” as “Evidence register” until file upload/storage exists.
  - Current product does metadata/location tracking, not actual file vaulting.
  - Outcome: no overpromise around secure file storage.

- [x] Rename report language from “sample PDF” / “attestation outputs” to customer-safe “readiness report”.
  - Outcome: report flow is useful without implying certification/acceptance guarantees.

- [x] Add empty states for dashboard/evidence/reports.
  - Outcome: first-time users know what to do before data exists.

### External tester script

- [x] Create a manual external tester script covering:
  - visit homepage
  - view pricing
  - create account
  - complete checkout
  - unlock dashboard
  - edit a control
  - add evidence record
  - export readiness report
  - contact support

---

## P1 — Product functionality needed for real readiness management

### Team and organization management

- [x] Add organization profile/settings.
  - Completed: `/settings` now exposes schema-backed organization name editing and primary contact display.
  - Still schema-blocked: CanadaBuys ID, editable primary contact details, readiness scope, and systems/assets in scope need explicit Supabase columns/migration docs before wiring writes.

- [x] Add team/member management basics.
  - Completed: settings now lists organization members with role/status for ownership context.
  - Still pending: invite members, role editing, and active/invited lifecycle actions.

- [x] Use actual organization members for control ownership.
  - Completed: control editor uses active organization members as owner options.
  - Completed: dashboard/reports/PDF display member names/emails instead of raw IDs.
  - Completed: control update API validates owner membership belongs to the current organization and is active.

### Control workflow

- [ ] Replace review cadence text with real review workflow.
  - Cadence enum.
  - Next review date.
  - Last reviewed date.
  - Reviewed by.
  - Request review / mark reviewed flow.

- [ ] Add control comments/activity history.
  - Track status changes.
  - Track owner changes.
  - Track evidence additions.
  - Show recent activity per control.

- [ ] Improve controls page from “all editors” to work management.
  - List/detail pattern.
  - Filters by owner/status/category.
  - Unassigned controls.
  - Due reviews.
  - Required evidence checklist.

### Evidence workflow

- [ ] Decide evidence model: register-only now vs storage-backed upload.
  - If register-only: copy and UI must stay honest.
  - If upload-backed: implement Supabase Storage.

- [ ] Add evidence management actions.
  - Edit.
  - Delete/archive.
  - Relink to another control.
  - Status/review flag.
  - Notes/source/uploader/date.

- [ ] Add Supabase Storage-backed file upload/download if moving beyond register.
  - Upload.
  - Signed download URLs.
  - Preview/download.
  - Replace/version.
  - Delete/archive.
  - Retention posture.

### Dashboard and reports

- [ ] Make dashboard action-oriented.
  - My tasks.
  - Unassigned controls.
  - Missing evidence.
  - Due/stale reviews.
  - Recent activity.
  - Readiness percentage.

- [ ] Improve reports for leadership/procurement use.
  - Executive summary.
  - Evidence inventory.
  - Exceptions/gaps.
  - Owner accountability.
  - Report date/scope.
  - Clear limitations.
  - Customer branding.

---

## P2 — Operations, scale, and credibility

- [ ] Add Stripe customer portal for self-serve billing.
  - Change plan.
  - Cancel.
  - Payment method.
  - Invoices.

- [ ] Add admin/support console.
  - Org lookup.
  - Failed signup repair.
  - Subscription state inspection/override.
  - Support notes.

- [ ] Add Supabase schema/migration documentation.
  - Tables currently assumed by app code:
    - organizations
    - profiles
    - organization_memberships
    - subscriptions
    - controls
    - evidence_items
    - billing_customers

- [ ] Tighten service-role usage boundaries.
  - Document authorization assumptions.
  - Add audit logging where practical.
  - Consider RLS posture and server-only service role patterns.

- [ ] Add procurement-grade FAQ and trust details.
  - CPCSC Level 1 scope.
  - What the tool does / does not guarantee.
  - CAD billing and tax handling.
  - Data handling/residency/subprocessors.
  - Support expectations.

---

## Recommended next build slice

**External tester readiness pass**

Start with the P0 items in this order:

1. Fix signup/session bootstrap.
2. Remove hardcoded/internal app copy.
3. Add email-confirmation messaging.
4. Add resume-checkout/recheck-billing path.
5. Add real support/contact details.
6. Make trust pages launch-safe.
7. Reposition evidence/report language honestly.
8. Add onboarding checklist and empty states.
9. Create the manual tester script.

After that, move into:

**Team-backed control work management + evidence files**

# Production Functionality Gap Inventory

This is the durable list of missing functionality to bring ComplianceOne from private-beta readiness toward production-level SaaS readiness.

Status: active. Use this as an implementation backlog, not as marketing copy. Items are grouped by release risk and customer impact.

## P0 — Must pass before guided private beta

These are not all new features; they are proof that the current product works safely in the real environment.

### Supabase production verification

- [ ] Apply the correct migration path to the target Supabase project:
  - Fresh project: `20260427015000_production_foundation.sql`, then `20260427025000_launch_schema_extensions.sql`.
  - Existing ControlPlane project: `20260427030000_controlplane_to_complianceone_upgrade.sql`, then `20260427025000_launch_schema_extensions.sql`.
- [ ] Run `docs/db-rls-verification.md` end to end.
- [ ] Prove tenant isolation with two test organizations and two test users.
- [ ] Confirm service-only tables have no browser-access policies:
  - `admin_support_notes`
  - `stripe_webhook_events`
- [ ] Capture verification evidence: project name, tester emails, SQL output/screenshots, pass/fail notes.

### Stripe test-mode proof

- [ ] Verify signup → checkout → webhook → dashboard unlock.
- [ ] Verify duplicate Stripe webhook delivery is idempotent.
- [ ] Verify billing reconcile updates stale/incomplete subscription state.
- [ ] Verify Stripe customer portal works for the test customer.
- [ ] Document required Stripe dashboard setup:
  - products
  - prices
  - webhook endpoint/events
  - customer portal configuration
  - test/live key separation

### Private tester happy path

- [ ] Run `EXTERNAL_TESTER_SCRIPT.md` against the real test-mode environment.
- [ ] Record failures and screenshots.
- [ ] Confirm dashboard first-run checklist lands on exact task sections.
- [ ] Confirm invite creation, email delivery/fallback link, accept flow, member role edit, and disable/reactivate flow.
- [ ] Confirm report PDF includes current control/evidence state and does not overclaim certification.

## P1 — Product workflow needed for production usefulness

### Organization profile and scope

- [ ] Wire newly-added organization profile fields into `/settings`:
  - CanadaBuys ID
  - primary contact name/email/phone
  - readiness scope
  - systems/assets in scope
- [ ] Show scope fields in dashboard and reports.
- [ ] Add validation and empty-state guidance for scope fields.

### Controls work management

- [ ] Improve `/controls` from all-expanded editors to a work-management flow:
  - filters by status, owner, evidence gap, review queue
  - list/detail pattern or progressive disclosure
  - quick actions for assign owner / request review / mark reviewed
- [ ] Add required-evidence guidance per control.
- [ ] Add due-review concepts after review schedule fields exist.
- [ ] Add comments/activity history UI using the existing audit/comment tables.

### Evidence workflow

- [ ] Keep evidence register-only until storage design is complete.
- [ ] If moving beyond register, design and implement Supabase Storage:
  - private bucket
  - tenant-scoped object paths
  - signed upload/download URLs
  - preview/download actions
  - replace/version behavior
  - archive/delete retention policy
  - audit trail for evidence actions
- [ ] Add evidence notes/review status if needed by testers.

### Team lifecycle

- [ ] Add resend-invite action.
- [ ] Add invitation expiry handling UI.
- [ ] Add role-change confirmation for owner/admin changes.
- [ ] Add safer owner transfer flow if needed.
- [ ] Add disabled-member visibility and restore guidance.

## P2 — Production operations and trust

### Support/admin operations

- [ ] Add audited support notes in `/admin` using `admin_support_notes`.
- [ ] Add failed signup/activation investigation workflow.
- [ ] Add read-only diagnostic detail copy buttons for support.
- [ ] Add support intake process:
  - severity levels
  - expected response times
  - escalation owner
  - customer-facing incident/security notification template

### Deployment and reliability

- [ ] Add deployment runbook.
- [ ] Add environment-variable checklist with owner/source for each secret.
- [ ] Add rollback procedure.
- [ ] Add monitoring/error tracking plan.
- [ ] Add backup/restore posture for Supabase data and future evidence storage.
- [ ] Define browser/device support matrix.

### Security and compliance trust

- [ ] Add source/date methodology note for CPCSC mapping.
- [ ] Add claims matrix and review marketing/app/report copy against it.
- [ ] Add subprocessor/data residency documentation.
- [ ] Add customer security questionnaire starter responses.
- [ ] Run accessibility review:
  - keyboard navigation
  - focus states
  - color contrast
  - semantic headings/landmarks
  - form errors/status labels

## P3 — Automated quality gates

- [ ] Add unit tests for readiness/status calculations.
- [ ] Add unit tests for plan lookup and billing state helpers.
- [ ] Add API tests for route-level permission gates.
- [ ] Add Stripe webhook/idempotency tests.
- [ ] Add E2E smoke path:
  - signup/login
  - checkout/resume
  - dashboard onboarding
  - edit control
  - add evidence
  - export report
- [ ] Add CI pipeline for lint, build, tests, and dependency audit.

## P4 — Go-to-market readiness

- [ ] Recruit 3–5 friendly design partners.
- [ ] Run 8–12 discovery calls across Canadian defence SMBs, primes/supplier managers, and procurement-adjacent advisors.
- [ ] Validate ICP, urgency, budget owner, bid trigger, and price sensitivity.
- [ ] Create guided beta assets:
  - demo script
  - one-page buyer/procurement brief
  - screenshot walkthrough
  - evidence checklist/template library
  - beta onboarding email
  - conservative launch copy
- [ ] Maintain objection log and feature/proof request log.

## Current non-goals / guardrails

- Do not launch broad paid self-serve until Supabase/RLS and Stripe test-mode QA pass.
- Do not imply certification, government endorsement, audit acceptance, or contract eligibility guarantees.
- Do not market evidence vaulting until Supabase Storage/RLS/retention/audit posture is implemented.
- Do not sell enterprise-only features as live unless clearly scoped as custom/guided.

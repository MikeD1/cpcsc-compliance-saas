# Production Execution Plan

This file turns production-readiness findings into an owner-based launch execution plan for ComplianceOne.

Status: active. Current target is **controlled private tester readiness**, not broad public production launch.

## Purpose

Use this file after `PRODUCTION_READINESS.md` to answer:

- what still blocks production readiness
- who owns each workstream
- what order the work should happen in
- what can ship now vs what needs schema, ops, or go-to-market proof
- what must be validated before external customers touch it

## Current product baseline

Completed and pushed:

- P0 external tester readiness
- organization settings and member-backed control ownership
- review workflow and evidence register management
- action-oriented dashboard and stronger reports
- Stripe customer portal surface
- read-only admin/support console
- schema/security boundary documentation
- procurement FAQ/trust expansion

Completed in current working tree:

- CPCSC catalog now carries official Level 1 control IDs and names alongside friendly product titles.
- Control/evidence/report/PDF surfaces display official CPCSC IDs for buyer/procurement credibility.

Known remaining depth areas:

- executable Supabase migrations and RLS policy SQL
- Stripe webhook idempotency
- comments/activity/support-note audit tables
- Supabase Storage-backed file upload architecture
- transactional email delivery and deeper member lifecycle polish
- live Stripe/Supabase test-mode QA
- launch/customer acquisition workflow
- formal accessibility pass and automated coverage

## Grounding note from team review

Several standing-team reviews produced useful lane-level instincts but inspected an obsolete `Luna/app` Vite workspace instead of this Next.js repo. File-specific claims from those reviews are rejected unless independently verified against `/home/mike/repos/cpcsc-compliance-saas`.

Verified/general signals carried forward:

- private guided beta before broad paid launch
- schema/RLS/test-mode QA before production claims
- official CPCSC control identifiers should be visible
- claims must stay in preparation/recordkeeping language, not certification or guarantee language
- support, onboarding, accessibility, and proof-package readiness matter before outreach
- customer discovery and design-partner validation should happen before scaling acquisition

## Operating lanes and owners

| Workstream | Owner | Supporting lanes | Goal |
| --- | --- | --- | --- |
| Product scope and claims | Mira / Selene | Luca, Rowan | Keep CPCSC positioning truthful and buyer-safe. |
| Data foundation | Theo | Selene, Rowan | Add executable schema, RLS, idempotency, audit tables. |
| Product workflow | Theo / Iris | June, Rowan | Improve onboarding, evidence, reports, and recovery states. |
| QA and release gates | Rowan | Theo, Elias | Add tests, accessibility pass, and external tester validation. |
| Launch operations | Elias | June, Theo | Deployment, rollback, support, incident, and env runbooks. |
| Market validation | Jonah | Naomi, Luca | Validate ICP, pricing, design partners, and buyer proof needs. |
| Marketing/sales motion | Luca / Naomi | Camila, Jonah | Guided beta narrative, demo script, buyer brief, outreach discipline. |
| Support/onboarding | June | Iris, Elias | Support paths, help docs, severity handling, customer comms. |

## Execution sequence

### Milestone 1 — Compliance and claims truth freeze

**Owner:** Selene with Rowan/Luca

- [x] Display official CPCSC Level 1 IDs/names in the catalog and key app surfaces.
- [ ] Add a lightweight source/date note in docs or methodology copy for the official CPCSC mapping.
- [ ] Create a claims matrix:
  - allowed: “helps prepare,” “supports documentation,” “maps evidence to CPCSC Level 1 controls”
  - risky: “procurement-ready,” “audit-ready,” “validated” unless tied to specific evidence
  - banned: “certifies,” “guarantees compliance,” “Government of Canada endorsed”
- [ ] Review marketing/pricing/report copy against the claims matrix.

**Exit gate:** every customer-facing claim is supportable by the current product and docs.

### Milestone 2 — Production data foundation

**Owner:** Theo with Selene/Rowan

- [x] Add executable Supabase migrations for current assumed tables.
- [x] Add RLS policy SQL for tenant-scoped tables.
- [x] Add `stripe_webhook_events` for idempotent webhook processing.
- [x] Add activity/comment/support-note tables before building audit/support workflows.
- [x] Add `organization_invitations` schema foundation for the team invite lifecycle.
- [x] Add launch schema extension migration for org profile fields, invite email delivery audit, member lifecycle audit, and pending-invite uniqueness.
- [x] Add compatibility migration path for Supabase projects that already applied the original ControlPlane schema.
- [x] Add owner/admin route-level permission helpers and protect organization settings, billing management, and invitation management.
- [ ] Generate or document TypeScript DB types once schema stabilizes.
- [x] Add DB/RLS verification commands to the README/runbook.

**Exit gate:** one authenticated organization can safely save/reload workspace data with tenant isolation proven by tests or scripted checks.

### Milestone 3 — Billing and entitlement hardening

**Owner:** Theo with Rowan/Elias

- [x] Persist and check processed Stripe webhook event IDs.
- [ ] Verify checkout, webhook, reconcile, portal, and subscription gate in Stripe test mode.
- [ ] Document required Stripe dashboard setup: products, prices, webhook endpoint, customer portal.
- [ ] Add recovery notes for incomplete checkout and failed payment states.

**Exit gate:** signup → checkout → webhook → dashboard unlock → billing portal works in test mode with repeatable evidence.

### Milestone 4 — Product workflow hardening

**Owner:** Theo/Iris with June

- [x] Add manual team invite flow for owners/admins: create invite link, list invitations, revoke pending invitations, and accept invite after sign-in.
- [x] Add owner/admin member lifecycle controls: edit role, disable/reactivate membership, and protect the last active owner.
- [x] Add first-run onboarding around organization confirmation, members, first controls, first evidence record, and report export.
- [ ] Improve controls page into work management: filters, detail flow, gaps, review queue.
- [ ] Add better error recovery actions: retry, contact support, setup guidance, copy diagnostic details where useful.
- [ ] Keep evidence register-only until Storage/RLS/retention posture is designed.
- [ ] Define proof-package shape: readiness summary, control/evidence matrix, owners, gaps, report date, limitations.

**Exit gate:** a friendly tester can complete the external tester script without Luna/Mike handholding.

### Milestone 5 — QA, accessibility, and CI

**Owner:** Rowan with Theo

- [ ] Add unit tests for readiness/status calculations and plan lookup behavior.
- [ ] Add E2E smoke path: signup/login → checkout/resume → dashboard → edit control → add evidence → export report.
- [ ] Add Stripe webhook/idempotency tests after event table exists.
- [ ] Run accessibility pass: keyboard navigation, focus states, contrast, semantic landmarks, status labels, form errors.
- [ ] Add CI pipeline for lint, build, tests, and audit.
- [ ] Define browser/device support matrix for private beta.

**Exit gate:** automated gates run cleanly and manual accessibility blockers are resolved or tracked.

### Milestone 6 — Launch operations

**Owner:** Elias with June/Theo

- [ ] Add deployment runbook.
- [ ] Add environment variable checklist with owner/source for each secret.
- [ ] Add rollback procedure.
- [ ] Add support intake process, severity levels, response expectations, and escalation owners.
- [ ] Add incident/security customer notification template.
- [ ] Add backup/restore posture for Supabase data and future evidence storage.
- [ ] Confirm monitoring/error tracking plan.

**Exit gate:** private beta can be supported without improvising every failure path.

### Milestone 7 — Design-partner/customer validation

**Owner:** Jonah with Naomi/Luca

- [ ] Recruit 3–5 friendly design partners before paid self-serve.
- [ ] Run 8–12 discovery calls across Canadian defence SMBs, primes/supplier managers, and procurement-adjacent advisors.
- [ ] Validate ICP: company size, CPCSC urgency, current workaround, buyer pressure, budget owner, bid trigger.
- [ ] Manually test Starter/Growth pricing against urgency and willingness to pay.
- [ ] Maintain an objection log and feature/proof request log.

**Exit gate:** outreach and pricing are based on real buyer signals, not internal conviction.

### Milestone 8 — Guided beta launch assets

**Owner:** Luca/Naomi with Camila/June

- [ ] Demo script: supplier has bid deadline → maps 13 controls → assigns owners/evidence → exports readiness package.
- [ ] One-page buyer/procurement brief.
- [ ] Screenshot walkthrough.
- [ ] Evidence checklist/template library.
- [ ] Beta onboarding email.
- [ ] Conservative launch landing copy.
- [ ] Social/content rhythm for learning in public without overclaiming.

**Exit gate:** guided beta outreach has enough proof assets to create trust without overpromising.

## Validation gates before private testers

- `npm run build` passes
- `npm run lint` passes
- official CPCSC ID/name display verified in controls, dashboard, evidence, reports, and PDF export
- external tester script passes in test-mode Supabase/Stripe
- signup → checkout → dashboard unlock path verified
- billing portal verified with test customer
- admin console access denied/allowed behavior verified
- evidence register create/edit/archive verified
- report PDF generated and reviewed
- support/contact path verified
- schema and security docs match actual Supabase project

## Do not do yet

- Do not launch broad paid self-serve.
- Do not imply certification, government endorsement, audit acceptance, or contract eligibility guarantees.
- Do not sell Storage-backed evidence vaulting until Storage/RLS/retention/audit posture exists.
- Do not sell enterprise/Scale-only features as live until implemented or explicitly scoped as custom/guided.
- Do not rely on subagent file-level findings unless their verified cwd is `/home/mike/repos/cpcsc-compliance-saas`.

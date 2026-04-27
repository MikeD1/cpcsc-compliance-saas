# Supabase Schema Notes

This document captures the tables and columns the app currently assumes. It is not a generated migration; use it as the source checklist when creating Supabase migrations or reviewing an existing project.

## organizations

Used for workspace identity, plan, and subscription gate state.

Required columns used by app code:

- `id`
- `name`
- `slug`
- `created_by`
- `primary_contact_user_id`
- `plan_code`
- `subscription_status`
- `compliance_framework`
- `created_at`

Future organization settings columns needed before wiring more P1 settings:

- `canada_buys_id`
- `primary_contact_name`
- `primary_contact_email`
- `primary_contact_phone`
- `readiness_scope`
- `systems_in_scope`

## profiles

Used to display users and ownership.

Required columns:

- `user_id`
- `email`
- `full_name`
- `default_organization_id`

## organization_memberships

Used for org access, role/status display, and control ownership.

Required columns:

- `id`
- `organization_id`
- `user_id`
- `role`
- `status`
- `joined_at`
- `created_at`

Recommended constraints:

- `organization_id` references `organizations.id`
- `user_id` references auth users / profiles user id strategy
- `status` constrained to known lifecycle values such as `active`, `invited`, `disabled`

## subscriptions

Used for billing reconciliation and subscription state tracking.

Required columns:

- `id`
- `organization_id`
- `stripe_subscription_id`
- `stripe_price_id`
- `plan_code`
- `status`
- `current_period_start`
- `current_period_end`
- `cancel_at_period_end`
- `created_at`

Recommended constraint:

- unique `stripe_subscription_id` for webhook/reconcile upserts

## billing_customers

Used for checkout, reconcile, and Stripe customer portal.

Required columns:

- `organization_id`
- `stripe_customer_id`
- `billing_email`

Recommended constraint:

- unique `organization_id`

## controls

Used for the 13 CPCSC Level 1 control instances.

Required columns:

- `id`
- `organization_id`
- `control_key`
- `official_number`
- `family`
- `title`
- `summary`
- `priority`
- `status`
- `implementation_prompt`
- `guidance`
- `owner_membership_id`
- `reviewed_at`

Future workflow columns needed before deeper review/activity features:

- `review_cadence`
- `next_review_at`
- `reviewed_by_membership_id`
- `review_requested_at`

## evidence_items

Current model is register-only metadata, not file storage.

Required columns:

- `id`
- `organization_id`
- `control_id`
- `file_name`
- `storage_path`
- `evidence_type`
- `source`
- `status`
- `uploaded_by`
- `created_at`

Future evidence columns/tables needed before file upload:

- Supabase Storage bucket and path conventions
- `mime_type`
- `file_size`
- `review_status`
- `notes`
- retention/delete policy fields
- audit/activity events

## Missing tables for future P1/P2

- `control_activity_events` for status/owner/evidence/review audit trail
- `control_comments` for discussion and review notes
- `admin_support_notes` for support console annotations
- `stripe_webhook_events` for idempotent webhook processing

## RLS / authorization note

The current app uses server-side Supabase service-role access and enforces authorization in route code. If client-side Supabase data access expands, add RLS policies before exposing tables to the browser.

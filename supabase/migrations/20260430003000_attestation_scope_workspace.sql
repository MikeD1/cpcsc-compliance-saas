-- CPCSC Level 1 attestation, scope inventory, and rules workspace fields.
-- Safe additive migration; UI can read nulls until production DB is upgraded.

alter table public.organizations
  add column if not exists attestation_cycle_started_at date,
  add column if not exists attestation_completed_at date,
  add column if not exists attestation_expires_at date,
  add column if not exists si_information_inventory text,
  add column if not exists si_storage_locations text,
  add column if not exists si_people_access text,
  add column if not exists si_cloud_services text,
  add column if not exists short_security_rules text;

create index if not exists organizations_attestation_expiry_idx
  on public.organizations(attestation_expires_at);

-- Launch-readiness schema extensions after onboarding, invite email delivery, and member lifecycle work.
-- Safe to run after the production foundation migration.

alter table public.organizations
  add column if not exists canada_buys_id text,
  add column if not exists primary_contact_name text,
  add column if not exists primary_contact_email text,
  add column if not exists primary_contact_phone text,
  add column if not exists readiness_scope text,
  add column if not exists systems_in_scope text;

alter table public.organization_memberships
  add column if not exists disabled_at timestamptz,
  add column if not exists disabled_by_membership_id uuid references public.organization_memberships(id) on delete set null,
  add column if not exists role_updated_at timestamptz,
  add column if not exists role_updated_by_membership_id uuid references public.organization_memberships(id) on delete set null;

alter table public.organization_invitations
  add column if not exists delivery_status text not null default 'manual' check (delivery_status in ('manual', 'not_configured', 'sent', 'failed')),
  add column if not exists delivery_provider text,
  add column if not exists provider_message_id text,
  add column if not exists last_delivery_error text,
  add column if not exists last_sent_at timestamptz;

-- Replace the broad organization/email/status uniqueness rule with the launch behavior we actually need:
-- only one pending invitation per email per organization, while allowing historical accepted/revoked/expired records.
alter table public.organization_invitations
  drop constraint if exists organization_invitations_organization_id_email_status_key;

create unique index if not exists organization_invitations_one_pending_email_idx
  on public.organization_invitations (organization_id, lower(email))
  where status = 'pending';

create index if not exists organization_invitations_delivery_status_idx
  on public.organization_invitations(organization_id, delivery_status);

create index if not exists organization_memberships_disabled_idx
  on public.organization_memberships(organization_id, status, disabled_at);

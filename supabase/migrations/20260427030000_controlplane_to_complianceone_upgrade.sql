-- Compatibility upgrade for Supabase projects that already applied the original ControlPlane schema.
-- Run this INSTEAD OF the foundation migration on databases where the old ControlPlane tables already exist.
-- Then run 20260427025000_launch_schema_extensions.sql.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Align organizations with current app expectations while preserving old columns.
alter table public.organizations
  alter column created_by drop not null,
  alter column plan_code set default 'start',
  alter column subscription_status set default 'incomplete',
  alter column compliance_framework set default 'cpcsc_level_1';

-- Align membership role/status lifecycle with current app.
alter table public.organization_memberships
  drop constraint if exists organization_memberships_role_check,
  drop constraint if exists organization_memberships_status_check;

update public.organization_memberships
set role = case
  when role in ('owner', 'admin') then role
  else 'member'
end
where role not in ('owner', 'admin', 'member');

update public.organization_memberships
set status = case
  when status = 'suspended' then 'disabled'
  when status in ('active', 'invited') then status
  else 'active'
end
where status not in ('active', 'invited', 'disabled');

alter table public.organization_memberships
  alter column role set default 'member',
  add constraint organization_memberships_role_check check (role in ('owner', 'admin', 'member')),
  add constraint organization_memberships_status_check check (status in ('active', 'invited', 'disabled'));

-- Align controls with current app. The old schema already has most columns.
alter table public.controls
  drop constraint if exists controls_status_check,
  alter column summary drop not null;

update public.controls
set status = 'needs-review'
where status = 'gap';

alter table public.controls
  add constraint controls_status_check check (status in ('not-started', 'in-progress', 'needs-review', 'implemented'));

create unique index if not exists controls_org_official_number_idx
  on public.controls(organization_id, official_number);

-- Align evidence register model with current app. Preserve old storage metadata columns.
alter table public.evidence_items
  alter column control_id set not null,
  alter column source set default 'manual',
  drop constraint if exists evidence_items_status_check;

update public.evidence_items
set status = case
  when status in ('draft', 'ready-for-review', 'approved', 'stale') then 'needs-review'
  when status in ('active', 'archived') then status
  else 'active'
end
where status not in ('active', 'archived', 'needs-review');

alter table public.evidence_items
  add constraint evidence_items_status_check check (status in ('active', 'archived', 'needs-review'));

-- Align subscriptions with current webhook/reconcile behavior.
alter table public.subscriptions
  alter column stripe_subscription_id drop not null,
  alter column plan_code set default 'start',
  alter column status set default 'incomplete';

-- Current invitation, audit/comment, support, and webhook idempotency tables.
create table if not exists public.organization_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  token_hash text not null unique,
  invited_by_membership_id uuid references public.organization_memberships(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked', 'expired')),
  expires_at timestamptz not null default (now() + interval '14 days'),
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.control_activity_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  control_id uuid references public.controls(id) on delete cascade,
  actor_membership_id uuid references public.organization_memberships(id) on delete set null,
  event_type text not null,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.control_comments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  control_id uuid not null references public.controls(id) on delete cascade,
  author_membership_id uuid references public.organization_memberships(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_support_notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  author_user_id uuid references auth.users(id) on delete set null,
  note text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.stripe_webhook_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  event_type text not null,
  livemode boolean not null default false,
  event_created_at timestamptz,
  status text not null default 'processing' check (status in ('processing', 'processed', 'failed')),
  processed_at timestamptz,
  last_error text,
  payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes used by the current app/runbooks.
create index if not exists organization_memberships_user_idx on public.organization_memberships(user_id);
create index if not exists organization_memberships_org_status_idx on public.organization_memberships(organization_id, status);
create index if not exists organization_invitations_org_status_idx on public.organization_invitations(organization_id, status);
create index if not exists controls_org_status_idx on public.controls(organization_id, status);
create index if not exists evidence_items_org_control_idx on public.evidence_items(organization_id, control_id);
create index if not exists control_activity_events_org_control_idx on public.control_activity_events(organization_id, control_id);
create index if not exists control_comments_org_control_idx on public.control_comments(organization_id, control_id);
create index if not exists subscriptions_org_idx on public.subscriptions(organization_id);

-- Add missing updated_at triggers with names used by the current migration line. Old trigger names can coexist safely.
drop trigger if exists organization_invitations_set_updated_at on public.organization_invitations;
create trigger organization_invitations_set_updated_at before update on public.organization_invitations for each row execute function public.set_updated_at();

drop trigger if exists control_comments_set_updated_at on public.control_comments;
create trigger control_comments_set_updated_at before update on public.control_comments for each row execute function public.set_updated_at();

drop trigger if exists stripe_webhook_events_set_updated_at on public.stripe_webhook_events;
create trigger stripe_webhook_events_set_updated_at before update on public.stripe_webhook_events for each row execute function public.set_updated_at();

-- Current helper functions. Keep old is_org_member too, but add current names.
create or replace function public.is_active_org_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.organization_memberships om
    where om.organization_id = target_organization_id
      and om.user_id = auth.uid()
      and om.status = 'active'
  );
$$;

create or replace function public.is_org_admin(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.organization_memberships om
    where om.organization_id = target_organization_id
      and om.user_id = auth.uid()
      and om.status = 'active'
      and om.role in ('owner', 'admin')
  );
$$;

alter table public.organization_invitations enable row level security;
alter table public.control_activity_events enable row level security;
alter table public.control_comments enable row level security;
alter table public.admin_support_notes enable row level security;
alter table public.stripe_webhook_events enable row level security;

-- Drop old policy names that would collide with the current baseline, then recreate current policy set.
drop policy if exists "members can read organizations" on public.organizations;
drop policy if exists "owners and admins can update organizations" on public.organizations;
drop policy if exists "users can read their profile" on public.profiles;
drop policy if exists "users can update their profile" on public.profiles;
drop policy if exists "members can read memberships" on public.organization_memberships;
drop policy if exists "members can read controls" on public.controls;
drop policy if exists "members can update controls" on public.controls;
drop policy if exists "members can read evidence" on public.evidence_items;
drop policy if exists "members can manage evidence" on public.evidence_items;
drop policy if exists "members can read notes" on public.control_notes;
drop policy if exists "members can manage notes" on public.control_notes;
drop policy if exists "members can read activity" on public.activity_history;
drop policy if exists "members can read billing customers" on public.billing_customers;
drop policy if exists "members can read subscriptions" on public.subscriptions;

drop policy if exists "admins can update organizations" on public.organizations;
drop policy if exists "users can create organizations for themselves" on public.organizations;
drop policy if exists "users can read own profile" on public.profiles;
drop policy if exists "users can update own profile" on public.profiles;
drop policy if exists "users can create own profile" on public.profiles;
drop policy if exists "members can read org memberships" on public.organization_memberships;
drop policy if exists "admins can manage org memberships" on public.organization_memberships;
drop policy if exists "admins can manage invitations" on public.organization_invitations;
drop policy if exists "members can update evidence" on public.evidence_items;
drop policy if exists "members can insert evidence" on public.evidence_items;
drop policy if exists "members can read activity" on public.control_activity_events;
drop policy if exists "members can insert activity" on public.control_activity_events;
drop policy if exists "members can read comments" on public.control_comments;
drop policy if exists "members can insert comments" on public.control_comments;
drop policy if exists "comment authors can update comments" on public.control_comments;

create policy "members can read organizations" on public.organizations for select using (public.is_active_org_member(id));
create policy "admins can update organizations" on public.organizations for update using (public.is_org_admin(id)) with check (public.is_org_admin(id));
create policy "users can create organizations for themselves" on public.organizations for insert with check (created_by = auth.uid());

create policy "users can read own profile" on public.profiles for select using (user_id = auth.uid());
create policy "users can update own profile" on public.profiles for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users can create own profile" on public.profiles for insert with check (user_id = auth.uid());

create policy "members can read org memberships" on public.organization_memberships for select using (user_id = auth.uid() or public.is_active_org_member(organization_id));
create policy "admins can manage org memberships" on public.organization_memberships for all using (public.is_org_admin(organization_id)) with check (public.is_org_admin(organization_id));

create policy "admins can manage invitations" on public.organization_invitations for all using (public.is_org_admin(organization_id)) with check (public.is_org_admin(organization_id));

create policy "members can read subscriptions" on public.subscriptions for select using (public.is_active_org_member(organization_id));
create policy "members can read billing customers" on public.billing_customers for select using (public.is_active_org_member(organization_id));

create policy "members can read controls" on public.controls for select using (public.is_active_org_member(organization_id));
create policy "members can update controls" on public.controls for update using (public.is_active_org_member(organization_id)) with check (public.is_active_org_member(organization_id));
create policy "admins can insert controls" on public.controls for insert with check (public.is_org_admin(organization_id));

create policy "members can read evidence" on public.evidence_items for select using (public.is_active_org_member(organization_id));
create policy "members can insert evidence" on public.evidence_items for insert with check (public.is_active_org_member(organization_id));
create policy "members can update evidence" on public.evidence_items for update using (public.is_active_org_member(organization_id)) with check (public.is_active_org_member(organization_id));

create policy "members can read activity" on public.control_activity_events for select using (public.is_active_org_member(organization_id));
create policy "members can insert activity" on public.control_activity_events for insert with check (public.is_active_org_member(organization_id));

create policy "members can read comments" on public.control_comments for select using (public.is_active_org_member(organization_id));
create policy "members can insert comments" on public.control_comments for insert with check (public.is_active_org_member(organization_id));
create policy "comment authors can update comments" on public.control_comments for update using (public.is_active_org_member(organization_id)) with check (public.is_active_org_member(organization_id));

-- Keep legacy control_notes and activity_history locked to active members for compatibility if existing app data remains there.
create policy "members can read notes" on public.control_notes for select using (public.is_active_org_member(organization_id));
create policy "members can manage notes" on public.control_notes for all using (public.is_active_org_member(organization_id)) with check (public.is_active_org_member(organization_id));
create policy "members can read activity" on public.activity_history for select using (public.is_active_org_member(organization_id));

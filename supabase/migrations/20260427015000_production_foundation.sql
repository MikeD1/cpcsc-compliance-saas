-- Production foundation schema for ComplianceOne.
-- Apply to Supabase before enabling private beta data entry.

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

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_by uuid references auth.users(id) on delete set null,
  primary_contact_user_id uuid references auth.users(id) on delete set null,
  plan_code text not null default 'start',
  subscription_status text not null default 'incomplete',
  compliance_framework text not null default 'CPCSC_LEVEL_1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  default_organization_id uuid references public.organizations(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  status text not null default 'active' check (status in ('active', 'invited', 'disabled')),
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

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
  updated_at timestamptz not null default now(),
  unique (organization_id, email, status) deferrable initially immediate
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  stripe_subscription_id text unique,
  stripe_price_id text,
  plan_code text not null default 'start',
  status text not null default 'incomplete',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.billing_customers (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  stripe_customer_id text not null unique,
  billing_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.controls (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  control_key text not null,
  official_number integer not null,
  family text not null,
  title text not null,
  summary text,
  priority text not null default 'Medium',
  status text not null default 'not-started' check (status in ('not-started', 'in-progress', 'needs-review', 'implemented')),
  implementation_prompt text,
  guidance jsonb not null default '{}'::jsonb,
  owner_membership_id uuid references public.organization_memberships(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, control_key),
  unique (organization_id, official_number)
);

create table if not exists public.evidence_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  control_id uuid not null references public.controls(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  evidence_type text,
  source text not null default 'manual',
  status text not null default 'active' check (status in ('active', 'archived', 'needs-review')),
  uploaded_by uuid references auth.users(id) on delete set null,
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

create index if not exists organization_memberships_user_idx on public.organization_memberships(user_id);
create index if not exists organization_memberships_org_status_idx on public.organization_memberships(organization_id, status);
create index if not exists organization_invitations_org_status_idx on public.organization_invitations(organization_id, status);
create index if not exists controls_org_status_idx on public.controls(organization_id, status);
create index if not exists evidence_items_org_control_idx on public.evidence_items(organization_id, control_id);
create index if not exists control_activity_events_org_control_idx on public.control_activity_events(organization_id, control_id);
create index if not exists control_comments_org_control_idx on public.control_comments(organization_id, control_id);
create index if not exists subscriptions_org_idx on public.subscriptions(organization_id);

create trigger organizations_set_updated_at before update on public.organizations for each row execute function public.set_updated_at();
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger organization_memberships_set_updated_at before update on public.organization_memberships for each row execute function public.set_updated_at();
create trigger organization_invitations_set_updated_at before update on public.organization_invitations for each row execute function public.set_updated_at();
create trigger subscriptions_set_updated_at before update on public.subscriptions for each row execute function public.set_updated_at();
create trigger billing_customers_set_updated_at before update on public.billing_customers for each row execute function public.set_updated_at();
create trigger controls_set_updated_at before update on public.controls for each row execute function public.set_updated_at();
create trigger evidence_items_set_updated_at before update on public.evidence_items for each row execute function public.set_updated_at();
create trigger control_comments_set_updated_at before update on public.control_comments for each row execute function public.set_updated_at();
create trigger stripe_webhook_events_set_updated_at before update on public.stripe_webhook_events for each row execute function public.set_updated_at();

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

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.organization_invitations enable row level security;
alter table public.subscriptions enable row level security;
alter table public.billing_customers enable row level security;
alter table public.controls enable row level security;
alter table public.evidence_items enable row level security;
alter table public.control_activity_events enable row level security;
alter table public.control_comments enable row level security;
alter table public.admin_support_notes enable row level security;
alter table public.stripe_webhook_events enable row level security;

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

-- Admin support notes and Stripe webhook events intentionally have no browser-access policies.
-- They are service-role only until audited support workflows are implemented.

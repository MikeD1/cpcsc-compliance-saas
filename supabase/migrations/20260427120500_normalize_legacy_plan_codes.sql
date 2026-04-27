-- Normalize legacy ControlPlane plan codes to current ComplianceOne slugs.
-- This prevents existing incomplete workspaces from looping between activation and pricing.

update public.organizations
set plan_code = 'start'
where plan_code = 'starter';

update public.subscriptions
set plan_code = 'start'
where plan_code = 'starter';

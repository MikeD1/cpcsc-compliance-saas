import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { SubscriptionGate } from "@/components/auth/subscription-gate";
import { OrganizationSettingsForm } from "@/components/settings/organization-settings-form";
import { BillingSettingsCard } from "@/components/settings/billing-settings-card";
import { SettingsSectionNav } from "@/components/settings/settings-section-nav";
import { MemberList } from "@/components/team/member-list";
import { TeamInvitations } from "@/components/team/team-invitations";
import { getCurrentAccess } from "@/lib/access";
import { getDashboardData } from "@/lib/dashboard";
import { getOrganizationInvitations } from "@/lib/invitations";
import { canInviteMembers, canManageMemberLifecycle } from "@/lib/permissions";

export default async function SettingsPage() {
  const access = await getCurrentAccess();

  if (!access.user) {
    redirect("/login");
  }

  if (!access.hasActiveSubscription) {
    return (
      <AppShell organizationName={access.user.organization?.name}>
        <SubscriptionGate plan={access.latestSubscription?.planSlug} status={access.latestSubscription?.status} organizationId={access.user.organization?.id} />
      </AppShell>
    );
  }

  const { organization, members } = await getDashboardData();
  const invitations = canInviteMembers(access.user) ? await getOrganizationInvitations(organization.id) : [];

  return (
    <AppShell organizationName={organization.name}>
      <section className="rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] lg:p-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Settings</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950 lg:text-5xl">Organization and team settings</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
          Manage the schema-backed organization profile and see which members can be assigned to CPCSC controls.
        </p>
      </section>

      <SettingsSectionNav />

      <OrganizationSettingsForm
        organizationName={organization.name}
        primaryContactName={organization.primaryContact ?? ""}
        primaryContactEmail={organization.primaryEmail}
      />

      <BillingSettingsCard plan={access.latestSubscription?.planSlug} status={access.latestSubscription?.status} />

      <MemberList members={members} canManageMembers={canManageMemberLifecycle(access.user)} />

      <TeamInvitations canInvite={canInviteMembers(access.user)} initialInvitations={invitations} />
    </AppShell>
  );
}

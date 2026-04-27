import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";
import { WorkspaceSetupForm } from "@/components/auth/workspace-setup-form";
import { PublicShell } from "@/components/marketing/public-shell";
import { getCurrentAccess } from "@/lib/access";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const params = await searchParams;
  const initialPlan = params.plan === "growth" ? "growth" : "start";
  const access = await getCurrentAccess();

  if (access.user) {
    if (access.hasActiveSubscription) {
      redirect("/dashboard");
    }

    const organizationId = access.user.organization?.id ?? access.user.organizationMembership?.organizationId;
    if (organizationId) {
      redirect(`/api/billing/checkout-link?plan=${initialPlan}&organizationId=${organizationId}`);
    }

    return (
      <PublicShell>
        <AuthCard
          title="Finish your ComplianceOne workspace"
          description="Your account exists, but no workspace is attached yet. Create the workspace for this signed-in account, then continue to Stripe checkout."
        >
          <WorkspaceSetupForm
            email={access.user.email ?? ""}
            initialPlan={initialPlan}
            firstName={access.user.firstName}
            lastName={access.user.lastName}
          />
        </AuthCard>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <AuthCard
        title="Create your CPCSC readiness workspace"
        description="Set up your organization account first. After signup, you will continue to Stripe checkout; once billing is active, your protected readiness workspace opens automatically."
      >
        <SignupForm initialPlan={initialPlan} />

        <p className="mt-6 text-sm text-slate-500">
          Already have an account? <Link href="/login" className="font-medium text-cyan-700 hover:text-cyan-800">Log in</Link>
        </p>
      </AuthCard>
    </PublicShell>
  );
}

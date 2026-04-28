import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { SubscriptionGate } from "@/components/auth/subscription-gate";
import { ControlsWorkspace } from "@/components/controls/controls-workspace";
import { getCurrentAccess } from "@/lib/access";
import { getDashboardData } from "@/lib/dashboard";

export default async function ControlsPage({
  searchParams,
}: {
  searchParams: Promise<{ billing?: string; plan?: string }>;
}) {
  const access = await getCurrentAccess();
  const params = await searchParams;

  if (!access.user) {
    redirect("/login");
  }

  if (!access.hasActiveSubscription) {
    return (
      <AppShell organizationName={access.user.organization?.name}>
        <SubscriptionGate
          plan={params.plan ?? access.latestSubscription?.planSlug}
          status={access.latestSubscription?.status}
          organizationId={access.user.organization?.id ?? access.user.organizationMembership?.organizationId}
          billingIssue={params.billing}
        />
      </AppShell>
    );
  }

  const { controlCards, members } = await getDashboardData();

  return (
    <AppShell organizationName={access.user.organization?.name}>
      <section className="rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Control workspace</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950 lg:text-5xl">Manage the 13 CPCSC Level 1 controls</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
              Update implementation notes, assign an owner, set review expectations, and track progress control by control as your readiness work matures.
            </p>
          </div>
        </div>
      </section>

      <ControlsWorkspace
        members={members}
        controls={controlCards.map((control) => ({
          id: control.response?.id ?? String(control.id),
          displayId: control.officialId,
          title: control.title,
          category: control.category,
          objective: control.objective,
          whatToDo: control.whatToDo,
          exampleImplementation: control.exampleImplementation,
          evidenceExamples: control.evidenceExamples,
          readinessGuidance: control.readinessGuidance,
          response: control.response
            ? {
                status: control.response.status as "NOT_STARTED" | "IN_PROGRESS" | "READY_FOR_REVIEW" | "COMPLETE",
                implementationDetails: control.response.implementationDetails,
                owner: control.response.owner,
                ownerMembershipId: control.response.ownerMembershipId,
                reviewCadence: control.response.reviewCadence,
                reviewedAt: control.response.reviewedAt,
                evidenceItems: control.response.evidenceItems,
              }
            : null,
        }))}
      />
    </AppShell>
  );
}

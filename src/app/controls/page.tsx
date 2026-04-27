import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { SubscriptionGate } from "@/components/auth/subscription-gate";
import { ControlEditor } from "@/components/controls/control-editor";
import { getCurrentAccess } from "@/lib/access";
import { getDashboardData } from "@/lib/dashboard";

export default async function ControlsPage() {
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

      <section className="grid gap-6">
        {controlCards.map((control) => (
          <ControlEditor
            key={control.response?.id ?? control.id}
            members={members}
            control={{
              id: control.response?.id ?? String(control.id),
              displayId: control.id,
              title: control.title,
              category: control.category,
              objective: control.objective,
              whatToDo: control.whatToDo,
              response: control.response
                ? {
                    status: control.response.status as "NOT_STARTED" | "IN_PROGRESS" | "READY_FOR_REVIEW" | "COMPLETE",
                    implementationDetails: control.response.implementationDetails,
                    owner: control.response.owner,
                    ownerMembershipId: control.response.ownerMembershipId,
                    reviewCadence: control.response.reviewCadence,
                    evidenceItems: control.response.evidenceItems,
                  }
                : null,
            }}
          />
        ))}
      </section>
    </AppShell>
  );
}

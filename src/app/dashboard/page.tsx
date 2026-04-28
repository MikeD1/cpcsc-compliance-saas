import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { SubscriptionGate } from "@/components/auth/subscription-gate";
import { FirstRunChecklist } from "@/components/onboarding/first-run-checklist";
import { getCurrentAccess } from "@/lib/access";
import { syncCheckoutSessionForOrganization } from "@/lib/billing-sync";
import { getDashboardData } from "@/lib/dashboard";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ billing?: string; checkout?: string; plan?: string; session_id?: string }>;
}) {
  const access = await getCurrentAccess();
  const params = await searchParams;

  if (!access.user) {
    redirect("/login");
  }

  if (!access.hasActiveSubscription && params.checkout === "success" && params.session_id) {
    const organizationId = access.user.organization?.id ?? access.user.organizationMembership?.organizationId;

    if (organizationId) {
      try {
        const syncResult = await syncCheckoutSessionForOrganization({ checkoutSessionId: params.session_id, organizationId });

        if (syncResult.status === "active" || syncResult.status === "trialing") {
          redirect("/dashboard?checkout=activated");
        }
      } catch (error) {
        console.error("Checkout success sync failed", error);
      }
    }
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

  const { organization, assessment, controlCards, statusCounts, actionSummary, priorityActions, readinessDiagnosis, members } = await getDashboardData();

  return (
    <AppShell organizationName={access.user.organization?.name}>
      <section className="grid gap-6 2xl:grid-cols-[1.12fr_0.88fr]">
        <div className="rounded-[2rem] border border-white/50 bg-white/92 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Command center</p>
          <div className="mt-3 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 lg:text-5xl">
                {organization.legalName ?? organization.name}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">{assessment.scopeSummary}</p>
            </div>
            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-4 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Assessment</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{assessment.title}</p>
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-5">
            <Kpi title="Ready" value={`${actionSummary.readinessPercent}%`} tone="emerald" />
            <Kpi title="Complete" value={String(statusCounts.complete)} tone="emerald" />
            <Kpi title="Review" value={String(statusCounts.review)} tone="sky" />
            <Kpi title="In progress" value={String(statusCounts.inProgress)} tone="amber" />
            <Kpi title="Not started" value={String(statusCounts.notStarted)} tone="slate" />
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#0a1222_0%,#0f1d36_100%)] p-8 text-white shadow-[0_30px_90px_rgba(15,23,42,0.25)]">
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-300">Account metadata</p>
          <dl className="mt-6 grid gap-5 text-sm">
            <MetaRow label="Assessment title" value={assessment.title} />
            <MetaRow label="Workspace status" value={assessment.riskStatement ?? "Not provided"} />
            <MetaRow label="CanadaBuys" value={organization.canadaBuysId ?? "Pending"} />
            <MetaRow label="Primary contact" value={organization.primaryContact ?? "Unassigned"} />
            <MetaRow label="Contact email" value={organization.primaryEmail ?? "Not set"} />
          </dl>
        </div>
      </section>

      <FirstRunChecklist
        organizationName={organization.name}
        memberCount={members.length}
        unassignedControls={actionSummary.unassigned}
        missingEvidence={actionSummary.missingEvidence}
        reviewedControls={actionSummary.reviewed}
      />

      <section className="rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Readiness diagnosis</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{readinessDiagnosis.confidenceLevel} confidence</h2>
            <p className="mt-3 max-w-3xl text-base leading-8 text-slate-700">{readinessDiagnosis.headline}</p>
          </div>
          <Link href="/reports" className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
            Export buyer report
          </Link>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-sm font-semibold text-slate-950">Why this diagnosis</h3>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-700 sm:grid-cols-2">
              {readinessDiagnosis.why.map((reason) => (
                <li key={reason} className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3">{reason}</li>
              ))}
            </ul>
            <p className="mt-4 rounded-[1rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
              <span className="font-semibold">Strongest area:</span> {readinessDiagnosis.strongestArea}
            </p>
          </div>

          <div className="rounded-[1.6rem] border border-amber-200 bg-amber-50 p-5">
            <h3 className="text-sm font-semibold text-amber-950">Riskiest buyer-conversation gaps</h3>
            <div className="mt-4 grid gap-3">
              {readinessDiagnosis.riskiestGaps.length === 0 ? (
                <p className="rounded-[1rem] border border-emerald-200 bg-white px-4 py-3 text-sm leading-6 text-emerald-800">No obvious high-risk gaps from the current workspace data.</p>
              ) : null}
              {readinessDiagnosis.riskiestGaps.map((gap) => (
                <div key={`${gap.officialId}-${gap.title}`} className="rounded-[1rem] border border-amber-200 bg-white px-4 py-3">
                  <p className="text-sm font-semibold text-slate-950">{gap.officialId}: {gap.title}</p>
                  <p className="mt-1 text-sm leading-6 text-amber-900">{gap.reason}</p>
                </div>
              ))}
            </div>
            {readinessDiagnosis.evidenceQualityWarnings.length > 0 ? (
              <p className="mt-4 text-sm leading-6 text-amber-950">
                Evidence quality check: completed controls still worth reviewing — {readinessDiagnosis.evidenceQualityWarnings.join(", ")}.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Next best actions</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">What to do next</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              A prioritized queue based on ownership, evidence coverage, and review status. Clear these first to move the readiness score instead of hunting through every control.
            </p>
          </div>
          <Link href="/reports" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition hover:border-cyan-200 hover:text-cyan-800">
            View report
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <NextStep title="Assign owners" description={`${actionSummary.unassigned} controls are unassigned.`} tone="amber" href="/controls#assign-owners" />
          <NextStep title="Add evidence" description={`${actionSummary.missingEvidence} controls have no evidence records.`} tone="sky" href="/evidence#add-evidence" />
          <NextStep title="Review queue" description={`${actionSummary.readyForReview} controls are ready for review.`} tone="emerald" href="/controls" />
          <NextStep title="Reviewed" description={`${actionSummary.reviewed} controls have a review date recorded.`} tone="slate" href="/reports" />
        </div>

        <div className="mt-7 grid gap-4">
          {priorityActions.length === 0 ? (
            <div className="rounded-[1.6rem] border border-emerald-200 bg-emerald-50 p-5 text-sm leading-7 text-emerald-800">
              No priority actions right now. Export the readiness report or start a deeper review pass.
            </div>
          ) : null}
          {priorityActions.map((action, index) => (
            <article key={`${action.actionType}-${action.controlId}`} className="rounded-[1.6rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">#{index + 1}</span>
                    <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">{action.actionType}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{action.priority}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{action.category}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-slate-950">
                    {action.officialId}: {action.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{action.reason}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-800"><span className="font-semibold">Next:</span> {action.nextStep}</p>
                </div>
                <div className="grid shrink-0 gap-3 text-sm lg:w-64">
                  <div className="rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Owner</p>
                    <p className="mt-1 font-medium text-slate-950">{action.owner}</p>
                  </div>
                  <Link href={action.href} className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
                    Open task
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Control portfolio</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">All controls at a glance</h2>
          </div>
        </div>
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {controlCards.map((control) => (
            <article key={control.id} className="rounded-[1.7rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{control.category}</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-950">
                    {control.officialId}: {control.title}
                  </h3>
                </div>
                {control.response ? <StatusBadge status={control.response.status} /> : null}
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600">{control.objective}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoCard label="Owner" value={control.response?.owner ?? "Unassigned"} />
                <InfoCard label="Evidence items" value={String(control.response?.evidenceItems.length ?? 0)} />
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function Kpi({ title, value, tone }: { title: string; value: string; tone: "emerald" | "sky" | "amber" | "slate" }) {
  const tones = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    sky: "border-sky-200 bg-sky-50 text-sky-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    slate: "border-slate-200 bg-slate-100 text-slate-700",
  };

  return (
    <div className={`rounded-[1.5rem] border p-4 ${tones[tone]}`}>
      <p className="text-[11px] uppercase tracking-[0.2em]">{title}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function NextStep({
  title,
  description,
  tone,
  href,
}: {
  title: string;
  description: string;
  tone: "emerald" | "sky" | "amber" | "slate";
  href: string;
}) {
  const tones = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
    sky: "border-sky-200 bg-sky-50 text-sky-800",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    slate: "border-slate-200 bg-slate-50 text-slate-800",
  };

  return (
    <Link href={href} className={`rounded-[1.4rem] border p-4 transition hover:-translate-y-0.5 hover:shadow-md ${tones[tone]}`}>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6">{description}</p>
    </Link>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-white/10 pb-4 last:border-0 last:pb-0">
      <dt className="text-slate-400">{label}</dt>
      <dd className="mt-2 font-medium leading-7 text-white">{value}</dd>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

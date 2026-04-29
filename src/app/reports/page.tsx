import { redirect } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { SubscriptionGate } from "@/components/auth/subscription-gate";
import { getCurrentAccess } from "@/lib/access";
import { getDashboardData } from "@/lib/dashboard";

const priorityLabel = (controlId: number) => (controlId <= 4 ? "Critical" : controlId <= 9 ? "High" : "Medium");

const statusLabel = {
  COMPLETE: "Complete",
  READY_FOR_REVIEW: "Ready for review",
  IN_PROGRESS: "In progress",
  NOT_STARTED: "Not started",
} as const;

export default async function ReportsPage() {
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

  const { statusCounts, categorySummaries, actionSummary, recentEvidence, controlCards, priorityActions, readinessDiagnosis, organization } = await getDashboardData();
  const totalControls = controlCards.length;
  const controlsWithEvidence = totalControls - actionSummary.missingEvidence;
  const evidenceCoveragePercent = Math.round((controlsWithEvidence / Math.max(totalControls, 1)) * 100);
  const completionBasis = `${statusCounts.complete} of ${totalControls} controls are marked complete. Controls ready for review, in progress, or not started are not counted as complete.`;
  const priorityGroups = ["Critical", "High", "Medium"].map((priority) => {
    const controls = controlCards.filter((control) => priorityLabel(control.id) === priority);
    const openGaps = controls.filter(
      (control) =>
        control.response?.status !== "COMPLETE" || !control.response?.ownerMembershipId || (control.response?.evidenceItems.length ?? 0) === 0,
    );

    return {
      priority,
      total: controls.length,
      open: openGaps.length,
      controls: openGaps.slice(0, 4),
    };
  });

  const executiveSummary = readinessDiagnosis.headline;

  return (
    <AppShell organizationName={access.user.organization?.name}>
      <section className="grid gap-6 2xl:grid-cols-[1.02fr_0.98fr]">
        <div id="download-report" className="scroll-mt-28 rounded-[2rem] border border-white/50 bg-white/92 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Buyer-proof reporting</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 lg:text-5xl">CPCSC Level 1 readiness packet</h1>
          <p className="mt-4 text-base leading-8 text-slate-600">
            Turn workspace activity into a buyer-facing readiness story: confidence level, why it matters, what proof exists, which gaps are risky, and what should happen next.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/exports/assessment.pdf"
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Export compliance assessment
            </Link>
            <Link
              href="/controls"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-800 transition hover:border-cyan-200 hover:text-cyan-800"
            >
              Work open gaps
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#0a1222_0%,#0f1d36_100%)] p-8 text-white shadow-[0_30px_90px_rgba(15,23,42,0.25)]">
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-300">Executive snapshot</p>
          <h2 className="mt-3 text-2xl font-semibold">{organization.name}</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">{executiveSummary}</p>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <Snapshot label="Confidence" value={readinessDiagnosis.confidenceLevel} />
            <Snapshot label="Readiness" value={`${actionSummary.readinessPercent}%`} />
            <Snapshot label="Evidence coverage" value={`${evidenceCoveragePercent}%`} />
            <Snapshot label="Open gaps" value={String(totalControls - statusCounts.complete)} />
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] lg:p-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Readiness interpretation</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">What a buyer should take away</h2>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-600">{executiveSummary}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Readiness score" value={`${actionSummary.readinessPercent}%`} detail={completionBasis} />
          <SummaryCard label="Owner gaps" value={String(actionSummary.unassigned)} detail="Controls that do not yet have a named accountable owner." />
          <SummaryCard label="Evidence gaps" value={String(actionSummary.missingEvidence)} detail="Controls with no supporting evidence references attached." />
          <SummaryCard label="Review queue" value={String(actionSummary.readyForReview)} detail="Controls ready for a review decision before completion." />
        </div>
        <div className="mt-5 rounded-[1.4rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-7 text-amber-900">
          <span className="font-semibold">Readiness score explanation:</span> The score is the percentage of CPCSC Level 1 controls marked complete in this workspace. The confidence narrative also considers owners, evidence references, and review state. It is a management readiness metric, not a certification, audit opinion, or Government of Canada approval.
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-5 py-4">
            <h3 className="text-sm font-semibold text-slate-950">Assessment basis, not just counts</h3>
            <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
              {readinessDiagnosis.why.map((reason) => (
                <li key={reason}>• {reason}</li>
              ))}
            </ul>
            <p className="mt-3 text-sm leading-6 text-emerald-800"><span className="font-semibold">Strongest area:</span> {readinessDiagnosis.strongestArea}</p>
          </div>
          <div className="rounded-[1.4rem] border border-amber-200 bg-amber-50 px-5 py-4">
            <h3 className="text-sm font-semibold text-amber-950">Riskiest gaps to explain</h3>
            <div className="mt-3 grid gap-2">
              {readinessDiagnosis.riskiestGaps.map((gap) => (
                <p key={`${gap.officialId}-${gap.title}`} className="text-sm leading-6 text-amber-900">
                  <span className="font-semibold">{gap.officialId}: {gap.title}</span> — {gap.reason}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] lg:p-8">
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Gaps by priority</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Focus the buyer conversation</h2>
          <div className="mt-6 grid gap-4">
            {priorityGroups.map((group) => (
              <div key={group.priority} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-slate-950">{group.priority} controls</h3>
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700">{group.open}/{group.total} open</span>
                </div>
                <div className="mt-4 grid gap-2">
                  {group.controls.length === 0 ? <p className="text-sm text-emerald-700">No open gaps in this priority group.</p> : null}
                  {group.controls.map((control) => (
                    <div key={control.id} className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                      <p className="font-semibold text-slate-950">{control.officialId}: {control.title}</p>
                      <p className="mt-1 text-slate-500">
                        {statusLabel[(control.response?.status ?? "NOT_STARTED") as keyof typeof statusLabel]} · {control.response?.owner ?? "Unassigned"} · {(control.response?.evidenceItems.length ?? 0)} evidence
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] lg:p-8">
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Action plan</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Next work to strengthen the buyer story</h2>
          <div className="mt-6 grid gap-3">
            {priorityActions.length === 0 ? <p className="rounded-[1.2rem] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">No priority actions are currently queued. Export the report or start a deeper review pass.</p> : null}
            {priorityActions.map((action, index) => (
              <div key={`${action.actionType}-${action.controlId}`} className="rounded-[1.3rem] border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">#{index + 1}</span>
                  <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">{action.actionType}</span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">{action.priority}</span>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-950">{action.officialId}: {action.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{action.nextStep}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] lg:p-8">
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Evidence coverage</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Proof behind the readiness story</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <SummaryCard label="Coverage" value={`${evidenceCoveragePercent}%`} detail={`${controlsWithEvidence} of ${totalControls} controls have evidence.`} />
            <SummaryCard label="Evidence records" value={String(recentEvidence.length)} detail="Recent evidence records shown in this report preview." />
            <SummaryCard label="Missing" value={String(actionSummary.missingEvidence)} detail="Controls still missing supporting records." />
          </div>
          <div className="mt-5 grid gap-3">
            {recentEvidence.length === 0 ? <p className="rounded-[1.2rem] border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">No evidence records have been added yet.</p> : null}
            {recentEvidence.slice(0, 6).map((item) => (
              <div key={item.id} className="rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <p className="font-medium text-slate-950">{item.title}</p>
                <p className="mt-1 text-slate-500">Control {item.officialId ?? item.controlId} · {item.artifactType}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] lg:p-8">
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Readiness by category</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Domain-level view</h2>
          <div className="mt-6 grid gap-4">
            {categorySummaries.map((summary) => (
              <div key={summary.category} className="rounded-[1.3rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-base font-semibold text-slate-950">{summary.category}</h3>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">{summary.completed}/{summary.total}</span>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">{summary.completed} complete out of {summary.total} controls in this domain.</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function SummaryCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
    </div>
  );
}

function Snapshot({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}

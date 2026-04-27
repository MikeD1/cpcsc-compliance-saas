import { redirect } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { SubscriptionGate } from "@/components/auth/subscription-gate";
import { getCurrentAccess } from "@/lib/access";
import { getDashboardData } from "@/lib/dashboard";

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

  const { assessment, statusCounts, categorySummaries, actionSummary, recentEvidence, controlCards } = await getDashboardData();

  return (
    <AppShell organizationName={access.user.organization?.name}>
      <section className="grid gap-6 2xl:grid-cols-[1.02fr_0.98fr]">
        <div className="rounded-[2rem] border border-white/50 bg-white/92 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Readiness reporting</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 lg:text-5xl">Generate a CPCSC Level 1 readiness report.</h1>
          <p className="mt-4 text-base leading-8 text-slate-600">
            Export a point-in-time report of control status, owners, implementation notes, and evidence references for internal leadership reviews. The report supports readiness conversations but does not guarantee certification or acceptance.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/exports/assessment.pdf"
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Download readiness PDF
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#0a1222_0%,#0f1d36_100%)] p-8 text-white shadow-[0_30px_90px_rgba(15,23,42,0.25)]">
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-300">Assessment snapshot</p>
          <h2 className="mt-3 text-2xl font-semibold">{assessment.title}</h2>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <Snapshot label="Complete" value={String(statusCounts.complete)} />
            <Snapshot label="Review" value={String(statusCounts.review)} />
            <Snapshot label="In progress" value={String(statusCounts.inProgress)} />
            <Snapshot label="Not started" value={String(statusCounts.notStarted)} />
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
        <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Executive summary</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Readiness" value={`${actionSummary.readinessPercent}%`} detail="Controls marked complete" />
          <SummaryCard label="Owner gaps" value={String(actionSummary.unassigned)} detail="Controls without assigned owners" />
          <SummaryCard label="Evidence gaps" value={String(actionSummary.missingEvidence)} detail="Controls without evidence records" />
          <SummaryCard label="Review queue" value={String(actionSummary.readyForReview)} detail="Controls ready for review" />
        </div>
        <p className="mt-5 text-sm leading-7 text-slate-600">
          This report is an internal readiness snapshot. It highlights status, ownership, and evidence coverage; it does not guarantee CPCSC acceptance or replace assessor judgment.
        </p>
      </section>

      <section className="rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
        <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Exceptions and evidence inventory</p>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[1.7rem] border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-lg font-semibold text-slate-950">Open exceptions</h3>
            <div className="mt-4 grid gap-3">
              {controlCards.filter((control) => control.response?.status !== "COMPLETE" || !control.response?.ownerMembershipId || (control.response?.evidenceItems.length ?? 0) === 0).slice(0, 8).map((control) => (
                <div key={control.id} className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                  {control.officialId}: {control.title}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[1.7rem] border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-lg font-semibold text-slate-950">Recent evidence</h3>
            <div className="mt-4 grid gap-3">
              {recentEvidence.length === 0 ? <p className="text-sm text-slate-600">No evidence records have been added yet.</p> : null}
              {recentEvidence.map((item) => (
                <div key={item.id} className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                  <p className="font-medium text-slate-950">{item.title}</p>
                  <p className="mt-1 text-slate-500">Control {item.officialId ?? item.controlId} · {item.artifactType}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
        <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Readiness by category</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categorySummaries.map((summary) => (
            <div key={summary.category} className="rounded-[1.7rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-950">{summary.category}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {summary.completed} complete out of {summary.total} controls in this domain.
              </p>
            </div>
          ))}
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
      <p className="mt-2 text-sm text-slate-600">{detail}</p>
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

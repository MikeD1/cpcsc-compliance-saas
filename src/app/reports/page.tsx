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
      <AppShell>
        <SubscriptionGate plan={access.latestSubscription?.planSlug} status={access.latestSubscription?.status} />
      </AppShell>
    );
  }

  const { assessment, statusCounts, categorySummaries } = await getDashboardData();

  return (
    <AppShell>
      <section className="grid gap-6 2xl:grid-cols-[1.02fr_0.98fr]">
        <div className="rounded-[2rem] border border-white/50 bg-white/92 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Executive reporting</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 lg:text-5xl">Attestation outputs that feel boardroom-ready.</h1>
          <p className="mt-4 text-base leading-8 text-slate-600">
            Reporting is framed as a buyer-quality surface: cleaner, more intentional, and easier to imagine in an executive review or procurement prep flow.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/exports/assessment.pdf"
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Download sample PDF
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
        <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Category report</p>
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

function Snapshot({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}

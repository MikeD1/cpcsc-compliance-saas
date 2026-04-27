import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { SubscriptionGate } from "@/components/auth/subscription-gate";
import { getCurrentAccess } from "@/lib/access";
import { getDashboardData } from "@/lib/dashboard";

export default async function DashboardPage() {
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

  const { organization, assessment, controlCards, statusCounts } = await getDashboardData();

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
          <div className="mt-8 grid gap-4 md:grid-cols-4">
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

      <section className="rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
        <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">First steps</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Start with a practical readiness loop</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <NextStep title="Confirm scope" description="Use the organization metadata as your starting point, then document systems and teams in scope." />
          <NextStep title="Assign owners" description="Pick the first controls that need attention and assign an accountable owner." />
          <NextStep title="Add evidence records" description="Register where supporting documents live for each control." />
          <NextStep title="Export report" description="Generate a readiness PDF after the first round of updates." />
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
                    Control {control.id}: {control.title}
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

function NextStep({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
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

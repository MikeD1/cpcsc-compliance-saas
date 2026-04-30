import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { SubscriptionGate } from "@/components/auth/subscription-gate";
import { getCurrentAccess } from "@/lib/access";
import { syncCheckoutSessionForOrganization } from "@/lib/billing-sync";
import { getDashboardData } from "@/lib/dashboard";
import { workspaceCards } from "@/lib/workspace-content";

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

  const { organization, assessment, statusCounts, actionSummary, priorityActions, readinessDiagnosis, attestationPackage, criteriaCoverage, scopeInventory, evidenceQuality } = await getDashboardData();

  return (
    <AppShell organizationName={access.user.organization?.name}>
      <section className="grid gap-6 2xl:grid-cols-[1.12fr_0.88fr]">
        <div className="rounded-[2rem] border border-white/50 bg-white/92 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">CPCSC readiness workspace</p>
          <div className="mt-3 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 lg:text-5xl">
                {organization.legalName ?? organization.name}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
                A simple self-serve workspace for building your CPCSC Level 1 readiness path: scope SI, implement the 13 controls, collect evidence, and prepare a self-assessment support package.
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-4 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Assessment</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{assessment.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Readiness confidence, owner accountability, and buyer-readable proof.</p>
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
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-300">Readiness snapshot</p>
          <h2 className="mt-3 text-2xl font-semibold">{readinessDiagnosis.confidenceLevel} confidence</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">{readinessDiagnosis.headline}</p>
          <dl className="mt-6 grid gap-4 text-sm">
            <MetaRow label="CanadaBuys" value={organization.canadaBuysId ?? "Pending"} />
            <MetaRow label="Attestation" value={attestationPackage.renewalStatus} />
            <MetaRow label="Criteria coverage" value={`${criteriaCoverage.covered}/${criteriaCoverage.total} criteria`} />
            <MetaRow label="Scope inventory" value={`${scopeInventory.completedFields}/${scopeInventory.totalFields} areas documented`} />
          </dl>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">My Workspace</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Start here and follow the work</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              If you are doing CPCSC Level 1 yourself instead of starting with a consultant, this is the path: build the roadmap, work the controls, use templates, then export the assessment package.
            </p>
          </div>
          <Link href="/roadmap" className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
            Begin Roadmap Development
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {workspaceCards.map((card) => (
            <Link key={card.title} href={card.href} className="group rounded-[1.6rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md">
              <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-700">{card.eyebrow}</p>
              <h3 className="mt-3 text-lg font-semibold text-slate-950 group-hover:text-cyan-800">{card.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{card.description}</p>
              <span className="mt-5 inline-flex text-sm font-semibold text-cyan-700">Open →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] lg:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Next actions</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">What needs attention now</h2>
            </div>
            <Link href="/controls" className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2.5 text-sm font-medium text-cyan-800 transition hover:bg-cyan-100">Open controls</Link>
          </div>
          <div className="mt-5 grid gap-3">
            {priorityActions.length === 0 ? (
              <div className="rounded-[1.4rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-7 text-emerald-800">
                No priority actions right now. Review the roadmap or export the readiness package.
              </div>
            ) : null}
            {priorityActions.slice(0, 4).map((action, index) => (
              <article key={`${action.actionType}-${action.controlId}`} className="rounded-[1.4rem] border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">#{index + 1}</span>
                  <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">{action.actionType}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{action.category}</span>
                </div>
                <h3 className="mt-3 text-base font-semibold text-slate-950">{action.officialId}: {action.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{action.nextStep}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] lg:p-8">
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Package health</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Evidence and readiness signals</h2>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-[1rem] bg-emerald-50 px-3 py-3 text-emerald-800"><strong className="block text-2xl">{evidenceQuality.strong}</strong>strong</div>
            <div className="rounded-[1rem] bg-amber-50 px-3 py-3 text-amber-800"><strong className="block text-2xl">{evidenceQuality.weak}</strong>thin</div>
            <div className="rounded-[1rem] bg-rose-50 px-3 py-3 text-rose-800"><strong className="block text-2xl">{evidenceQuality.missing}</strong>missing</div>
          </div>
          <div className="mt-5 grid gap-2 text-sm leading-6 text-slate-700">
            {attestationPackage.checklist.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3">
                <span>{item.label}</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.complete ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{item.complete ? "Ready" : "Missing"}</span>
              </div>
            ))}
          </div>
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

function MetaRow({ label, value }: { label: string; value: string }) {
  return <div className="border-b border-white/10 pb-4 last:border-0 last:pb-0"><dt className="text-slate-400">{label}</dt><dd className="mt-2 font-medium leading-7 text-white">{value}</dd></div>;
}

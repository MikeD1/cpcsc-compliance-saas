import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { SubscriptionGate } from "@/components/auth/subscription-gate";
import { getCurrentAccess } from "@/lib/access";
import { futureRoadmaps, roadmapSteps } from "@/lib/workspace-content";

export default async function RoadmapPage() {
  const access = await getCurrentAccess();

  if (!access.user) redirect("/login");

  if (!access.hasActiveSubscription) {
    return (
      <AppShell organizationName={access.user.organization?.name}>
        <SubscriptionGate
          plan={access.latestSubscription?.planSlug}
          status={access.latestSubscription?.status}
          organizationId={access.user.organization?.id ?? access.user.organizationMembership?.organizationId}
        />
      </AppShell>
    );
  }

  return (
    <AppShell organizationName={access.user.organization?.name}>
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-white/50 bg-white/92 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Roadmap Development</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 lg:text-5xl">Roadmap to CPCSC Level 1 readiness</h1>
          <p className="mt-5 max-w-4xl text-base leading-8 text-slate-600">
            This is the consultant-style starting point for organizations that want to prepare themselves. Work through scope, controls, evidence, and self-assessment support before using Government of Canada supplier/self-assessment workflows.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/controls" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800">Open controls</Link>
            <Link href="/resources" className="rounded-full border border-cyan-200 bg-cyan-50 px-5 py-3 text-sm font-medium text-cyan-800 transition hover:bg-cyan-100">Open tools and templates</Link>
          </div>
        </div>

        <aside className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#0a1222_0%,#0f1d36_100%)] p-8 text-white shadow-[0_30px_90px_rgba(15,23,42,0.25)]">
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-300">Data sovereignty reminder</p>
          <h2 className="mt-3 text-2xl font-semibold">Keep Canadian jurisdiction in view</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            For higher CPCSC levels and some contract contexts, Specified Information may need to remain under Canadian jurisdiction. Track where SI is stored, which cloud regions are used, and whether services such as Microsoft 365 or AWS are configured for Canadian data residency where required.
          </p>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Personnel screening and Canadian security clearance requirements may also become relevant for Level 2/3 or contract-specific obligations. Keep those as future planning items while completing Level 1.
          </p>
        </aside>
      </section>

      <section className="rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] lg:p-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Level 1 preparation path</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Clear steps toward self-assessment readiness</h2>
          </div>
          <Link href="/reports" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-50">Open reports</Link>
        </div>

        <div className="mt-7 grid gap-5">
          {roadmapSteps.map((step) => (
            <article key={step.step} className="grid gap-5 rounded-[1.8rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-sm lg:grid-cols-[0.24fr_1fr] lg:p-6">
              <div>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-[1rem] bg-slate-950 text-lg font-semibold text-white">{step.step}</span>
                <p className="mt-4 text-[11px] uppercase tracking-[0.22em] text-cyan-700">Roadmap step</p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold tracking-tight text-slate-950">{step.title}</h3>
                <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">{step.description}</p>
                <ul className="mt-5 grid gap-3 text-sm leading-7 text-slate-700">
                  {step.tasks.map((task) => (
                    <li key={task} className="rounded-[1.1rem] border border-slate-200 bg-white px-4 py-3 shadow-sm">{task}</li>
                  ))}
                </ul>
                <Link href={step.cta.href} className="mt-5 inline-flex rounded-full bg-cyan-50 px-4 py-2.5 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-100">{step.cta.label} →</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] lg:p-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Future roadmaps</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">After Level 1 is under control</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">Keep the current product focused on Level 1 readiness, while showing clients there is a path toward larger CPCSC and ITSP.10.171/NIST-aligned programs later.</p>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {futureRoadmaps.map((roadmap) => (
            <article key={roadmap.title} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-base font-semibold text-slate-950">{roadmap.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{roadmap.description}</p>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

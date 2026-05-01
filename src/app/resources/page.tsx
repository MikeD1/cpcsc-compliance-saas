import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { SubscriptionGate } from "@/components/auth/subscription-gate";
import { getCurrentAccess } from "@/lib/access";
import { resourceItems, resourceToolkits } from "@/lib/workspace-content";

const toolkitMetrics = [
  { label: "Guided tools", value: String(resourceToolkits.length) },
  { label: "Roadmap stages", value: "3" },
  { label: "Evidence outputs", value: "25+" },
  { label: "Downloads", value: String(resourceItems.length) },
];

const workflowPath = [
  "Choose the readiness tool that matches the roadmap step.",
  "Use the fields and evidence prompts to complete the working record.",
  "Copy the result into your approved repository or internal document system.",
  "Attach the record location back to the relevant control as evidence.",
];

export default async function ResourcesPage() {
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
      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[2rem] border border-white/50 bg-white/92 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Tools and Templates</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 lg:text-5xl">Built-in readiness toolkit</h1>
          <p className="mt-5 max-w-4xl text-base leading-8 text-slate-600">
            These are no longer just files to download. Each tool explains when to use it, what it should produce, what evidence it supports, and where it connects back into the CPCSC Level 1 workflow.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-4">
            {toolkitMetrics.map((metric) => (
              <div key={metric.label} className="rounded-[1.3rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{metric.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{metric.value}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#0a1222_0%,#0f1d36_100%)] p-8 text-white shadow-[0_30px_90px_rgba(15,23,42,0.25)]">
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-300">How this becomes product value</p>
          <h2 className="mt-3 text-2xl font-semibold">From template to evidence trail</h2>
          <ol className="mt-5 grid gap-3 text-sm leading-6 text-slate-200">
            {workflowPath.map((step, index) => (
              <li key={step} className="flex gap-3 rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-300 text-xs font-bold text-slate-950">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <Link href="/roadmap" className="mt-6 inline-flex rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-50">Back to roadmap</Link>
        </aside>
      </section>

      <section className="rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] lg:p-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Guided toolkit</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Use these as readiness workflows</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Each card gives the user a purpose, expected output, fields to complete, evidence examples, and a next action inside ComplianceOne.
            </p>
          </div>
          <Link href="/controls" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800">Open controls</Link>
        </div>

        <div className="mt-7 grid gap-5">
          {resourceToolkits.map((tool) => (
            <article key={tool.id} id={tool.id} className="scroll-mt-28 rounded-[1.8rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-sm lg:p-6">
              <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">{tool.stage}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">Built-in tool</span>
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">{tool.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{tool.value}</p>
                  <div className="mt-5 rounded-[1.2rem] border border-cyan-100 bg-cyan-50/70 p-4">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-800">Expected output</p>
                    <p className="mt-2 text-sm leading-7 text-cyan-950">{tool.outcome}</p>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link href={tool.primaryHref} className="rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">{tool.primaryLabel}</Link>
                    <Link href={tool.downloadHref} className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Download worksheet</Link>
                  </div>
                </div>

                <div className="grid gap-4">
                  <ToolkitPanel title="Fields to complete" items={tool.fields} />
                  <ToolkitPanel title="Evidence this can support" items={tool.evidence} />
                  <div className="rounded-[1.2rem] border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Example completed output</p>
                    <p className="mt-2 text-sm leading-7 text-slate-700">{tool.sample}</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] lg:p-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Raw downloads</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Downloadable copies are still available</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          The product value is now in the guided workflow above. These downloads remain useful when a customer needs to move the working record into SharePoint, Google Workspace, an internal file server, or a policy/document-management repository.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {resourceItems.map((item) => (
            <Link key={item.title} href={item.href} className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-white hover:shadow-md">
              <h3 className="text-base font-semibold text-slate-950">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              <span className="mt-4 inline-flex text-sm font-semibold text-cyan-700">Download Markdown →</span>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function ToolkitPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[1.2rem] border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{title}</p>
      <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-700 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item} className="rounded-[0.9rem] bg-slate-50 px-3 py-2">{item}</li>
        ))}
      </ul>
    </div>
  );
}

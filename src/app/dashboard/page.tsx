import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { SubscriptionGate } from "@/components/auth/subscription-gate";
import { FirstRunChecklist } from "@/components/onboarding/first-run-checklist";
import { getCurrentAccess } from "@/lib/access";
import { syncCheckoutSessionForOrganization } from "@/lib/billing-sync";
import { getDashboardData } from "@/lib/dashboard";

const roadmapPhases = [
  {
    phase: "Phase 1",
    title: "Implementation planning and self-assessment",
    description: "Build the working picture of what is in scope and where CPCSC readiness gaps exist.",
    actions: ["Scope your system", "Catalog your system", "Create plans for controls", "Test and self-assess"],
  },
  {
    phase: "Phase 2",
    title: "Implement controls",
    description: "Execute the control plans and turn readiness intent into operational practice.",
    actions: ["Assign control owners", "Implement required practices", "Update policies and procedures", "Record implementation details"],
  },
  {
    phase: "Phase 3",
    title: "Collect evidence and validate quality",
    description: "Create a buyer-readable evidence trail that shows where proof lives and why it supports the control.",
    actions: ["Attach evidence references", "Describe what each evidence item proves", "Check for currency and clarity", "Resolve weak or missing proof"],
  },
  {
    phase: "Phase 4",
    title: "Internal review and readiness package",
    description: "Review the control record, close remaining gaps, and prepare a compliance assessment package for conversations with buyers or assessors.",
    actions: ["Review controls", "Export compliance assessment", "Prepare leadership summary", "Plan the next readiness cycle"],
  },
];

const policyItems = [
  "Access control policy",
  "Acceptable use policy",
  "Incident response policy",
  "Asset management procedure",
  "Backup and recovery procedure",
  "Supplier/security responsibility statement",
];

const resourceItems = [
  { title: "Separation of duties worksheet", href: "/resources/separation-of-duties-worksheet.md", description: "Map duties, conflicts, mitigations, and follow-up owners." },
  { title: "Control owner assignment tracker", href: "/resources/control-owner-assignment-tracker.md", description: "Assign each CPCSC control to an accountable owner and track next actions." },
  { title: "Evidence folder structure guide", href: "/resources/evidence-folder-structure-guide.md", description: "Create a practical source-evidence folder structure and naming convention." },
  { title: "Quarterly access review template", href: "/resources/quarterly-access-review-template.md", description: "Document user access reviews, exceptions, remediation, and sign-off." },
  { title: "System inventory worksheet", href: "/resources/system-inventory-worksheet.md", description: "Define systems, owners, data handled, criticality, and readiness scope." },
  { title: "Policy template starter pack", href: "/resources/policy-template-starter-pack.md", description: "Starter outlines for access control, acceptable use, incident response, and asset management policies." },
];

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

  const { organization, assessment, controlCards, statusCounts, actionSummary, priorityActions, readinessDiagnosis, members, categorySummaries } = await getDashboardData();
  const ownerSummaries = Array.from(
    new Map(
      controlCards.map((control) => [
        control.response?.owner ?? "Unassigned",
        {
          owner: control.response?.owner ?? "Unassigned",
          total: controlCards.filter((item) => (item.response?.owner ?? "Unassigned") === (control.response?.owner ?? "Unassigned")).length,
          open: controlCards.filter((item) => (item.response?.owner ?? "Unassigned") === (control.response?.owner ?? "Unassigned") && item.response?.status !== "COMPLETE").length,
        },
      ]),
    ).values(),
  );

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
                Track CPCSC control status, policies, roadmap progress, and practical resources in one readiness workspace. This is preparation and management evidence, not a certification or government approval.
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

      <nav aria-label="Dashboard sections" className="rounded-[1.6rem] border border-white/50 bg-white/92 p-2 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <div className="grid gap-2 md:grid-cols-4">
          <TabLink href="#control-status" label="CPCSC Control Status" />
          <TabLink href="#policies" label="Policies" />
          <TabLink href="#roadmap" label="Roadmap" />
          <TabLink href="#resources" label="Resources" />
        </div>
      </nav>

      <section id="control-status" className="scroll-mt-28 rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">CPCSC Control Status</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Statuses, owners, and control families</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Start here to see what is complete, who owns the work, and which control families need attention.
            </p>
          </div>
          <Link href="/reports" className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
            Export compliance assessment
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <NextStep title="Assign owners" description={`${actionSummary.unassigned} controls are unassigned.`} tone="amber" href="/controls#assign-owners" />
          <NextStep title="Add evidence" description={`${actionSummary.missingEvidence} controls have no evidence records.`} tone="sky" href="/controls#assign-owners" />
          <NextStep title="Review controls" description={`${actionSummary.readyForReview} controls are ready for review.`} tone="emerald" href="/controls" />
          <NextStep title="Reviewed" description={`${actionSummary.reviewed} controls have a review date recorded.`} tone="slate" href="/reports" />
        </div>

        <div className="mt-7 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <div className="grid gap-4">
            <h3 className="text-lg font-semibold text-slate-950">Readiness actions</h3>
            {priorityActions.length === 0 ? (
              <div className="rounded-[1.6rem] border border-emerald-200 bg-emerald-50 p-5 text-sm leading-7 text-emerald-800">
                No priority actions right now. Export the readiness assessment or start a deeper review pass.
              </div>
            ) : null}
            {priorityActions.map((action, index) => (
              <article key={`${action.actionType}-${action.controlId}`} className="rounded-[1.6rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">#{index + 1}</span>
                  <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">{action.actionType}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{action.category}</span>
                </div>
                <h4 className="mt-3 text-base font-semibold text-slate-950">{action.officialId}: {action.title}</h4>
                <p className="mt-2 text-sm leading-6 text-slate-600">{action.reason}</p>
                <p className="mt-2 text-sm leading-6 text-slate-800"><span className="font-semibold">Next:</span> {action.nextStep}</p>
              </article>
            ))}
          </div>

          <div className="grid content-start gap-4">
            <StatusPanel statusCounts={statusCounts} />
            <SummaryPanel title="Owners" items={ownerSummaries.map((owner) => `${owner.owner}: ${owner.open}/${owner.total} open`)} />
            <SummaryPanel title="Control families" items={categorySummaries.map((summary) => `${summary.category}: ${summary.completed}/${summary.total} complete`)} />
          </div>
        </div>
      </section>

      <section id="policies" className="scroll-mt-28 rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] lg:p-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Policies</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Policy workspace</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Use this area to track the policy set that supports CPCSC readiness. These are preparation aids and should be adapted to the organization before use.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {policyItems.map((item) => <ResourceCard key={item} title={item} description="Template or working policy area to prepare and maintain." />)}
        </div>
      </section>

      <section id="roadmap" className="scroll-mt-28 rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] lg:p-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Roadmap</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Roadmap toward CPCSC readiness</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          A practical preparation path inspired by NIST CSF-style lifecycle thinking: identify the environment, plan controls, implement, collect evidence, and review readiness before external conversations.
        </p>
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {roadmapPhases.map((phase) => (
            <article key={phase.phase} className="rounded-[1.7rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-sm">
              <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">{phase.phase}</span>
              <h3 className="mt-4 text-xl font-semibold text-slate-950">{phase.title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{phase.description}</p>
              <ul className="mt-4 grid gap-2 text-sm leading-6 text-slate-700">
                {phase.actions.map((action) => <li key={action} className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3">{action}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="resources" className="scroll-mt-28 rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] lg:p-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Resources</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Worksheets and templates</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Add practical materials organizations can use while preparing their readiness records. Download starter worksheets and templates your team can adapt while preparing readiness records.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {resourceItems.map((item) => <ResourceCard key={item.title} title={item.title} description={item.description} href={item.href} />)}
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
                  <h3 className="mt-2 text-lg font-semibold text-slate-950">{control.officialId}: {control.title}</h3>
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

function TabLink({ href, label }: { href: string; label: string }) {
  return <Link href={href} className="rounded-[1.1rem] bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-950 hover:text-white">{label}</Link>;
}

function NextStep({ title, description, tone, href }: { title: string; description: string; tone: "emerald" | "sky" | "amber" | "slate"; href: string }) {
  const tones = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
    sky: "border-sky-200 bg-sky-50 text-sky-800",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    slate: "border-slate-200 bg-slate-50 text-slate-800",
  };

  return <Link href={href} className={`rounded-[1.4rem] border p-4 transition hover:-translate-y-0.5 hover:shadow-md ${tones[tone]}`}><h3 className="text-sm font-semibold">{title}</h3><p className="mt-2 text-sm leading-6">{description}</p></Link>;
}

function StatusPanel({ statusCounts }: { statusCounts: { complete: number; review: number; inProgress: number; notStarted: number } }) {
  return (
    <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-5">
      <h3 className="text-sm font-semibold text-slate-950">Statuses</h3>
      <div className="mt-4 grid gap-2 text-sm text-slate-700">
        <InfoCard label="Complete" value={String(statusCounts.complete)} />
        <InfoCard label="Ready for review" value={String(statusCounts.review)} />
        <InfoCard label="In progress" value={String(statusCounts.inProgress)} />
        <InfoCard label="Not started" value={String(statusCounts.notStarted)} />
      </div>
    </div>
  );
}

function SummaryPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-5">
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      <ul className="mt-4 grid gap-2 text-sm leading-6 text-slate-700">
        {items.map((item) => <li key={item} className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3">{item}</li>)}
      </ul>
    </div>
  );
}

function ResourceCard({ title, description, href }: { title: string; description: string; href?: string }) {
  const content = (
    <>
      <h3 className="text-base font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      {href ? <span className="mt-4 inline-flex text-sm font-semibold text-cyan-700">Download template →</span> : null}
    </>
  );

  if (href) {
    return <Link href={href} className="rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md">{content}</Link>;
  }

  return <article className="rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-sm">{content}</article>;
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return <div className="border-b border-white/10 pb-4 last:border-0 last:pb-0"><dt className="text-slate-400">{label}</dt><dd className="mt-2 font-medium leading-7 text-white">{value}</dd></div>;
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 shadow-sm"><p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</p><p className="mt-2 text-sm font-medium text-slate-900">{value}</p></div>;
}

import Link from "next/link";

type OnboardingItem = {
  title: string;
  description: string;
  href: string;
  complete: boolean;
};

export function FirstRunChecklist({
  organizationName,
  memberCount,
  unassignedControls,
  missingEvidence,
  reviewedControls,
}: {
  organizationName: string;
  memberCount: number;
  unassignedControls: number;
  missingEvidence: number;
  reviewedControls: number;
}) {
  const items: OnboardingItem[] = [
    {
      title: "Confirm organization profile",
      description: `${organizationName} is your active workspace. Review the name, billing access, and team list before inviting testers.`,
      href: "/settings",
      complete: Boolean(organizationName),
    },
    {
      title: "Invite or confirm teammates",
      description: memberCount > 1 ? `${memberCount} members are in this workspace.` : "Invite at least one teammate or confirm this will stay a solo tester workspace.",
      href: "/settings",
      complete: memberCount > 1,
    },
    {
      title: "Assign control owners",
      description: unassignedControls === 0 ? "All controls have owners." : `${unassignedControls} controls still need an owner.`,
      href: "/controls",
      complete: unassignedControls === 0,
    },
    {
      title: "Add first evidence records",
      description: missingEvidence === 0 ? "Every control has at least one evidence reference." : `${missingEvidence} controls still need evidence references.`,
      href: "/evidence",
      complete: missingEvidence === 0,
    },
    {
      title: "Generate readiness report",
      description: reviewedControls > 0 ? "At least one control has been reviewed; export a report when ready." : "Review at least one control, then export the readiness report.",
      href: "/reports",
      complete: reviewedControls > 0,
    },
  ];
  const completeCount = items.filter((item) => item.complete).length;

  return (
    <section className="rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">First-run checklist</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Set up the workspace for a useful CPCSC readiness pass</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            This keeps private-beta testers focused on the smallest path that proves the product: organization, people, owners, evidence, and report.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">{completeCount}/{items.length} complete</span>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-5">
        {items.map((item, index) => (
          <Link key={item.title} href={item.href} className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-white hover:shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">Step {index + 1}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.complete ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                {item.complete ? "Done" : "Open"}
              </span>
            </div>
            <h3 className="mt-4 text-sm font-semibold text-slate-950">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

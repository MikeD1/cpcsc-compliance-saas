import Link from "next/link";

type OnboardingItem = {
  title: string;
  description: string;
  href: string;
  actionLabel: string;
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
      description: `${organizationName} is your active workspace. Add the company profile and readiness scope before inviting testers.`,
      href: "/settings#organization-profile",
      actionLabel: "Review profile",
      complete: Boolean(organizationName),
    },
    {
      title: "Invite or confirm teammates",
      description: memberCount > 1 ? `${memberCount} members are in this workspace.` : "Invite a teammate or confirm this will stay a solo workspace for now.",
      href: "/settings#team-invitations",
      actionLabel: "Invite teammate",
      complete: memberCount > 1,
    },
    {
      title: "Assign the first owner",
      description: unassignedControls < 13 ? "At least one control has an accountable owner." : "Assign one control owner so work has a clear home.",
      href: "/controls#assign-owners",
      actionLabel: "Assign owner",
      complete: unassignedControls < 13,
    },
    {
      title: "Add the first evidence record",
      description: missingEvidence < 13 ? "At least one evidence reference has been added." : "Add one evidence record to prove the evidence workflow.",
      href: "/evidence#add-evidence",
      actionLabel: "Add evidence",
      complete: missingEvidence < 13,
    },
    {
      title: "Open the first report",
      description: reviewedControls > 0 ? "At least one control has been reviewed; the report has useful content to inspect." : "Open the report once there is some owner/evidence activity to review.",
      href: "/reports#download-report",
      actionLabel: "Open report",
      complete: reviewedControls > 0,
    },
  ];

  const completeCount = items.filter((item) => item.complete).length;
  const incompleteItems = items.filter((item) => !item.complete);

  if (completeCount === items.length) {
    return null;
  }

  return (
    <section className="rounded-[2rem] border border-cyan-100 bg-cyan-50/80 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] lg:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Workspace setup</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">Finish the short setup path</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
            This is only for first-run setup. Once these are done, the ongoing work moves to Next Best Actions.
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm">{completeCount}/{items.length} complete</span>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {incompleteItems.map((item, index) => (
          <Link key={item.title} href={item.href} className="rounded-[1.25rem] border border-cyan-100 bg-white p-4 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">Setup {index + 1}</span>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">Open</span>
            </div>
            <h3 className="mt-4 text-sm font-semibold text-slate-950">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
            <span className="mt-4 inline-flex text-sm font-semibold text-cyan-700">{item.actionLabel} →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

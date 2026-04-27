import Link from "next/link";

const sections = [
  {
    href: "#organization-profile",
    label: "Organization profile",
    description: "Name, contact, and scope fields.",
  },
  {
    href: "#billing",
    label: "Billing",
    description: "Plan status and Stripe portal.",
  },
  {
    href: "#team-members",
    label: "Members",
    description: "Roles and active/disabled status.",
  },
  {
    href: "#team-invitations",
    label: "Invitations",
    description: "Invite teammates into the workspace.",
  },
];

export function SettingsSectionNav() {
  return (
    <nav aria-label="Settings sections" className="rounded-[1.75rem] border border-cyan-100 bg-cyan-50/80 p-4 shadow-sm">
      <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-800">Jump to</p>
      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {sections.map((section) => (
          <Link key={section.href} href={section.href} className="rounded-[1.2rem] border border-white/80 bg-white px-4 py-3 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-sm">
            <p className="text-sm font-semibold text-slate-950">{section.label}</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">{section.description}</p>
          </Link>
        ))}
      </div>
    </nav>
  );
}

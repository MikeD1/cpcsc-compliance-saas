import type { OrganizationMember } from "@/lib/members";

function displayName(member: OrganizationMember) {
  return member.fullName || member.email || "Unnamed member";
}

export function MemberList({ members }: { members: OrganizationMember[] }) {
  return (
    <section className="rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] lg:p-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Team members</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">People available for ownership</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Active members can be assigned as control owners. Owners and admins can create manual invite links below; role editing and disabled-member management are tracked as the next team-management step.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">{members.length} member{members.length === 1 ? "" : "s"}</span>
      </div>

      <div className="mt-6 grid gap-3">
        {members.length === 0 ? (
          <div className="rounded-[1.4rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">
            No organization members were loaded. Check the organization membership schema before enabling invitations.
          </div>
        ) : null}
        {members.map((member) => (
          <div key={member.membershipId} className="grid gap-3 rounded-[1.4rem] border border-slate-200 bg-white px-4 py-4 shadow-sm md:grid-cols-[1fr_auto_auto] md:items-center">
            <div>
              <p className="font-medium text-slate-950">{displayName(member)}</p>
              <p className="mt-1 text-sm text-slate-500">{member.email ?? "No email on profile"}</p>
            </div>
            <span className="rounded-full bg-cyan-50 px-3 py-1 text-sm font-medium text-cyan-800">{member.role}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">{member.status}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

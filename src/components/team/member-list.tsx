"use client";

import { useState } from "react";
import type { OrganizationMember } from "@/lib/members";

function displayName(member: OrganizationMember) {
  return member.fullName || member.email || "Unnamed member";
}

export function MemberList({ members, canManageMembers }: { members: OrganizationMember[]; canManageMembers: boolean }) {
  const [teamMembers, setTeamMembers] = useState(members);
  const [savingMembershipId, setSavingMembershipId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateMembership(membershipId: string, changes: { role?: string; status?: string }) {
    setSavingMembershipId(membershipId);
    setError(null);

    try {
      const response = await fetch(`/api/organization/memberships/${membershipId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to update member.");
      }

      setTeamMembers((current) =>
        current.map((member) =>
          member.membershipId === membershipId
            ? {
                ...member,
                role: payload.membership.role,
                status: payload.membership.status,
              }
            : member,
        ),
      );
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to update member.");
    } finally {
      setSavingMembershipId(null);
    }
  }

  return (
    <section id="team-members" className="scroll-mt-28 rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] lg:p-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Team members</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">People available for ownership</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Active members can be assigned as control owners. Owners and admins can manage roles and disable inactive memberships without removing historical ownership records.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">{teamMembers.length} member{teamMembers.length === 1 ? "" : "s"}</span>
      </div>

      {error ? <p className="mt-4 text-sm text-rose-500">{error}</p> : null}

      <div className="mt-6 grid gap-3">
        {teamMembers.length === 0 ? (
          <div className="rounded-[1.4rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">
            No organization members were loaded. Check the organization membership schema before enabling invitations.
          </div>
        ) : null}
        {teamMembers.map((member) => {
          const saving = savingMembershipId === member.membershipId;

          return (
            <div key={member.membershipId} className="grid gap-3 rounded-[1.4rem] border border-slate-200 bg-white px-4 py-4 shadow-sm lg:grid-cols-[1fr_auto_auto] lg:items-center">
              <div>
                <p className="font-medium text-slate-950">{displayName(member)}</p>
                <p className="mt-1 text-sm text-slate-500">{member.email ?? "No email on profile"}</p>
              </div>
              {canManageMembers ? (
                <select
                  value={member.role}
                  disabled={saving}
                  onChange={(event) => updateMembership(member.membershipId, { role: event.target.value })}
                  className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-2 text-sm font-medium text-cyan-900 outline-none transition focus:border-cyan-400 disabled:opacity-60"
                >
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                </select>
              ) : (
                <span className="rounded-full bg-cyan-50 px-3 py-1 text-sm font-medium text-cyan-800">{member.role}</span>
              )}
              {canManageMembers ? (
                <select
                  value={member.status}
                  disabled={saving}
                  onChange={(event) => updateMembership(member.membershipId, { status: event.target.value })}
                  className="rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-800 outline-none transition focus:border-cyan-400 disabled:opacity-60"
                >
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select>
              ) : (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">{member.status}</span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

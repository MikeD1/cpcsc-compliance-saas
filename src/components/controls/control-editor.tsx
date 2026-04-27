"use client";

import { useState } from "react";
import type { OrganizationMember } from "@/lib/members";

type ControlEditorProps = {
  members: OrganizationMember[];
  control: {
    id: string;
    displayId: number;
    title: string;
    category: string;
    objective: string;
    whatToDo: string[];
    response: {
      status: "NOT_STARTED" | "IN_PROGRESS" | "READY_FOR_REVIEW" | "COMPLETE";
      implementationDetails: string;
      owner?: string | null;
      ownerMembershipId?: string | null;
      reviewCadence?: string | null;
      evidenceItems: Array<{ id: string; title: string; location?: string | null }>;
    } | null;
  };
};

const statuses = [
  { value: "NOT_STARTED", label: "Not started" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "READY_FOR_REVIEW", label: "Ready for review" },
  { value: "COMPLETE", label: "Complete" },
] as const;

function memberLabel(member: OrganizationMember) {
  const name = member.fullName || member.email || "Unnamed member";
  return `${name}${member.role ? ` · ${member.role}` : ""}`;
}

export function ControlEditor({ control, members }: ControlEditorProps) {
  const activeMembers = members.filter((member) => member.status === "active");
  const [status, setStatus] = useState(control.response?.status ?? "NOT_STARTED");
  const [implementationDetails, setImplementationDetails] = useState(control.response?.implementationDetails ?? "");
  const [ownerMembershipId, setOwnerMembershipId] = useState(control.response?.ownerMembershipId ?? "");
  const [reviewCadence, setReviewCadence] = useState(control.response?.reviewCadence ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setSaved(null);
    setError(null);

    try {
      const response = await fetch(`/api/controls/${control.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          implementationDetails,
          ownerMembershipId: ownerMembershipId || null,
          reviewCadence,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Unable to save control.");
      }

      setSaved("Saved");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to save control.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="overflow-hidden rounded-[2rem] border border-white/50 bg-white/92 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
      <div className="border-b border-white/10 bg-[linear-gradient(135deg,#09111f_0%,#0d1d34_100%)] px-6 py-6 text-white">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-300">{control.category}</p>
            <h2 className="mt-2 text-2xl font-semibold lg:text-3xl">
              Control {control.displayId}: {control.title}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as typeof status)}
              className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white outline-none"
            >
              {statuses.map((option) => (
                <option key={option.value} value={option.value} className="text-slate-900">
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-100 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save control"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-6 xl:grid-cols-[0.88fr_1.12fr] xl:p-8">
        <section className="rounded-[1.7rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-sm">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-700">What this control expects</h3>
          <p className="mt-4 text-sm leading-7 text-slate-600">{control.objective}</p>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-700">
            {control.whatToDo.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-cyan-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-4">
          <div className="rounded-[1.7rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-700">Implementation narrative</h3>
              {saved ? <span className="text-xs font-medium text-emerald-700">{saved}</span> : null}
            </div>
            <textarea
              value={implementationDetails}
              onChange={(event) => setImplementationDetails(event.target.value)}
              rows={7}
              className="mt-4 w-full rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-700 outline-none transition focus:border-cyan-400"
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-[0.48fr_0.52fr]">
            <div className="rounded-[1.7rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-sm">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-700">Ownership</h3>
              <select
                value={ownerMembershipId}
                onChange={(event) => setOwnerMembershipId(event.target.value)}
                className="mt-4 w-full rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-cyan-400"
              >
                <option value="">Unassigned</option>
                {activeMembers.map((member) => (
                  <option key={member.membershipId} value={member.membershipId}>
                    {memberLabel(member)}
                  </option>
                ))}
              </select>
              <input
                value={reviewCadence}
                onChange={(event) => setReviewCadence(event.target.value)}
                placeholder="Quarterly / Monthly / Annually"
                className="mt-3 w-full rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 outline-none transition focus:border-cyan-400"
              />
              {activeMembers.length === 0 ? <p className="mt-3 text-xs leading-6 text-amber-700">No active members loaded. Add team members before assigning owners.</p> : null}
            </div>
            <div className="rounded-[1.7rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-sm">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-700">Evidence attached</h3>
              <div className="mt-4 grid gap-3">
                {(control.response?.evidenceItems ?? []).length === 0 ? (
                  <div className="rounded-[1.2rem] border border-dashed border-slate-300 bg-white px-4 py-4 text-sm text-slate-500">
                    No evidence attached yet.
                  </div>
                ) : (
                  (control.response?.evidenceItems ?? []).map((item) => (
                    <div key={item.id} className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                      <p className="font-medium text-slate-900">{item.title}</p>
                      <p className="mt-1 text-slate-500">{item.location}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          {error ? <p className="text-sm text-rose-500">{error}</p> : null}
        </section>
      </div>
    </article>
  );
}

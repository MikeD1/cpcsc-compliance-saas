"use client";

import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/status-badge";
import { ControlEditor } from "@/components/controls/control-editor";
import { securityControlFamilies } from "@/lib/cpcsc";
import type { OrganizationMember } from "@/lib/members";

type ControlStatus = "NOT_STARTED" | "IN_PROGRESS" | "READY_FOR_REVIEW" | "COMPLETE";

type WorkspaceControl = {
  id: string;
  displayId: string;
  title: string;
  category: string;
  objective: string;
  whatToDo: string[];
  exampleImplementation: string;
  evidenceExamples: string[];
  criteriaAlignment: {
    assessmentObjectives: string[];
    determinationStatements: Array<{ id: string; text: string }>;
    assessmentObjects: {
      examine: string[];
      interview: string[];
      test: string[];
    };
    organizationDefinedParameters: string[];
    organizationDefinedParameterDetails: Array<{ id: string; text: string }>;
  };
  readinessGuidance: {
    plainEnglishGoal: string;
    weakImplementationExample: string;
    strongImplementationExample: string;
    commonMistakes: string[];
    buyerQuestions: string[];
    suggestedNextAction: string;
  };
  response: {
    status: ControlStatus;
    implementationDetails: string;
    owner?: string | null;
    ownerMembershipId?: string | null;
    reviewCadence?: string | null;
    reviewedAt?: string | null;
    evidenceItems: Array<{ id: string; title: string; location?: string | null }>;
  } | null;
};

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "NOT_STARTED", label: "Not started" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "READY_FOR_REVIEW", label: "Ready for review" },
  { value: "COMPLETE", label: "Complete" },
] as const;

function controlStatus(control: WorkspaceControl): ControlStatus {
  return control.response?.status ?? "NOT_STARTED";
}

function controlOwnerId(control: WorkspaceControl) {
  return control.response?.ownerMembershipId ?? "unassigned";
}

function hasMissingEvidence(control: WorkspaceControl) {
  return (control.response?.evidenceItems.length ?? 0) === 0;
}

export function ControlsWorkspace({ controls, members }: { controls: WorkspaceControl[]; members: OrganizationMember[] }) {
  const [activeControlId, setActiveControlId] = useState(controls[0]?.id ?? "");
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]["value"]>("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [familyFilter, setFamilyFilter] = useState("all");
  const [missingEvidenceOnly, setMissingEvidenceOnly] = useState(false);

  const activeMembers = members.filter((member) => member.status === "active");
  const filteredControls = useMemo(
    () =>
      controls.filter((control) => {
        const matchesStatus = statusFilter === "all" || controlStatus(control) === statusFilter;
        const matchesOwner = ownerFilter === "all" || controlOwnerId(control) === ownerFilter;
        const matchesFamily = familyFilter === "all" || control.category === familyFilter;
        const matchesEvidence = !missingEvidenceOnly || hasMissingEvidence(control);
        return matchesStatus && matchesOwner && matchesFamily && matchesEvidence;
      }),
    [controls, familyFilter, missingEvidenceOnly, ownerFilter, statusFilter],
  );

  const activeControl = controls.find((control) => control.id === activeControlId) ?? filteredControls[0] ?? controls[0];
  const groupedControls = securityControlFamilies
    .map((family) => ({ family, controls: filteredControls.filter((control) => control.category === family) }))
    .filter((group) => group.controls.length > 0);
  const missingEvidenceCount = controls.filter(hasMissingEvidence).length;
  const unassignedCount = controls.filter((control) => !control.response?.ownerMembershipId).length;

  return (
    <section id="assign-owners" className="scroll-mt-28 rounded-[2rem] border border-white/50 bg-white/92 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.10)] lg:p-5">
      <div className="grid gap-5 xl:grid-cols-[23rem_1fr]">
        <aside className="rounded-[1.7rem] border border-slate-200 bg-slate-50 p-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-700">Assistant queue</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">Controls to work</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Filter the 13 Level 1 controls by family, pick one, then add implementation details and Examine / Interview / Test evidence in the same workspace.
            </p>
          </div>

          <div className="mt-4 grid gap-3">
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="rounded-[1rem] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-400">
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <select value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)} className="rounded-[1rem] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-400">
              <option value="all">All owners</option>
              <option value="unassigned">Unassigned</option>
              {activeMembers.map((member) => (
                <option key={member.membershipId} value={member.membershipId}>{member.fullName || member.email || "Unnamed member"}</option>
              ))}
            </select>
            <select value={familyFilter} onChange={(event) => setFamilyFilter(event.target.value)} className="rounded-[1rem] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-400">
              <option value="all">All control families</option>
              {securityControlFamilies.map((family) => (
                <option key={family} value={family}>{family}</option>
              ))}
            </select>
            <label className="flex items-center gap-3 rounded-[1rem] border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={missingEvidenceOnly} onChange={(event) => setMissingEvidenceOnly(event.target.checked)} className="h-4 w-4 accent-cyan-600" />
              Missing evidence only
            </label>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-[1rem] bg-white px-3 py-2 text-slate-700"><span className="font-semibold text-slate-950">{unassignedCount}</span> unassigned</div>
            <div className="rounded-[1rem] bg-white px-3 py-2 text-slate-700"><span className="font-semibold text-slate-950">{missingEvidenceCount}</span> missing evidence</div>
          </div>

          <div className="mt-4 max-h-[46rem] space-y-2 overflow-auto pr-1">
            {filteredControls.length === 0 ? (
              <div className="rounded-[1.2rem] border border-dashed border-slate-300 bg-white p-4 text-sm leading-6 text-slate-500">No controls match these filters.</div>
            ) : null}
            {groupedControls.map((group) => (
              <div key={group.family} className="space-y-2">
                <div className="sticky top-0 z-10 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  {group.family}
                </div>
                {group.controls.map((control) => {
                  const isActive = activeControl?.id === control.id;
                  const evidenceCount = control.response?.evidenceItems.length ?? 0;
                  return (
                    <button
                      key={control.id}
                      type="button"
                      onClick={() => setActiveControlId(control.id)}
                      className={`w-full rounded-[1.2rem] border p-3 text-left transition ${isActive ? "border-cyan-300 bg-white shadow-sm" : "border-slate-200 bg-white/70 hover:border-cyan-200 hover:bg-white"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold text-cyan-800">{control.displayId}</p>
                          <p className="mt-1 text-sm font-semibold leading-5 text-slate-950">{control.title}</p>
                        </div>
                        <StatusBadge status={controlStatus(control)} />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                        <span className="rounded-full bg-slate-100 px-2 py-1">{control.response?.owner ?? "Unassigned"}</span>
                        <span className={`rounded-full px-2 py-1 ${evidenceCount > 0 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{evidenceCount} evidence</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>

        <div>
          {activeControl ? <ControlEditor key={activeControl.id} members={members} control={activeControl} /> : null}
        </div>
      </div>
    </section>
  );
}

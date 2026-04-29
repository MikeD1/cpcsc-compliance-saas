"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { EvidenceRecordActions } from "@/components/evidence/evidence-record-actions";
import type { OrganizationMember } from "@/lib/members";

type ControlEditorProps = {
  members: OrganizationMember[];
  control: {
    id: string;
    displayId: string;
    title: string;
    category: string;
    objective: string;
    whatToDo: string[];
    exampleImplementation: string;
    evidenceExamples: string[];
    readinessGuidance: {
      plainEnglishGoal: string;
      weakImplementationExample: string;
      strongImplementationExample: string;
      commonMistakes: string[];
      buyerQuestions: string[];
      suggestedNextAction: string;
    };
    response: {
      status: "NOT_STARTED" | "IN_PROGRESS" | "READY_FOR_REVIEW" | "COMPLETE";
      implementationDetails: string;
      owner?: string | null;
      ownerMembershipId?: string | null;
      reviewCadence?: string | null;
      reviewedAt?: string | null;
      evidenceItems: Array<{ id: string; title: string; location?: string | null; artifactType?: string | null; status?: string | null }>;
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
  const router = useRouter();
  const activeMembers = members.filter((member) => member.status === "active");
  const [status, setStatus] = useState(control.response?.status ?? "NOT_STARTED");
  const [reviewedAt, setReviewedAt] = useState(control.response?.reviewedAt ?? null);
  const [implementationDetails, setImplementationDetails] = useState(control.response?.implementationDetails ?? "");
  const [ownerMembershipId, setOwnerMembershipId] = useState(control.response?.ownerMembershipId ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evidenceItems, setEvidenceItems] = useState(control.response?.evidenceItems ?? []);
  const [evidenceTitle, setEvidenceTitle] = useState("");
  const [evidenceLocation, setEvidenceLocation] = useState("");
  const [evidenceType, setEvidenceType] = useState("Document");
  const [savingEvidence, setSavingEvidence] = useState(false);
  const [evidenceMessage, setEvidenceMessage] = useState<string | null>(null);

  async function saveControl(reviewAction?: "request-review" | "mark-reviewed" | "clear-review") {
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
          reviewAction,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Unable to save control.");
      }

      if (reviewAction === "request-review") {
        setStatus("READY_FOR_REVIEW");
        setSaved("Marked ready for review");
        setDirty(false);
      } else if (reviewAction === "mark-reviewed") {
        setStatus("COMPLETE");
        setReviewedAt(new Date().toISOString());
        setSaved("Marked reviewed");
        setDirty(false);
      } else if (reviewAction === "clear-review") {
        setReviewedAt(null);
        setSaved("Review date cleared");
        setDirty(false);
      } else {
        setSaved("Saved just now");
        setDirty(false);
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to save control.");
    } finally {
      setSaving(false);
    }
  }


  async function addEvidence(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingEvidence(true);
    setEvidenceMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          controlId: control.id,
          title: evidenceTitle,
          location: evidenceLocation,
          artifactType: evidenceType,
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to add evidence.");
      }

      if (payload?.evidence) {
        setEvidenceItems((items) => [payload.evidence, ...items]);
      }

      setEvidenceTitle("");
      setEvidenceLocation("");
      setEvidenceType("Document");
      setEvidenceMessage("Evidence added to this control");
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to add evidence.");
    } finally {
      setSavingEvidence(false);
    }
  }

  return (
    <article className="overflow-hidden rounded-[2rem] border border-white/50 bg-white/92 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
      <div className="border-b border-white/10 bg-[linear-gradient(135deg,#09111f_0%,#0d1d34_100%)] px-6 py-6 text-white">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-300">{control.category}</p>
            <h2 className="mt-2 text-2xl font-semibold lg:text-3xl">
              {control.displayId}: {control.title}
            </h2>
            <p className="mt-2 text-sm text-slate-300">{reviewedAt ? `Last reviewed ${new Date(reviewedAt).toISOString().slice(0, 10)}` : "Not reviewed yet"}</p>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-cyan-100">Work this like a readiness coach: understand what good looks like, write implementation details, attach evidence references, then decide whether it is strong enough for a buyer conversation.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(22rem,0.55fr)] xl:p-8">
        <section className="grid gap-4" aria-label="Control work area">
          <div className="rounded-[1.7rem] border border-cyan-200 bg-[linear-gradient(180deg,#ecfeff_0%,#ffffff_100%)] p-5 shadow-sm ring-1 ring-cyan-100">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-800">Primary workflow</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-950">Ownership and review</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Assign who owns this control, set its working status, and move it through review.</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${error ? "bg-rose-50 text-rose-700" : dirty ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{error ? "Save failed" : saving ? "Saving…" : dirty ? "Unsaved" : saved ?? "Saved"}</span>
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.7fr]">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-800">Control owner</span>
                <select
                value={ownerMembershipId}
                onChange={(event) => {
                  setOwnerMembershipId(event.target.value);
                  setDirty(true);
                }}
                className="w-full rounded-[1rem] border border-cyan-100 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-cyan-400"
              >
                <option value="">Unassigned</option>
                {activeMembers.map((member) => (
                  <option key={member.membershipId} value={member.membershipId}>
                    {memberLabel(member)}
                  </option>
                ))}
                </select>
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-800">Status</span>
                <select
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value as typeof status);
                    setDirty(true);
                  }}
                  className="w-full rounded-[1rem] border border-cyan-100 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-cyan-400"
                >
                  {statuses.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => saveControl("request-review")} disabled={saving} className="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-800 transition hover:bg-sky-100 disabled:opacity-60">
                  Mark ready for review
                </button>
                <button type="button" onClick={() => saveControl("mark-reviewed")} disabled={saving} className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-60">
                  Mark reviewed
                </button>
                {reviewedAt ? (
                  <button type="button" onClick={() => saveControl("clear-review")} disabled={saving} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60">
                    Clear review date
                  </button>
                ) : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => saveControl()}
                  disabled={saving}
                  className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
                >
                  {saving ? "Saving…" : dirty ? "Save changes" : saved ?? "Save control"}
                </button>
              </div>
              <p className="mt-3 text-xs leading-6 text-slate-600">Use ready for review when the note and evidence could survive a buyer/security reviewer asking “show me.” Mark reviewed when that internal review is complete.</p>
              {activeMembers.length === 0 ? <p className="mt-3 text-xs leading-6 text-amber-700">No active members loaded. Add team members before assigning owners.</p> : null}
            </div>
          <div className="rounded-[1.7rem] border border-cyan-200 bg-[linear-gradient(180deg,#ecfeff_0%,#ffffff_100%)] p-5 shadow-sm ring-1 ring-cyan-100">
            <div className="flex flex-col gap-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-800">Primary workflow</p>
              <h3 className="text-xl font-semibold text-slate-950">Evidence and quality check</h3>
              <p className="text-sm leading-6 text-slate-600">Attach the proof that supports the owner’s review decision.</p>
            </div>
              <div className="mt-4 rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Evidence that usually helps prove this</p>
                <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
                  {control.evidenceExamples.map((example) => (
                    <li key={example} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-500" />
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 rounded-[1.2rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
                <p className="font-semibold">Before marking complete, check:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Does the record show where proof lives?</li>
                  <li>Would someone outside the team understand it?</li>
                  <li>Is it current enough for a buyer conversation?</li>
                </ul>
              </div>
              <form id={`add-evidence-${control.id}`} onSubmit={addEvidence} className="mt-4 grid gap-3 rounded-[1.2rem] border border-cyan-200 bg-white p-4 shadow-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-800">Add evidence to this control</p>
                  <p className="mt-1 text-xs leading-5 text-cyan-950">Record the document, screenshot, spreadsheet, or policy location that supports these implementation details.</p>
                </div>
                <input
                  value={evidenceTitle}
                  onChange={(event) => setEvidenceTitle(event.target.value)}
                  placeholder="Evidence title, e.g. Quarterly access review export"
                  className="rounded-[0.9rem] border border-cyan-100 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-400"
                />
                <input
                  value={evidenceLocation}
                  onChange={(event) => setEvidenceLocation(event.target.value)}
                  placeholder="Storage path / reference, e.g. SharePoint > CPCSC > Access Reviews"
                  className="rounded-[0.9rem] border border-cyan-100 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-400"
                />
                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                  <select
                    value={evidenceType}
                    onChange={(event) => setEvidenceType(event.target.value)}
                    className="rounded-[0.9rem] border border-cyan-100 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-400"
                  >
                    <option>Document</option>
                    <option>Screenshot</option>
                    <option>Spreadsheet</option>
                    <option>Policy</option>
                    <option>Procedure</option>
                    <option>Ticket</option>
                    <option>Other</option>
                  </select>
                  <button type="submit" disabled={savingEvidence} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60">
                    {savingEvidence ? "Adding…" : "Add evidence"}
                  </button>
                </div>
                {evidenceMessage ? <p className="text-xs font-medium text-emerald-700">{evidenceMessage}</p> : null}
              </form>

              <div className="mt-4 grid gap-3">
                {evidenceItems.length === 0 ? (
                  <div className="rounded-[1.2rem] border border-dashed border-slate-300 bg-white px-4 py-4 text-sm text-slate-500">
                    No evidence attached yet. Add a register entry that points to where the proof lives, not just a note saying the control exists.
                  </div>
                ) : (
                  evidenceItems.map((item) => (
                    <div key={item.id} className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-slate-900">{item.title}</p>
                          <p className="mt-1 text-slate-500">{item.location}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">{item.artifactType ?? "Document"}</p>
                        </div>
                      </div>
                      <EvidenceRecordActions evidence={item} controlId={control.id} controls={[{ id: control.id, displayId: control.displayId, title: control.title }]} />
                    </div>
                  ))
                )}
              </div>
            </div>
          <div className="rounded-[1.7rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-sm">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-700">Implementation details</h3>
            <div className="mt-4 rounded-[1.2rem] border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm leading-7 text-cyan-950">
              <p className="font-semibold">Example implementation</p>
              <p className="mt-1">{control.exampleImplementation}</p>
            </div>
            <textarea
              value={implementationDetails}
              onChange={(event) => {
                setImplementationDetails(event.target.value);
                setDirty(true);
              }}
              rows={4}
              placeholder="Describe how this control is implemented today, who owns it, how often it is reviewed, and what evidence supports it. Avoid vague claims like ‘we have a process.’"
              className="mt-4 w-full rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-700 outline-none transition focus:border-cyan-400"
            />
          </div>
          {error ? <p className="text-sm text-rose-500">{error}</p> : null}
        </section>

        <aside className="grid content-start gap-3 xl:sticky xl:top-6">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Guidance</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-950">What this control expects</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{control.objective}</p>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
              {control.whatToDo.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <details className="rounded-[1.5rem] border border-cyan-100 bg-cyan-50/80 p-4 shadow-sm" open>
            <summary className="cursor-pointer text-sm font-semibold text-cyan-950">What good looks like</summary>
            <p className="mt-3 text-sm leading-6 text-cyan-950">{control.readinessGuidance.plainEnglishGoal}</p>
            <p className="mt-3 rounded-[1rem] border border-cyan-200 bg-white/80 px-3 py-2 text-sm leading-6 text-cyan-950">
              <span className="font-semibold">Suggested next action:</span> {control.readinessGuidance.suggestedNextAction}
            </p>
          </details>

          <details className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-4 shadow-sm">
            <summary className="cursor-pointer text-sm font-semibold text-slate-800">Examples and buyer prompts</summary>
            <div className="mt-3 grid gap-3">
              <div className="rounded-[1rem] border border-amber-200 bg-amber-50 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-800">Weak answer</p>
                <p className="mt-1 text-sm leading-6 text-amber-950">“{control.readinessGuidance.weakImplementationExample}”</p>
              </div>
              <div className="rounded-[1rem] border border-emerald-200 bg-emerald-50 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">Stronger answer</p>
                <p className="mt-1 text-sm leading-6 text-emerald-950">“{control.readinessGuidance.strongImplementationExample}”</p>
              </div>
              <ul className="space-y-2 text-sm leading-6 text-slate-700">
                {control.readinessGuidance.buyerQuestions.map((question) => (
                  <li key={question} className="rounded-[0.9rem] border border-slate-200 bg-slate-50 px-3 py-2">{question}</li>
                ))}
              </ul>
            </div>
          </details>

          <details className="rounded-[1.5rem] border border-rose-100 bg-rose-50 p-4 shadow-sm">
            <summary className="cursor-pointer text-sm font-semibold text-rose-950">Common mistakes</summary>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-rose-950">
              {control.readinessGuidance.commonMistakes.map((mistake) => (
                <li key={mistake} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
                  <span>{mistake}</span>
                </li>
              ))}
            </ul>
          </details>
        </aside>

      </div>
    </article>
  );
}

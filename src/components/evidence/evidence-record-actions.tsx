"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ControlOption = {
  id: string;
  displayId: string;
  title: string;
};

type EvidenceRecordActionsProps = {
  evidence: {
    id: string;
    title: string;
    location?: string | null;
    artifactType?: string | null;
    status?: string | null;
  };
  controlId: string;
  controls: ControlOption[];
};

const artifactTypes = ["Document", "Screenshot", "Spreadsheet", "Policy", "Procedure", "Ticket", "Other"];

export function EvidenceRecordActions({ evidence, controlId, controls }: EvidenceRecordActionsProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(evidence.title);
  const [location, setLocation] = useState(evidence.location ?? "");
  const [artifactType, setArtifactType] = useState(evidence.artifactType ?? "Document");
  const [selectedControlId, setSelectedControlId] = useState(controlId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/evidence/${evidence.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, location, artifactType, controlId: selectedControlId, status: evidence.status ?? "active" }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to update evidence.");
      }

      setEditing(false);
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to update evidence.");
    } finally {
      setSaving(false);
    }
  }

  async function archive() {
    if (!window.confirm("Archive this evidence record? The source file is not deleted; this only removes the active register entry.")) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/evidence/${evidence.id}`, { method: "DELETE" });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to archive evidence.");
      }

      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to archive evidence.");
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => setEditing(true)} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50">
          Edit
        </button>
        <button type="button" onClick={archive} disabled={saving} className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100 disabled:opacity-60">
          Archive
        </button>
        {error ? <span className="text-xs text-rose-500">{error}</span> : null}
      </div>
    );
  }

  return (
    <div className="mt-4 grid gap-3 rounded-[1rem] border border-slate-200 bg-slate-50 p-3">
      <input value={title} onChange={(event) => setTitle(event.target.value)} className="rounded-[0.8rem] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-400" />
      <input value={location} onChange={(event) => setLocation(event.target.value)} className="rounded-[0.8rem] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-400" />
      <div className="grid gap-2 md:grid-cols-2">
        <select value={artifactType} onChange={(event) => setArtifactType(event.target.value)} className="rounded-[0.8rem] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-400">
          {artifactTypes.map((type) => <option key={type}>{type}</option>)}
        </select>
        <select value={selectedControlId} onChange={(event) => setSelectedControlId(event.target.value)} className="rounded-[0.8rem] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-400">
          {controls.map((control) => (
            <option key={control.id} value={control.id}>{control.displayId}: {control.title}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={save} disabled={saving} className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800 disabled:opacity-60">
          {saving ? "Saving…" : "Save evidence"}
        </button>
        <button type="button" onClick={() => setEditing(false)} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50">
          Cancel
        </button>
        {error ? <span className="text-xs text-rose-500">{error}</span> : null}
      </div>
    </div>
  );
}

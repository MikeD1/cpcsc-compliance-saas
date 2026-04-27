"use client";

import { useMemo, useState } from "react";

type EvidenceCaptureProps = {
  controls: Array<{
    id: string;
    displayId: string;
    title: string;
    category: string;
  }>;
};

export function EvidenceCapture({ controls }: EvidenceCaptureProps) {
  const defaultControlId = useMemo(() => controls[0]?.id ?? "", [controls]);
  const [controlId, setControlId] = useState(defaultControlId);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [artifactType, setArtifactType] = useState("Document");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSaved(null);
    setError(null);

    try {
      const response = await fetch("/api/evidence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ controlId, title, location, artifactType }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to add evidence.");
      }

      setTitle("");
      setLocation("");
      setArtifactType("Document");
      setSaved("Evidence added");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to add evidence.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Add evidence record</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Record where supporting evidence lives</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">This register stores evidence metadata and references. Keep the source file in your approved system of record until file upload support is added.</p>
        </div>
        {saved ? <span className="text-sm font-medium text-emerald-700">{saved}</span> : null}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Control</span>
          <select
            value={controlId}
            onChange={(event) => setControlId(event.target.value)}
            className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400"
          >
            {controls.map((control) => (
              <option key={control.id} value={control.id}>
                {control.displayId}: {control.title}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Artifact type</span>
          <select
            value={artifactType}
            onChange={(event) => setArtifactType(event.target.value)}
            className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400"
          >
            <option>Document</option>
            <option>Screenshot</option>
            <option>Spreadsheet</option>
            <option>Policy</option>
          </select>
        </label>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Evidence title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Quarterly access review export"
            className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Storage path / reference</span>
          <input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="SharePoint > CPCSC > Access Reviews > 2026-Q2"
            className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400"
          />
        </label>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {saving ? "Saving evidence…" : "Add evidence record"}
        </button>
        {error ? <p className="text-sm text-rose-500">{error}</p> : null}
      </div>
    </form>
  );
}

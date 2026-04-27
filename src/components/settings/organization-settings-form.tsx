"use client";

import { useState } from "react";

export function OrganizationSettingsForm({
  organizationName,
  primaryContactName,
  primaryContactEmail,
}: {
  organizationName: string;
  primaryContactName: string;
  primaryContactEmail: string | null;
}) {
  const [name, setName] = useState(organizationName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSaved(null);
    setError(null);

    try {
      const response = await fetch("/api/organization/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to save organization settings.");
      }

      setSaved("Settings saved");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to save organization settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form id="organization-profile" onSubmit={handleSubmit} className="scroll-mt-28 rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] lg:p-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Organization profile</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Workspace identity</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Start here when you land from the first-run checklist. Confirm the workspace identity, then move down to billing, members, and invitations.
          </p>
        </div>
        {saved ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">{saved}</span> : null}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Organization name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Primary contact</span>
          <input
            value={primaryContactName || primaryContactEmail || "Not set"}
            readOnly
            className="rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none"
          />
        </label>
      </div>

      <div className="mt-6 rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-7 text-amber-900">
        Coming next: editable CanadaBuys ID, readiness scope, systems/assets in scope, and richer primary contact details after the Supabase schema is formalized.
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save settings"}
        </button>
        {error ? <p className="text-sm text-rose-500">{error}</p> : null}
      </div>
    </form>
  );
}

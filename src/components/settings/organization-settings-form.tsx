"use client";

import { useState } from "react";

type OrganizationSettingsFormProps = {
  organizationName: string;
  canadaBuysId?: string | null;
  primaryContactName: string;
  primaryContactEmail: string | null;
  readinessScope?: string | null;
  systemsInScope?: string | null;
  attestationCycleStartedAt?: string | null;
  attestationCompletedAt?: string | null;
  attestationExpiresAt?: string | null;
  siInformationInventory?: string | null;
  siStorageLocations?: string | null;
  siPeopleAccess?: string | null;
  siCloudServices?: string | null;
  shortSecurityRules?: string | null;
};

export function OrganizationSettingsForm({
  organizationName,
  canadaBuysId,
  primaryContactName,
  primaryContactEmail,
  readinessScope,
  systemsInScope,
  attestationCycleStartedAt,
  attestationCompletedAt,
  attestationExpiresAt,
  siInformationInventory,
  siStorageLocations,
  siPeopleAccess,
  siCloudServices,
  shortSecurityRules,
}: OrganizationSettingsFormProps) {
  const [form, setForm] = useState({
    name: organizationName,
    canadaBuysId: canadaBuysId ?? "",
    primaryContactName: primaryContactName ?? "",
    primaryContactEmail: primaryContactEmail ?? "",
    readinessScope: readinessScope ?? "",
    systemsInScope: systemsInScope ?? "",
    attestationCycleStartedAt: attestationCycleStartedAt ?? "",
    attestationCompletedAt: attestationCompletedAt ?? "",
    attestationExpiresAt: attestationExpiresAt ?? "",
    siInformationInventory: siInformationInventory ?? "",
    siStorageLocations: siStorageLocations ?? "",
    siPeopleAccess: siPeopleAccess ?? "",
    siCloudServices: siCloudServices ?? "",
    shortSecurityRules: shortSecurityRules ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSaved(null);
    setError(null);

    try {
      const response = await fetch("/api/organization/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">CPCSC self-assessment workspace settings</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            Capture the supplier identity, CanadaBuys reference, attestation dates, SI scope, and short security rules that feed the readiness package.
          </p>
        </div>
        {saved ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">{saved}</span> : null}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Field label="Organization name" value={form.name} onChange={(value) => updateField("name", value)} />
        <Field label="CanadaBuys supplier ID" value={form.canadaBuysId} onChange={(value) => updateField("canadaBuysId", value)} placeholder="Supplier identifier used for contract/attestation records" />
        <Field label="Primary contact name" value={form.primaryContactName} onChange={(value) => updateField("primaryContactName", value)} />
        <Field label="Primary contact email" value={form.primaryContactEmail} onChange={(value) => updateField("primaryContactEmail", value)} />
        <Field label="Attestation cycle start" type="date" value={form.attestationCycleStartedAt} onChange={(value) => updateField("attestationCycleStartedAt", value)} />
        <Field label="Self-assessment completed" type="date" value={form.attestationCompletedAt} onChange={(value) => updateField("attestationCompletedAt", value)} />
        <Field label="Attestation expiry / renewal date" type="date" value={form.attestationExpiresAt} onChange={(value) => updateField("attestationExpiresAt", value)} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <TextArea label="Readiness scope" value={form.readinessScope} onChange={(value) => updateField("readinessScope", value)} placeholder="Which contract, business unit, facilities, and work are covered by this Level 1 workspace?" />
        <TextArea label="Systems in scope" value={form.systemsInScope} onChange={(value) => updateField("systemsInScope", value)} placeholder="List systems, networks, endpoints, repositories, and operational tools that handle or support SI." />
        <TextArea label="Specified Information content inventory" value={form.siInformationInventory} onChange={(value) => updateField("siInformationInventory", value)} placeholder="What federal SI content exists: documents, drawings, contract data, emails, exports, records, or datasets?" />
        <TextArea label="SI storage locations" value={form.siStorageLocations} onChange={(value) => updateField("siStorageLocations", value)} placeholder="Where GC/SI information is stored: SharePoint, file shares, email, cloud drives, backups, ticketing systems, endpoints." />
        <TextArea label="People and access" value={form.siPeopleAccess} onChange={(value) => updateField("siPeopleAccess", value)} placeholder="Which employees, roles, contractors, admins, and service providers can access SI?" />
        <TextArea label="Cloud services and tools" value={form.siCloudServices} onChange={(value) => updateField("siCloudServices", value)} placeholder="Which SaaS/cloud/security/collaboration tools handle SI or metadata about SI?" />
      </div>

      <div className="mt-6">
        <TextArea label="Short security rules / policy notes" value={form.shortSecurityRules} onChange={(value) => updateField("shortSecurityRules", value)} placeholder="Paste or adapt short rules for approved systems, passwords/MFA, account access, devices, media disposal, and public content review." rows={6} />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save self-assessment settings"}
        </button>
        {error ? <p className="text-sm text-rose-500">{error}</p> : null}
      </div>
    </form>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400"
      />
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder, rows = 4 }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; rows?: number }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-900 outline-none transition focus:border-cyan-400"
      />
    </label>
  );
}

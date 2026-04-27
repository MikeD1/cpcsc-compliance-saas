"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AcceptInviteForm({ token, signedInEmail }: { token: string; signedInEmail: string | null }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function acceptInvite() {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/organization/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to accept invitation.");
      }

      router.push("/dashboard?invite=accepted");
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to accept invitation.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-6 grid gap-4">
      <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-700">
        Signed in as <span className="font-medium text-slate-950">{signedInEmail ?? "unknown email"}</span>. Make sure this matches the invitation email before accepting.
      </div>
      <button type="button" onClick={acceptInvite} disabled={saving} className="inline-flex w-fit items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60">
        {saving ? "Accepting…" : "Accept invitation"}
      </button>
      {error ? <p className="text-sm text-rose-500">{error}</p> : null}
    </div>
  );
}

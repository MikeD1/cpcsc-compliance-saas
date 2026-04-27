"use client";

import { useMemo, useState } from "react";

type Invitation = {
  id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
  created_at: string;
};

type TeamInvitationsProps = {
  canInvite: boolean;
  initialInvitations: Invitation[];
};

export function TeamInvitations({ canInvite, initialInvitations }: TeamInvitationsProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [invitations, setInvitations] = useState(initialInvitations);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pendingInvitations = useMemo(() => invitations.filter((invite) => invite.status === "pending"), [invitations]);

  async function submitInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setInviteUrl(null);

    try {
      const response = await fetch("/api/organization/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to create invitation.");
      }

      setInvitations((current) => [payload.invitation, ...current]);
      setInviteUrl(payload.inviteUrl ?? null);
      setEmail("");
      setRole("member");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to create invitation.");
    } finally {
      setSaving(false);
    }
  }

  async function revokeInvitation(invitationId: string) {
    setError(null);

    try {
      const response = await fetch(`/api/organization/invitations/${invitationId}`, { method: "DELETE" });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to revoke invitation.");
      }

      setInvitations((current) => current.map((invite) => (invite.id === invitationId ? { ...invite, status: "revoked" } : invite)));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to revoke invitation.");
    }
  }

  return (
    <section className="rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] lg:p-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Team invitations</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Invite teammates into this workspace</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Owners and admins can create invite links for teammates. Email delivery is intentionally manual until transactional email is configured.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">{pendingInvitations.length} pending</span>
      </div>

      {canInvite ? (
        <form onSubmit={submitInvite} className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-end">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Email address</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400"
              placeholder="teammate@example.com"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Role</span>
            <select value={role} onChange={(event) => setRole(event.target.value)} className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400">
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <button type="submit" disabled={saving} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60">
            {saving ? "Creating…" : "Create invite"}
          </button>
        </form>
      ) : (
        <div className="mt-6 rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-7 text-amber-900">
          Only organization owners and admins can invite teammates.
        </div>
      )}

      {inviteUrl ? (
        <div className="mt-5 rounded-[1.25rem] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-7 text-emerald-900">
          Invite created. Copy and send this link manually: <span className="break-all font-medium">{inviteUrl}</span>
        </div>
      ) : null}
      {error ? <p className="mt-4 text-sm text-rose-500">{error}</p> : null}

      <div className="mt-6 grid gap-3">
        {invitations.length === 0 ? (
          <div className="rounded-[1.4rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">
            No invitations have been created yet.
          </div>
        ) : null}
        {invitations.map((invite) => (
          <div key={invite.id} className="grid gap-3 rounded-[1.4rem] border border-slate-200 bg-white px-4 py-4 shadow-sm lg:grid-cols-[1fr_auto_auto_auto] lg:items-center">
            <div>
              <p className="font-medium text-slate-950">{invite.email}</p>
              <p className="mt-1 text-sm text-slate-500">Expires {new Date(invite.expires_at).toISOString().slice(0, 10)}</p>
            </div>
            <span className="rounded-full bg-cyan-50 px-3 py-1 text-sm font-medium text-cyan-800">{invite.role}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">{invite.status}</span>
            {canInvite && invite.status === "pending" ? (
              <button type="button" onClick={() => revokeInvitation(invite.id)} className="text-sm font-medium text-rose-600 hover:text-rose-700">
                Revoke
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

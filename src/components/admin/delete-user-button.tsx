"use client";

import { useState } from "react";

export function DeleteUserButton({ userId, email, disabled = false }: { userId: string; email: string; disabled?: boolean }) {
  const [status, setStatus] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function deleteUser() {
    const typed = window.prompt(`Type DELETE to permanently delete ${email || userId}. This removes the Supabase auth user and linked profile/memberships.`);

    if (typed !== "DELETE") {
      return;
    }

    setDeleting(true);
    setStatus(null);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const text = await response.text();
      const result = text ? JSON.parse(text) : null;

      if (!response.ok) {
        throw new Error(result?.error || "Unable to delete user.");
      }

      setStatus("Deleted. Refreshing…");
      window.location.reload();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to delete user.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="grid gap-2">
      <button
        type="button"
        onClick={deleteUser}
        disabled={disabled || deleting}
        className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {deleting ? "Deleting…" : "Delete user"}
      </button>
      {status ? <p className="max-w-xs text-xs text-rose-600">{status}</p> : null}
    </div>
  );
}

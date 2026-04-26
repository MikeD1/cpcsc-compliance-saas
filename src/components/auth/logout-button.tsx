"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export function LogoutButton() {
  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    await supabase?.auth.signOut();

    const response = await fetch("/api/auth/logout", { method: "POST" });
    const result = await response.json();
    if (result.redirectTo) {
      window.location.href = result.redirectTo;
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
    >
      Log out
    </button>
  );
}

"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export function LogoutButton({ variant = "dark" }: { variant?: "dark" | "nav" }) {
  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    await supabase?.auth.signOut();

    const response = await fetch("/api/auth/logout", { method: "POST" });
    const result = await response.json();
    if (result.redirectTo) {
      window.location.href = result.redirectTo;
    }
  }

  const className =
    variant === "nav"
      ? "inline-flex items-center justify-center whitespace-nowrap rounded-[0.85rem] border border-rose-100 bg-white px-3 py-2.5 text-sm font-medium text-rose-700 outline-none transition hover:border-rose-200 hover:bg-rose-50 focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
      : "inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10";

  return (
    <button type="button" onClick={handleLogout} className={className}>
      Log out
    </button>
  );
}

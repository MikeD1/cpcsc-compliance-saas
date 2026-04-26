"use client";

import { useState } from "react";
import { PasswordInput } from "@/components/auth/password-input";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = getSupabaseBrowserClient();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      if (!supabase) {
        throw new Error("Supabase auth is not configured yet.");
      }

      const loginResponse = await supabase.auth.signInWithPassword({ email, password });
      if (loginResponse.error) {
        throw loginResponse.error;
      }

      const session = loginResponse.data.session;
      if (!session) {
        throw new Error("Unable to establish a session.");
      }

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({}),
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : null;

      if (!response.ok) {
        throw new Error(result?.error || "Unable to log in.");
      }

      window.location.href = result?.redirectTo || "/dashboard";
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to log in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form method="post" action="/login" className="grid gap-5" onSubmit={handleSubmit}>
      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-700">Work email</span>
        <input
          name="email"
          type="email"
          placeholder="you@company.ca"
          className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-cyan-400"
        />
      </label>

      <PasswordInput id="password" name="password" label="Password" placeholder="Enter your password" />

      <button className="rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800" disabled={loading}>
        {loading ? "Logging in…" : "Log in"}
      </button>

      {error ? <p className="text-sm text-rose-500">{error}</p> : null}
    </form>
  );
}

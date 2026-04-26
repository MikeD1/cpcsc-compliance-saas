"use client";

import { useState } from "react";
import { PasswordInput } from "@/components/auth/password-input";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export function SignupForm({ initialPlan = "start" }: { initialPlan?: "start" | "growth" }) {
  const [plan, setPlan] = useState<"start" | "growth">(initialPlan);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = getSupabaseBrowserClient();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    const email = String(payload.email ?? "").trim();
    const password = String(payload.password ?? "");
    const confirmPassword = String(payload.confirmPassword ?? "");
    const firstName = String(payload.firstName ?? "").trim();
    const lastName = String(payload.lastName ?? "").trim();
    const organizationName = String(payload.organizationName ?? "").trim();

    if (!firstName || !lastName || !email || !organizationName || !password || !confirmPassword) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 12) {
      setError("Password must be at least 12 characters.");
      setLoading(false);
      return;
    }

    try {
      if (!supabase) {
        throw new Error("Supabase auth is not configured yet.");
      }

      const redirectBase = window.location.origin;
      const signupResponse = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${redirectBase}/login`,
          data: {
            first_name: firstName,
            last_name: lastName,
            organization_name: organizationName,
            selected_plan: plan,
          },
        },
      });

      if (signupResponse.error) {
        throw signupResponse.error;
      }

      const session = signupResponse.data.session;
      if (!session) {
        window.location.href = `/login?signup=check-email&plan=${plan}`;
        return;
      }

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          organizationName,
          plan,
        }),
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : null;

      if (!response.ok) {
        throw new Error(result?.error || "Unable to create account.");
      }

      if (result?.redirectTo) {
        window.location.href = result.redirectTo;
        return;
      }

      window.location.href = "/dashboard";
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form method="post" action="/signup" className="grid gap-5" onSubmit={handleSubmit}>
      <div className="grid gap-3 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-700">Choose your plan</p>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            { slug: "start", label: "Start", price: "$149 CAD/mo" },
            { slug: "growth", label: "Growth", price: "$349 CAD/mo" },
          ].map((option) => (
            <button
              key={option.slug}
              type="button"
              onClick={() => setPlan(option.slug as "start" | "growth")}
              className={`rounded-[1rem] border px-4 py-4 text-left transition ${
                plan === option.slug ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              <p className="text-sm font-semibold">{option.label}</p>
              <p className={`mt-1 text-xs ${plan === option.slug ? "text-slate-300" : "text-slate-500"}`}>{option.price}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">First name</span>
          <input name="firstName" type="text" placeholder="Maya" className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-cyan-400" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Last name</span>
          <input name="lastName" type="text" placeholder="Chen" className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-cyan-400" />
        </label>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-700">Work email</span>
        <input name="email" type="email" placeholder="you@company.ca" className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-cyan-400" />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-700">Organization name</span>
        <input name="organizationName" type="text" placeholder="Northstar Defence Systems" className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-cyan-400" />
      </label>

      <PasswordInput id="password" name="password" label="Password" placeholder="Create a strong password" />
      <PasswordInput id="confirm-password" name="confirmPassword" label="Confirm password" placeholder="Re-enter your password" />

      <div className="grid gap-3 rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">
        <p>Password best practices: use 12+ characters, mix words and symbols, avoid reusing credentials, and confirm the password carefully before continuing.</p>
        <p>Next step: after your account is created, you will be sent to Stripe checkout for the selected plan. Your workspace unlocks when the subscription is active.</p>
      </div>

      <button className="rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800" disabled={loading}>
        {loading ? "Creating account…" : "Create account and continue to secure checkout"}
      </button>

      {error ? <p className="text-sm text-rose-500">{error}</p> : null}
    </form>
  );
}

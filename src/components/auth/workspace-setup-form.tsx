"use client";

import { useState } from "react";

export function WorkspaceSetupForm({
  email,
  initialPlan = "start",
  firstName = "",
  lastName = "",
}: {
  email: string;
  initialPlan?: "start" | "growth";
  firstName?: string | null;
  lastName?: string | null;
}) {
  const [plan, setPlan] = useState<"start" | "growth">(initialPlan);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    const submittedFirstName = String(payload.firstName ?? "").trim();
    const submittedLastName = String(payload.lastName ?? "").trim();
    const organizationName = String(payload.organizationName ?? "").trim();

    if (!submittedFirstName || !submittedLastName || !organizationName) {
      setError("Name and organization are required to finish workspace setup.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: submittedFirstName,
          lastName: submittedLastName,
          email,
          organizationName,
          plan,
        }),
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : null;

      if (!response.ok) {
        throw new Error(result?.error || "Unable to finish workspace setup.");
      }

      window.location.href = result?.redirectTo || "/dashboard";
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to finish workspace setup.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form method="post" className="grid gap-5" onSubmit={handleSubmit}>
      <div className="rounded-[1.25rem] border border-cyan-100 bg-cyan-50 px-4 py-4 text-sm leading-7 text-slate-700">
        You are already signed in as <span className="font-medium text-slate-950">{email}</span>. Finish creating the workspace for this account, then continue to checkout.
      </div>

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
          <input name="firstName" type="text" defaultValue={firstName ?? ""} className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-cyan-400" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Last name</span>
          <input name="lastName" type="text" defaultValue={lastName ?? ""} className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-cyan-400" />
        </label>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-700">Organization name</span>
        <input name="organizationName" type="text" placeholder="Your Defence Systems Ltd." className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-cyan-400" />
      </label>

      <button className="rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800" disabled={loading}>
        {loading ? "Creating workspace…" : "Finish workspace setup and continue to checkout"}
      </button>

      {error ? <p className="text-sm text-rose-500">{error}</p> : null}
    </form>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@complianceone.ca";

function formatStatus(status?: string | null) {
  if (!status) {
    return "Incomplete";
  }

  return status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function SubscriptionGate({
  plan,
  status,
  organizationId,
}: {
  plan?: string | null;
  status?: string | null;
  organizationId?: string | null;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const checkoutHref = organizationId && plan ? `/api/billing/checkout-link?plan=${plan}&organizationId=${organizationId}` : "/pricing";

  async function recheckBilling() {
    if (!organizationId) {
      setMessage("Unable to recheck billing because this workspace is missing organization context. Contact support for help.");
      return;
    }

    setChecking(true);
    setMessage(null);

    try {
      const response = await fetch("/api/billing/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId }),
      });
      const text = await response.text();
      const result = text ? JSON.parse(text) : null;

      if (!response.ok) {
        throw new Error(result?.error || "Billing is not active yet.");
      }

      if (result?.status === "active" || result?.status === "trialing") {
        window.location.href = "/dashboard?billing=rechecked";
        return;
      }

      setMessage(`Stripe returned ${formatStatus(result?.status)}. Complete checkout or contact support if this looks wrong.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to recheck billing right now.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,#07111f_0%,#0b1831_36%,#103560_100%)] p-8 text-white shadow-[0_30px_90px_rgba(15,23,42,0.25)]">
      <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-300">Workspace activation</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Finish activating your ComplianceOne workspace</h1>
      <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
        Your account has been created, but billing is not active yet. Resume checkout for this organization or recheck billing if you already completed payment.
      </p>
      <div className="mt-6 grid gap-3 text-sm text-slate-200 md:grid-cols-2">
        <div className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3">Selected plan: {plan ?? "Not selected"}</div>
        <div className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3">Billing status: {formatStatus(status)}</div>
      </div>
      <div className="mt-6 rounded-[1.25rem] border border-cyan-300/20 bg-cyan-300/10 px-4 py-4 text-sm leading-7 text-cyan-50">
        If checkout completed but this page still appears, billing confirmation may still be processing. Use “Recheck billing” first. If it remains inactive, email {SUPPORT_EMAIL} with your organization name and checkout email.
      </div>
      {message ? <p className="mt-4 rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100">{message}</p> : null}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={checkoutHref} className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-100">
          Resume checkout
        </Link>
        <button type="button" onClick={recheckBilling} disabled={checking} className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60">
          {checking ? "Checking…" : "Recheck billing"}
        </button>
        <Link href="/contact" className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10">
          Contact support
        </Link>
      </div>
    </section>
  );
}

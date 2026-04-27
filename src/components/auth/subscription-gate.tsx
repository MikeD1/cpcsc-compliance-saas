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
  billingIssue,
}: {
  plan?: string | null;
  status?: string | null;
  organizationId?: string | null;
  billingIssue?: string | null;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [startingCheckout, setStartingCheckout] = useState<string | null>(null);
  const normalizedPlan = plan === "growth" ? "growth" : "start";
  const checkoutHref = organizationId ? `/api/billing/checkout-link?plan=${normalizedPlan}&organizationId=${organizationId}` : "/pricing?activation=1";
  const billingIssueMessage =
    billingIssue === "missing_config"
      ? "Checkout could not start because Stripe plan IDs or the Stripe secret key are not configured in this deployment. Add the Stripe environment variables, redeploy, then resume checkout here."
      : null;

  async function startCheckout(selectedPlan: "start" | "growth") {
    if (!organizationId) {
      window.location.href = "/pricing";
      return;
    }

    setStartingCheckout(selectedPlan);
    setMessage(null);

    try {
      const response = await fetch("/api/billing/resume-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan, organizationId }),
      });
      const text = await response.text();
      const result = text ? JSON.parse(text) : null;

      if (!response.ok || !result?.url) {
        throw new Error(result?.error || "Checkout could not be started.");
      }

      window.location.href = result.url;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Checkout could not be started.");
    } finally {
      setStartingCheckout(null);
    }
  }

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
        Your account has been created, but billing is not active yet. Resume checkout for this existing organization here; you do not need to create another account.
      </p>
      <div className="mt-6 grid gap-3 text-sm text-slate-200 md:grid-cols-2">
        <div className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3">Selected plan: {normalizedPlan}</div>
        <div className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3">Billing status: {formatStatus(status)}</div>
      </div>
      <div className="mt-6 rounded-[1.25rem] border border-cyan-300/20 bg-cyan-300/10 px-4 py-4 text-sm leading-7 text-cyan-50">
        If checkout completed but this page still appears, billing confirmation may still be processing. Use “Recheck billing” first. If it remains inactive, email {SUPPORT_EMAIL} with your organization name and checkout email.
      </div>
      {billingIssueMessage ? <p className="mt-4 rounded-[1rem] border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-50">{billingIssueMessage}</p> : null}
      {message ? <p className="mt-4 rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100">{message}</p> : null}
      <div className="mt-8 flex flex-wrap gap-3">
        {organizationId ? (
          <>
            <button type="button" onClick={() => startCheckout(normalizedPlan)} disabled={Boolean(startingCheckout)} className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60">
              {startingCheckout === normalizedPlan ? "Opening checkout…" : `Resume ${normalizedPlan} checkout`}
            </button>
            <button type="button" onClick={() => startCheckout("start")} disabled={Boolean(startingCheckout)} className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60">
              {startingCheckout === "start" ? "Opening…" : "Use Start plan"}
            </button>
            <button type="button" onClick={() => startCheckout("growth")} disabled={Boolean(startingCheckout)} className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60">
              {startingCheckout === "growth" ? "Opening…" : "Use Growth plan"}
            </button>
          </>
        ) : (
          <Link href={checkoutHref} className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-100">
            Choose plan
          </Link>
        )}
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

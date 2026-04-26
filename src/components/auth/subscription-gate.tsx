import Link from "next/link";

function formatStatus(status?: string | null) {
  if (!status) {
    return "Incomplete";
  }

  return status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function SubscriptionGate({ plan, status }: { plan?: string | null; status?: string | null }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,#07111f_0%,#0b1831_36%,#103560_100%)] p-8 text-white shadow-[0_30px_90px_rgba(15,23,42,0.25)]">
      <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-300">Workspace activation</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Finish activating your ComplianceOne workspace</h1>
      <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
        Your account has been created, but your paid workspace is not active yet. Complete checkout from pricing, then return here to continue CPCSC readiness work.
      </p>
      <div className="mt-6 grid gap-3 text-sm text-slate-200 md:grid-cols-2">
        <div className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3">Selected plan: {plan ?? "Not selected"}</div>
        <div className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3">Billing status: {formatStatus(status)}</div>
      </div>
      <div className="mt-6 rounded-[1.25rem] border border-cyan-300/20 bg-cyan-300/10 px-4 py-4 text-sm leading-7 text-cyan-50">
        If you already completed checkout, the billing confirmation may still be processing. Log out and back in after a moment, or contact support through your onboarding contact.
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/pricing" className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-100">
          Complete checkout
        </Link>
        <Link href="/contact" className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10">
          Contact support
        </Link>
      </div>
    </section>
  );
}

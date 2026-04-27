import Link from "next/link";

function formatStatus(status?: string | null) {
  return status ? status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) : "Unknown";
}

export function BillingSettingsCard({ plan, status }: { plan?: string | null; status?: string | null }) {
  return (
    <section id="billing" className="scroll-mt-28 rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Billing</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Subscription management</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Manage payment methods, invoices, plan changes, and cancellations through Stripe’s secure customer portal.
          </p>
        </div>
        <Link href="/api/billing/portal" className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
          Open billing portal
        </Link>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">Plan: {plan ?? "Not set"}</div>
        <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">Status: {formatStatus(status)}</div>
      </div>
      <p className="mt-4 text-xs leading-6 text-slate-500">
        If the portal is not available for a newly created workspace, complete checkout first or contact support with your organization name.
      </p>
    </section>
  );
}

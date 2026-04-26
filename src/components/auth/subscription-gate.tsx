import Link from "next/link";

export function SubscriptionGate({ plan, status }: { plan?: string | null; status?: string | null }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,#07111f_0%,#0b1831_36%,#103560_100%)] p-8 text-white shadow-[0_30px_90px_rgba(15,23,42,0.25)]">
      <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-300">Subscription required</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Finish activating your workspace</h1>
      <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
        Your account exists, but the paid workspace is not fully active yet. Complete billing or return to pricing to continue.
      </p>
      <div className="mt-6 grid gap-3 text-sm text-slate-200">
        <div>Current plan: {plan ?? "Not selected"}</div>
        <div>Subscription status: {status ?? "Incomplete"}</div>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/pricing" className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-100">
          Go to pricing
        </Link>
        <Link href="/login" className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10">
          Back to login
        </Link>
      </div>
    </section>
  );
}

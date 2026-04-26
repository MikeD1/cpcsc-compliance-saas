import { CheckoutButton } from "@/components/marketing/checkout-button";
import { PublicShell } from "@/components/marketing/public-shell";
import { getBillingPlansForDisplay } from "@/lib/plans";

const reassurance = [
  "Monthly billing through Stripe checkout",
  "Cancel or change plans through support while self-serve billing is being expanded",
  "No hidden implementation fees in the listed monthly price",
];

export default function PricingPage() {
  const billingPlans = getBillingPlansForDisplay();

  return (
    <PublicShell>
      <section className="rounded-[2.25rem] border border-white/10 bg-[linear-gradient(135deg,#07111f_0%,#0b1831_36%,#103560_100%)] p-8 text-white shadow-[0_40px_120px_rgba(7,16,31,0.38)] lg:p-10">
        <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-300">Pricing</p>
        <h1 className="mt-3 text-5xl font-semibold tracking-tight lg:text-6xl">Simple monthly plans for CPCSC Level 1 readiness.</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
          Choose the workspace size that matches your team. Both plans include the core control workspace, evidence organization, and reporting needed to manage readiness work.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        {billingPlans.map((tier) => (
          <article
            key={tier.name}
            className={`rounded-[2rem] border p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] ${
              tier.slug === "growth" ? "border-slate-950 bg-slate-950 text-white" : "border-white/50 bg-white/92 text-slate-900"
            }`}
          >
            <p className={`text-[11px] uppercase tracking-[0.28em] ${tier.slug === "growth" ? "text-cyan-300" : "text-cyan-700"}`}>{tier.name}</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight">${tier.priceCad.toFixed(2)} CAD</h2>
            <p className={`mt-1 text-sm ${tier.slug === "growth" ? "text-slate-400" : "text-slate-500"}`}>per month</p>
            <p className={`mt-4 text-sm leading-7 ${tier.slug === "growth" ? "text-slate-300" : "text-slate-600"}`}>{tier.description}</p>
            <div className="mt-6 grid gap-3">
              {tier.features.map((feature) => (
                <div
                  key={feature}
                  className={`rounded-[1.2rem] border px-4 py-3 text-sm ${
                    tier.slug === "growth" ? "border-white/10 bg-white/5 text-slate-100" : "border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                >
                  {feature}
                </div>
              ))}
            </div>
            <div className={`mt-6 rounded-[1.2rem] border px-4 py-3 text-sm leading-6 ${tier.slug === "growth" ? "border-white/10 bg-white/5 text-slate-300" : "border-cyan-100 bg-cyan-50 text-slate-600"}`}>
              {tier.slug === "growth"
                ? "Best for teams with multiple contributors, more evidence owners, and recurring leadership updates."
                : "Best for a small supplier or single compliance lead getting the readiness process organized."}
            </div>
            <CheckoutButton
              plan={tier.slug}
              className={`mt-4 inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-medium transition ${
                tier.slug === "growth"
                  ? "bg-white text-slate-950 hover:bg-slate-100"
                  : "bg-slate-950 text-white hover:bg-slate-800"
              }`}
            >
              Start with {tier.name}
            </CheckoutButton>
          </article>
        ))}
      </section>

      <section className="grid gap-4 rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] md:grid-cols-3">
        {reassurance.map((item) => (
          <div key={item} className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            {item}
          </div>
        ))}
      </section>
    </PublicShell>
  );
}

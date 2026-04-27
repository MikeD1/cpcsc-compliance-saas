import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdminAccess } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase";

export default async function AdminPage() {
  const { user, isAdmin } = await getCurrentAdminAccess();

  if (!user) {
    redirect("/login");
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
        <section className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-300">Admin</p>
          <h1 className="mt-3 text-4xl font-semibold">Admin access is restricted</h1>
          <p className="mt-4 text-sm leading-7 text-slate-300">Add your email to ADMIN_EMAILS to use the support console.</p>
          <Link href="/dashboard" className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-950">Back to dashboard</Link>
        </section>
      </main>
    );
  }

  const supabase = getSupabaseAdmin();
  const [{ data: organizations }, { data: subscriptions }, { data: billingCustomers }] = await Promise.all([
    supabase.from("organizations").select("id, name, slug, plan_code, subscription_status, created_at").order("created_at", { ascending: false }).limit(25),
    supabase.from("subscriptions").select("organization_id, stripe_subscription_id, plan_code, status, current_period_end, cancel_at_period_end").order("created_at", { ascending: false }).limit(100),
    supabase.from("billing_customers").select("organization_id, stripe_customer_id, billing_email").limit(100),
  ]);

  const subscriptionsByOrg = new Map((subscriptions ?? []).map((subscription) => [subscription.organization_id, subscription]));
  const billingByOrg = new Map((billingCustomers ?? []).map((customer) => [customer.organization_id, customer]));

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#163257_0%,transparent_28%),linear-gradient(180deg,#050b16_0%,#0b1630_18%,#eef3ff_18%,#f5f7fb_100%)] px-4 py-8 text-slate-900">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
        <section className="rounded-[2rem] border border-white/50 bg-white/92 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Support console</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 lg:text-5xl">Organization billing overview</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
            Read-only support view for private launch: inspect organization status, subscription state, and Stripe customer linkage. Manual overrides should happen in Stripe/Supabase until an audited admin workflow exists.
          </p>
        </section>

        <section className="grid gap-4">
          {(organizations ?? []).map((organization) => {
            const subscription = subscriptionsByOrg.get(organization.id);
            const billing = billingByOrg.get(organization.id);

            return (
              <article key={organization.id} className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-950">{organization.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">{organization.slug} · {organization.id}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-medium">
                    <span className="rounded-full bg-cyan-50 px-3 py-1 text-cyan-800">{organization.plan_code ?? "no plan"}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{organization.subscription_status ?? "unknown"}</span>
                  </div>
                </div>
                <dl className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                  <AdminDatum label="Stripe customer" value={billing?.stripe_customer_id ?? "Missing"} />
                  <AdminDatum label="Billing email" value={billing?.billing_email ?? "Missing"} />
                  <AdminDatum label="Subscription" value={subscription?.stripe_subscription_id ?? "Missing"} />
                  <AdminDatum label="Subscription status" value={subscription?.status ?? "Missing"} />
                  <AdminDatum label="Current period end" value={subscription?.current_period_end ?? "Missing"} />
                  <AdminDatum label="Cancel at period end" value={subscription?.cancel_at_period_end ? "Yes" : "No"} />
                </dl>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}

function AdminDatum({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3">
      <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</dt>
      <dd className="mt-2 break-all font-medium text-slate-900">{value}</dd>
    </div>
  );
}

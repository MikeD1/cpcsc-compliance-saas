import Link from "next/link";
import { redirect } from "next/navigation";
import { DeleteUserButton } from "@/components/admin/delete-user-button";
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
  const [{ data: organizations }, { data: subscriptions }, { data: billingCustomers }, authUsersResult, { data: profiles }, { data: memberships }] = await Promise.all([
    supabase.from("organizations").select("id, name, slug, plan_code, subscription_status, created_at").order("created_at", { ascending: false }).limit(25),
    supabase.from("subscriptions").select("organization_id, stripe_subscription_id, plan_code, status, current_period_end, cancel_at_period_end").order("created_at", { ascending: false }).limit(100),
    supabase.from("billing_customers").select("organization_id, stripe_customer_id, billing_email").limit(100),
    supabase.auth.admin.listUsers({ page: 1, perPage: 100 }),
    supabase.from("profiles").select("user_id, email, full_name, default_organization_id, created_at").limit(100),
    supabase.from("organization_memberships").select("user_id, organization_id, role, status, created_at").limit(300),
  ]);

  const subscriptionsByOrg = new Map((subscriptions ?? []).map((subscription) => [subscription.organization_id, subscription]));
  const billingByOrg = new Map((billingCustomers ?? []).map((customer) => [customer.organization_id, customer]));
  const organizationsById = new Map((organizations ?? []).map((organization) => [organization.id, organization]));
  const profilesByUserId = new Map((profiles ?? []).map((profile) => [profile.user_id, profile]));
  const membershipsByUserId = new Map<string, NonNullable<typeof memberships>[number][]>();

  for (const membership of memberships ?? []) {
    const existing = membershipsByUserId.get(membership.user_id) ?? [];
    existing.push(membership);
    membershipsByUserId.set(membership.user_id, existing);
  }

  const authUsers = authUsersResult.data.users;

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

        <section className="rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-rose-700">User cleanup</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Recent auth users</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                Admin-only deletion for beta cleanup. This removes the Supabase auth user plus linked profile and membership rows. It does not refund Stripe payments or delete organizations.
              </p>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
            <div className="grid grid-cols-[1.2fr_1fr_0.9fr_auto] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              <span>User</span>
              <span>Workspace</span>
              <span>Status</span>
              <span>Action</span>
            </div>
            <div className="divide-y divide-slate-100">
              {authUsers.map((authUser) => {
                const profile = profilesByUserId.get(authUser.id);
                const userMemberships = membershipsByUserId.get(authUser.id) ?? [];
                const primaryMembership = userMemberships[0];
                const organization = primaryMembership ? organizationsById.get(primaryMembership.organization_id) : null;
                const email = authUser.email ?? profile?.email ?? "Unknown email";
                const isSelf = authUser.id === user.id;

                return (
                  <div key={authUser.id} className="grid grid-cols-[1.2fr_1fr_0.9fr_auto] gap-3 px-4 py-4 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-950">{profile?.full_name ?? email}</p>
                      <p className="mt-1 break-all text-xs text-slate-500">{email}</p>
                      <p className="mt-1 break-all text-xs text-slate-400">{authUser.id}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800">{organization?.name ?? "No workspace"}</p>
                      <p className="mt-1 break-all text-xs text-slate-500">{primaryMembership?.organization_id ?? "No membership"}</p>
                    </div>
                    <div className="text-xs text-slate-600">
                      <p>{primaryMembership ? `${primaryMembership.role} · ${primaryMembership.status}` : "No membership"}</p>
                      <p className="mt-1">Created {authUser.created_at ? new Date(authUser.created_at).toLocaleString() : "unknown"}</p>
                      {isSelf ? <p className="mt-1 font-semibold text-cyan-700">Current admin</p> : null}
                    </div>
                    <DeleteUserButton userId={authUser.id} email={email} disabled={isSelf} />
                  </div>
                );
              })}
            </div>
          </div>
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

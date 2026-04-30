import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { SubscriptionGate } from "@/components/auth/subscription-gate";
import { getCurrentAccess } from "@/lib/access";
import { resourceItems } from "@/lib/workspace-content";

const policyNeeds = [
  "Access control and need-to-know permissions",
  "Password, MFA, and account authentication rules",
  "Approved systems, devices, and acceptable use",
  "Media sanitization, destruction, and disposal",
  "Training, maintenance, review, and evidence retention records",
  "Public content review to prevent SI disclosure",
];

export default async function ResourcesPage() {
  const access = await getCurrentAccess();

  if (!access.user) redirect("/login");

  if (!access.hasActiveSubscription) {
    return (
      <AppShell organizationName={access.user.organization?.name}>
        <SubscriptionGate
          plan={access.latestSubscription?.planSlug}
          status={access.latestSubscription?.status}
          organizationId={access.user.organization?.id ?? access.user.organizationMembership?.organizationId}
        />
      </AppShell>
    );
  }

  return (
    <AppShell organizationName={access.user.organization?.name}>
      <section className="rounded-[2rem] border border-white/50 bg-white/92 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
        <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Tools and Templates</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 lg:text-5xl">Practical materials for the readiness package</h1>
        <p className="mt-5 max-w-4xl text-base leading-8 text-slate-600">
          Use these worksheets and starter templates to build the same working materials a consultant would usually ask for: scope, owners, assets, evidence, policies, and review records.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.82fr]">
        <div className="rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] lg:p-8">
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Downloadable resources</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Worksheets and templates</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {resourceItems.map((item) => (
              <Link key={item.title} href={item.href} className="rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md">
                <h3 className="text-base font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                <span className="mt-4 inline-flex text-sm font-semibold text-cyan-700">Download →</span>
              </Link>
            ))}
          </div>
        </div>

        <aside className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#0a1222_0%,#0f1d36_100%)] p-8 text-white shadow-[0_30px_90px_rgba(15,23,42,0.25)]">
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-300">Policy templates</p>
          <h2 className="mt-3 text-2xl font-semibold">What the evidence pack usually needs</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            The templates are not busywork. They help the organization show that security practices are written down, owned, reviewed, and tied back to the scoped SI environment.
          </p>
          <ul className="mt-5 grid gap-3 text-sm leading-6 text-slate-200">
            {policyNeeds.map((need) => <li key={need} className="rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3">{need}</li>)}
          </ul>
        </aside>
      </section>
    </AppShell>
  );
}

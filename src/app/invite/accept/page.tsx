import { redirect } from "next/navigation";
import { PublicShell } from "@/components/marketing/public-shell";
import { AcceptInviteForm } from "@/components/team/accept-invite-form";
import { getCurrentUser } from "@/lib/auth";

export default async function AcceptInvitePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const params = await searchParams;
  const token = params.token ?? "";
  const user = await getCurrentUser();

  if (!token) {
    redirect("/login?error=missing_invite");
  }

  return (
    <PublicShell>
      <section className="mx-auto max-w-2xl rounded-[2rem] border border-white/50 bg-white/92 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
        <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Team invitation</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Join a ComplianceOne workspace</h1>
        <p className="mt-4 text-base leading-8 text-slate-600">
          Accepting this invitation will add your signed-in account to the organization that invited you.
        </p>
        {user ? (
          <AcceptInviteForm token={token} signedInEmail={user.email} />
        ) : (
          <div className="mt-6 rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-7 text-amber-900">
            Sign in with the invited email address first, then return to this invitation link.
          </div>
        )}
      </section>
    </PublicShell>
  );
}

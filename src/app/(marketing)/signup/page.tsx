import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { redirectIfAuthenticated } from "@/components/auth/auth-redirect";
import { SignupForm } from "@/components/auth/signup-form";
import { PublicShell } from "@/components/marketing/public-shell";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  await redirectIfAuthenticated();

  const params = await searchParams;
  const initialPlan = params.plan === "growth" ? "growth" : "start";

  return (
    <PublicShell>
      <AuthCard
        title="Create your workspace"
        description="Start your organization with secure account setup, stronger password handling, and a clean path into subscription checkout and CPCSC readiness."
      >
        <SignupForm initialPlan={initialPlan} />

        <p className="mt-6 text-sm text-slate-500">
          Already have an account? <Link href="/login" className="font-medium text-cyan-700 hover:text-cyan-800">Log in</Link>
        </p>
      </AuthCard>
    </PublicShell>
  );
}

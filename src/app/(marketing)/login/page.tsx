import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { redirectIfAuthenticated } from "@/components/auth/auth-redirect";
import { LoginForm } from "@/components/auth/login-form";
import { PublicShell } from "@/components/marketing/public-shell";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ signup?: string; plan?: string; error?: string }>;
}) {
  await redirectIfAuthenticated();

  const params = await searchParams;
  const notice =
    params.signup === "check-email"
      ? "Check your email to confirm your account before logging in. After confirmation, return here to access your workspace and continue activation."
      : params.error === "unauthorized_billing"
        ? "Log in with the account that owns this organization before resuming checkout."
        : null;

  return (
    <PublicShell>
      <AuthCard
        title="Log in to ComplianceOne"
        description="Access your organization workspace, continue CPCSC Level 1 readiness work, and review evidence and reports in one place."
      >
        {notice ? (
          <div className="mb-5 rounded-[1.25rem] border border-cyan-200 bg-cyan-50 px-4 py-4 text-sm leading-7 text-cyan-900">
            {notice}
          </div>
        ) : null}

        <LoginForm />

        <p className="mt-6 text-sm text-slate-500">
          Need an account? <Link href={`/signup${params.plan === "growth" ? "?plan=growth" : ""}`} className="font-medium text-cyan-700 hover:text-cyan-800">Create one</Link>
        </p>
      </AuthCard>
    </PublicShell>
  );
}

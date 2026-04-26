import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { redirectIfAuthenticated } from "@/components/auth/auth-redirect";
import { LoginForm } from "@/components/auth/login-form";
import { PublicShell } from "@/components/marketing/public-shell";

export default async function LoginPage() {
  await redirectIfAuthenticated();

  return (
    <PublicShell>
      <AuthCard
        title="Log in to ComplianceOne"
        description="Securely access your organization workspace, evidence vault, and reporting center."
      >
        <LoginForm />

        <p className="mt-6 text-sm text-slate-500">
          Need an account? <Link href="/signup" className="font-medium text-cyan-700 hover:text-cyan-800">Create one</Link>
        </p>
      </AuthCard>
    </PublicShell>
  );
}

import Link from "next/link";
import { PublicShell } from "@/components/marketing/public-shell";

const features = [
  "CPCSC Level 1 control workspace",
  "Evidence vault with assessor-ready organization",
  "Executive reporting and export flows",
  "Multi-user production SaaS direction",
];

const trustPoints = [
  "Purpose-built for Canadian defence suppliers",
  "Designed around CPCSC Level 1 readiness workflows",
  "Structured for evidence, ownership, and attestation prep",
];

export default function HomePage() {
  return (
    <PublicShell>
      <section className="grid gap-6 2xl:grid-cols-[1.15fr_0.85fr]">
        <div className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-[linear-gradient(135deg,#07111f_0%,#0b1831_36%,#103560_100%)] p-8 text-white shadow-[0_40px_120px_rgba(7,16,31,0.38)] lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(103,232,249,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.18),transparent_25%)]" />
          <div className="relative max-w-4xl">
            <div className="inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-1.5 text-sm font-medium text-cyan-100">
              Production SaaS direction
            </div>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight sm:text-6xl xl:text-7xl">
              The compliance platform Canadian defence suppliers can actually buy.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300 xl:text-xl">
              ComplianceOne helps suppliers prepare for CPCSC Level 1 with a marketable product surface: pricing, secure sign-up,
              login, structured evidence workflows, and an application interior built for real operations.
            </p>
          </div>

          <div className="relative mt-8 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-medium text-slate-950 transition hover:bg-slate-100"
            >
              Start free trial
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              View pricing
            </Link>
          </div>

          <div className="relative mt-12 grid gap-4 lg:grid-cols-3">
            {trustPoints.map((point) => (
              <div key={point} className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-5 backdrop-blur">
                <p className="text-sm font-medium text-white">{point}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-[2rem] border border-white/50 bg-white/90 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
            <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">What buyers get</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">A real front door, not just the app interior</h2>
            <div className="mt-5 grid gap-3">
              {features.map((feature) => (
                <div key={feature} className="rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/50 bg-white/90 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
            <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Product path</p>
            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                We are now treating the product as a real SaaS: marketing, pricing, authentication, and the compliance workspace all belong in the same system.
              </p>
              <p>
                That means building trust at the landing page and carrying that trust cleanly into sign-up, login, and the protected application experience.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

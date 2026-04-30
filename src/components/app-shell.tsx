import Link from "next/link";
import type { ReactNode } from "react";
import { AppNav } from "@/components/app-nav";

export function AppShell({ children, organizationName }: { children: ReactNode; organizationName?: string | null }) {
  const displayOrg = organizationName || "Your organization";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_18%_0%,rgba(34,211,238,0.18),transparent_32rem),radial-gradient(circle_at_82%_8%,rgba(59,130,246,0.16),transparent_34rem),linear-gradient(180deg,#050b16_0%,#0b1630_16rem,#dfeaff_38rem,#f5f7fb_100%)] text-slate-900">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(245,247,251,0.64)_70%,rgba(245,247,251,0)_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-28 h-56 w-[84rem] -translate-x-1/2 rounded-full bg-white/18 blur-3xl" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1800px] flex-col gap-5 px-4 py-4 lg:px-6 lg:py-5 2xl:px-8">
        <header className="sticky top-3 z-20 overflow-hidden rounded-[1.4rem] border border-white/50 bg-white/88 shadow-[0_18px_50px_rgba(15,23,42,0.10)] backdrop-blur">
          <div className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-5 lg:py-4">
            <Link href="/dashboard" className="flex items-center gap-3 rounded-[1rem] outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-[0.95rem] border border-cyan-300/20 bg-slate-950 text-xs font-semibold text-cyan-100 shadow-[0_0_0_1px_rgba(103,232,249,0.12)]">
                C1
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-700">{displayOrg}</p>
                <h1 className="mt-1 text-base font-semibold text-slate-950">ComplianceOne</h1>
              </div>
            </Link>

            <AppNav />
          </div>
        </header>

        <main className="flex min-w-0 flex-1 flex-col gap-6">{children}</main>
      </div>
    </div>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";
import { LogoutButton } from "@/components/auth/logout-button";
import { AppNav } from "@/components/app-nav";

export function AppShell({ children, organizationName }: { children: ReactNode; organizationName?: string | null }) {
  const displayOrg = organizationName || "Your organization";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#163257_0%,transparent_28%),linear-gradient(180deg,#050b16_0%,#0b1630_18%,#eef3ff_18%,#f5f7fb_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col gap-5 px-4 py-4 lg:px-6 lg:py-5">
        <header className="sticky top-3 z-20 overflow-hidden rounded-[1.4rem] border border-white/50 bg-white/80 shadow-[0_18px_50px_rgba(15,23,42,0.10)] backdrop-blur">
          <div className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-5 lg:py-4">
            <Link href="/dashboard" className="flex items-center gap-3">
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

        <div className="flex flex-1 gap-6">
          <aside className="hidden w-[280px] shrink-0 xl:block">
            <div className="sticky top-28 rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,15,31,0.96)_0%,rgba(10,20,40,0.96)_100%)] p-5 text-white shadow-[0_40px_120px_rgba(2,6,23,0.48)]">
              <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-200/80">Readiness workspace</p>
              <h2 className="mt-3 text-xl font-semibold text-white">CPCSC Level 1 progress</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Track control implementation, evidence references, ownership, and readiness reporting for your organization.
              </p>
              <div className="mt-5 grid gap-3">
                <Link
                  href="/reports"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  View readiness report
                </Link>
                <LogoutButton />
              </div>
            </div>
          </aside>

          <main className="flex min-w-0 flex-1 flex-col gap-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";

export function PublicHeader() {
  return (
    <header className="sticky top-3 z-20 mx-auto w-full max-w-[1400px] px-4 lg:px-6">
      <div className="rounded-[1.4rem] border border-white/50 bg-white/80 px-4 py-3 shadow-[0_18px_50px_rgba(15,23,42,0.10)] backdrop-blur lg:px-5">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.95rem] border border-cyan-300/20 bg-slate-950 text-xs font-semibold text-cyan-100">
              C1
            </div>
            <div className="min-w-0">
              <p className="truncate text-[10px] uppercase tracking-[0.28em] text-cyan-700">CPCSC readiness</p>
              <h1 className="mt-1 truncate text-base font-semibold text-slate-950">ComplianceOne</h1>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <Link href="/pricing" className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
              Pricing
            </Link>
            <Link href="/security" className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
              Security
            </Link>
            <Link href="/login" className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
              Log in
            </Link>
            <Link href="/signup" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
              Get started
            </Link>
          </nav>
        </div>

        <nav className="mt-4 flex gap-2 md:hidden">
          <Link
            href="/pricing"
            className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="flex-1 rounded-full bg-slate-950 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Sign up
          </Link>
        </nav>
      </div>
    </header>
  );
}

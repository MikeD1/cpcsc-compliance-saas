import type { ReactNode } from "react";

export function PageBackground({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_18%_0%,rgba(34,211,238,0.18),transparent_32rem),radial-gradient(circle_at_82%_8%,rgba(59,130,246,0.16),transparent_34rem),linear-gradient(180deg,#050b16_0%,#0b1630_16rem,#dfeaff_38rem,#f5f7fb_100%)] text-slate-900 ${className}`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(245,247,251,0.64)_70%,rgba(245,247,251,0)_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-28 h-56 w-[84rem] -translate-x-1/2 rounded-full bg-white/18 blur-3xl" />
      <div className="relative min-h-screen">{children}</div>
    </div>
  );
}

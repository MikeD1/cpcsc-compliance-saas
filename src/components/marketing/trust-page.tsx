import type { ReactNode } from "react";
import { PublicShell } from "@/components/marketing/public-shell";

export function TrustPage({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: ReactNode }) {
  return (
    <PublicShell>
      <section className="rounded-[2.25rem] border border-white/10 bg-[linear-gradient(135deg,#07111f_0%,#0b1831_36%,#103560_100%)] p-8 text-white shadow-[0_40px_120px_rgba(7,16,31,0.38)] lg:p-10">
        <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-300">{eyebrow}</p>
        <h1 className="mt-3 max-w-4xl text-5xl font-semibold tracking-tight lg:text-6xl">{title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{description}</p>
      </section>
      <section className="grid gap-6 rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] lg:p-8">
        {children}
      </section>
    </PublicShell>
  );
}

export function TrustSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
      <h2 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">{children}</div>
    </div>
  );
}

import type { ReactNode } from "react";

export function AuthCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-xl rounded-[2rem] border border-white/50 bg-white/92 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.10)] lg:p-10">
      <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">Secure access</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 lg:text-4xl">{title}</h1>
      <p className="mt-4 text-sm leading-7 text-slate-600">{description}</p>
      <div className="mt-8">{children}</div>
    </section>
  );
}

import type { ReactNode } from "react";
import { PublicHeader } from "@/components/marketing/public-header";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#163257_0%,transparent_20%),linear-gradient(180deg,#050b16_0%,#0b1630_22%,#eef3ff_22%,#f5f7fb_100%)]">
      <PublicHeader />
      <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-10 px-4 pb-16 pt-6 lg:px-6 lg:pt-8">
        {children}
      </main>
    </div>
  );
}

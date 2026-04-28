import type { ReactNode } from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/marketing/public-header";

const footerLinks = [
  { href: "/buyer-packet", label: "Buyer packet" },
  { href: "/demo", label: "Walkthrough" },
  { href: "/security", label: "Security" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#163257_0%,transparent_20%),linear-gradient(180deg,#050b16_0%,#0b1630_22%,#eef3ff_22%,#f5f7fb_100%)]">
      <PublicHeader />
      <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-10 px-4 pb-10 pt-6 lg:px-6 lg:pt-8">
        {children}
      </main>
      <footer className="mx-auto w-full max-w-[1400px] px-4 pb-10 lg:px-6">
        <div className="flex flex-col gap-4 rounded-[1.5rem] border border-white/50 bg-white/75 px-5 py-5 text-sm text-slate-600 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur md:flex-row md:items-center md:justify-between">
          <p>ComplianceOne supports CPCSC Level 1 readiness work; certification decisions remain with the relevant program or assessor.</p>
          <nav className="flex flex-wrap gap-3">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="font-medium text-slate-600 hover:text-slate-950">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}

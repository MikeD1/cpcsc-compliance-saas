"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/controls", label: "Controls" },
  { href: "/reports", label: "Reports" },
  { href: "/settings", label: "Settings" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary application navigation" className="overflow-x-auto">
      <div className="inline-flex min-w-full items-center gap-1.5 rounded-[1rem] border border-slate-200 bg-slate-50 p-1.5">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-[0.85rem] px-3 py-2.5 text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 ${
                active
                  ? "bg-slate-950 text-white shadow-md ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-50"
                  : "text-slate-600 hover:bg-white hover:text-slate-950 hover:shadow-sm"
              }`}
            >
              {active ? <span aria-hidden="true" className="mr-2 h-2 w-2 rounded-full bg-cyan-300" /> : null}
              {item.label}
              {active ? <span className="sr-only">, current page</span> : null}
            </Link>
          );
        })}
        <Link
          href="/exports/assessment.pdf"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-[0.85rem] border border-slate-200 bg-white/70 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition hover:bg-white hover:text-slate-950 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2"
        >
          Export PDF
        </Link>
        <LogoutButton variant="nav" />
      </div>
    </nav>
  );
}

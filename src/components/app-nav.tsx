"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/controls", label: "Controls" },
  { href: "/evidence", label: "Evidence" },
  { href: "/reports", label: "Reports" },
  { href: "/settings", label: "Settings" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="overflow-x-auto">
      <div className="inline-flex min-w-full gap-1.5 rounded-[1rem] border border-slate-200 bg-slate-50 p-1.5">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-[0.85rem] px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-600 hover:bg-white hover:text-slate-950 hover:shadow-sm"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
        <Link
          href="/exports/assessment.pdf"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-[0.85rem] border border-slate-200 bg-white/70 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-white hover:text-slate-950 hover:shadow-sm"
        >
          Export PDF
        </Link>
      </div>
    </nav>
  );
}

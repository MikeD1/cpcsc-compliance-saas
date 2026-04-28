const pdfIncludes = [
  "Executive readiness summary",
  "Readiness score explanation",
  "Gaps grouped by control priority",
  "Action plan with next best work",
  "Evidence coverage summary",
  "Control-by-control appendix",
];

const actionItems = [
  { rank: 1, label: "Add evidence", control: "03.01.01 Account management", detail: "Attach user account inventory or access review notes." },
  { rank: 2, label: "Assign owner", control: "03.01.20 Approved systems", detail: "Name the person accountable for system/device scope." },
  { rank: 3, label: "Review control", control: "03.05.11 MFA", detail: "Review notes and evidence before marking complete." },
];

const evidenceRows = [
  { control: "03.01.01", title: "Quarterly access review", type: "Review notes", status: "Attached" },
  { control: "03.05.11", title: "MFA configuration screenshot", type: "Screenshot", status: "Attached" },
  { control: "03.13.01", title: "Firewall rule export", type: "Configuration", status: "Needed" },
];

export function ArtifactPreview() {
  return (
    <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <div className="rounded-[2rem] border border-white/50 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] lg:p-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-700">The artifact customers buy</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 lg:text-4xl">A readiness report people can actually use.</h2>
        <p className="mt-4 text-base leading-8 text-slate-600">
          ComplianceOne turns scattered readiness work into a clear CPCSC Level 1 package: what is complete, what is missing, who owns it, and what evidence backs it up.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <BeforeAfter
            label="Before"
            tone="amber"
            items={["Spreadsheets with stale status", "Evidence links buried in inboxes", "Shared drives with unclear ownership", "No clean buyer-facing summary"]}
          />
          <BeforeAfter
            label="After"
            tone="emerald"
            items={["Organized CPCSC controls", "Named owners and review status", "Evidence register by control", "Buyer-ready readiness PDF"]}
          />
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-sm font-semibold text-slate-950">What the PDF includes</h3>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {pdfIncludes.map((item) => (
              <div key={item} className="rounded-[1rem] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                {item}
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-6 text-slate-500">
            The report is an internal readiness snapshot. It does not claim certification, audit assurance, or Government of Canada approval.
          </p>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#0a1222_0%,#0f1d36_100%)] p-5 text-white shadow-[0_30px_90px_rgba(15,23,42,0.25)] lg:p-6">
        <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.26em] text-cyan-300">Sample dashboard</p>
              <h3 className="mt-2 text-2xl font-semibold">Next best actions</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">A mock preview of the action queue customers see after setup.</p>
            </div>
            <div className="rounded-[1.2rem] border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-200">Readiness</p>
              <p className="mt-1 text-3xl font-semibold text-white">62%</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {actionItems.map((item) => (
              <div key={item.rank} className="rounded-[1.2rem] border border-white/10 bg-white/[0.07] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-950">#{item.rank}</span>
                  <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-200">{item.label}</span>
                </div>
                <p className="mt-3 text-sm font-semibold text-white">{item.control}</p>
                <p className="mt-1 text-sm leading-6 text-slate-300">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.26em] text-cyan-300">Evidence coverage example</p>
              <h3 className="mt-2 text-xl font-semibold">Proof organized by control</h3>
            </div>
            <span className="rounded-full bg-emerald-300/10 px-3 py-1 text-sm font-medium text-emerald-200">8 / 13 covered</span>
          </div>
          <div className="mt-4 grid gap-2">
            {evidenceRows.map((row) => (
              <div key={`${row.control}-${row.title}`} className="grid gap-2 rounded-[1rem] border border-white/10 bg-white/[0.07] px-3 py-3 text-sm md:grid-cols-[5rem_1fr_7rem_5rem]">
                <span className="font-semibold text-cyan-200">{row.control}</span>
                <span className="text-white">{row.title}</span>
                <span className="text-slate-300">{row.type}</span>
                <span className={row.status === "Attached" ? "text-emerald-200" : "text-amber-200"}>{row.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BeforeAfter({ label, items, tone }: { label: string; items: string[]; tone: "amber" | "emerald" }) {
  const toneClass = tone === "amber" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-emerald-200 bg-emerald-50 text-emerald-900";

  return (
    <div className={`rounded-[1.5rem] border p-5 ${toneClass}`}>
      <h3 className="text-sm font-semibold">{label}</h3>
      <ul className="mt-3 space-y-2 text-sm leading-6">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-current" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

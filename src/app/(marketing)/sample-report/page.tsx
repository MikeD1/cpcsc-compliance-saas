import Link from "next/link";
import { TrustPage, TrustSection } from "@/components/marketing/trust-page";

const sampleGaps = [
  {
    id: "03.01.01",
    title: "Manage user accounts",
    reason: "Account inventory exists, but quarterly access review evidence is missing.",
    next: "Attach the latest access register export and record the next review owner/date.",
  },
  {
    id: "03.05.03",
    title: "Enable multifactor authentication",
    reason: "MFA is described for email, but privileged account coverage is not yet proven.",
    next: "Add identity-provider MFA screenshots and the privileged account MFA status list.",
  },
  {
    id: "03.13.01",
    title: "Use basic network protections",
    reason: "Firewall controls are in progress, but inbound exposure and change history are not documented.",
    next: "Attach firewall rule evidence, a simple network diagram, and recent change notes.",
  },
];

const evidenceExamples = [
  "User account inventory export — SharePoint / Security / Access Reviews / 2026-Q2.xlsx",
  "MFA configuration screenshot — Entra ID conditional access policy",
  "Endpoint protection dashboard screenshot — Defender portal",
  "Visitor log sample — Reception binder, April 2026",
];

const categoryReadiness = [
  ["Access control", "2/4 complete"],
  ["Identification and authentication", "2/3 complete"],
  ["Media protection", "1/1 complete"],
  ["Physical protection", "1/2 complete"],
  ["Systems and communications protection", "0/1 complete"],
  ["System and information integrity", "2/2 complete"],
];

export default function SampleReportPage() {
  return (
    <TrustPage
      eyebrow="Sample report"
      title="See the buyer-ready artifact ComplianceOne is designed to produce."
      description="This fictional sample shows the shape of a CPCSC Level 1 readiness snapshot: confidence level, priority gaps, evidence coverage, and an action plan. It is not a certification, audit opinion, or Government of Canada approval."
    >
      <TrustSection title="Executive snapshot">
        <div className="grid gap-4 md:grid-cols-4">
          <SampleMetric label="Confidence" value="Moderate" detail="Useful for a readiness conversation, but not fully closed." />
          <SampleMetric label="Readiness" value="62%" detail="8 of 13 controls marked complete." />
          <SampleMetric label="Evidence" value="77%" detail="10 of 13 controls have evidence references." />
          <SampleMetric label="Review queue" value="3" detail="Controls waiting for reviewer decision." />
        </div>
        <p className="mt-5 rounded-[1.3rem] border border-cyan-100 bg-cyan-50 px-5 py-4 text-sm leading-7 text-cyan-950">
          Sample narrative: Northstar Components has a credible CPCSC Level 1 readiness foundation. The strongest areas are malware protection, patching, and media disposal. The buyer conversation should focus on access review evidence, privileged MFA coverage, and firewall boundary documentation.
        </p>
      </TrustSection>

      <TrustSection title="Priority gaps and next actions">
        <div className="grid gap-3">
          {sampleGaps.map((gap, index) => (
            <div key={gap.id} className="rounded-[1.3rem] border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">#{index + 1}</span>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">Buyer question risk</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-950">{gap.id}: {gap.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{gap.reason}</p>
              <p className="mt-2 text-sm leading-6 text-slate-800"><span className="font-semibold">Next:</span> {gap.next}</p>
            </div>
          ))}
        </div>
      </TrustSection>

      <TrustSection title="Evidence register preview">
        <p>
          ComplianceOne currently tracks evidence references, not uploaded source files. Record what proof exists, where it lives, and which control it supports.
        </p>
        <div className="mt-4 grid gap-3">
          {evidenceExamples.map((item) => (
            <div key={item} className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">{item}</div>
          ))}
        </div>
      </TrustSection>

      <TrustSection title="Readiness by control family">
        <div className="grid gap-3 md:grid-cols-2">
          {categoryReadiness.map(([category, value]) => (
            <div key={category} className="rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-sm font-semibold text-slate-950">{category}</p>
              <p className="mt-1 text-sm text-slate-600">{value}</p>
            </div>
          ))}
        </div>
      </TrustSection>

      <TrustSection title="Why this is more than a spreadsheet">
        <p>
          A spreadsheet can store the 13 controls. The report adds judgment: what is strongest, what is risky in a buyer conversation, what evidence is missing, and what to do next.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/demo" className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
            Request walkthrough
          </Link>
          <Link href="/buyer-packet" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-800 transition hover:border-cyan-200 hover:text-cyan-800">
            View buyer packet
          </Link>
        </div>
      </TrustSection>
    </TrustPage>
  );
}

function SampleMetric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
    </div>
  );
}

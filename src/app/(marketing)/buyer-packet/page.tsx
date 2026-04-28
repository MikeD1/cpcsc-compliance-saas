import Link from "next/link";
import { TrustPage, TrustSection } from "@/components/marketing/trust-page";

const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@complianceone.ca";

const included = [
  "CPCSC Level 1 control workspace for the 13 Level 1 controls",
  "Owner assignment and status tracking",
  "Implementation notes and example guidance per control",
  "Evidence register with source/reference locations",
  "Readiness dashboard and next-best-action queue",
  "Buyer-ready readiness report and PDF export",
  "Stripe billing and customer portal",
  "Team invitations and member lifecycle controls",
];

const notIncluded = [
  "CPCSC certification or government approval",
  "Legal, security, or assessor advice",
  "Secure file vault or long-term records-management system",
  "Guarantee of contract eligibility or procurement acceptance",
  "CPCSC Level 2/3 or broad GRC framework coverage",
];

const reportIncludes = [
  "Executive summary",
  "Readiness score explanation",
  "Gaps by priority",
  "Action plan",
  "Evidence coverage summary",
  "Control detail appendix",
];

export default function BuyerPacketPage() {
  return (
    <TrustPage
      eyebrow="Buyer packet"
      title="ComplianceOne at a glance for buyers, leaders, and security reviewers."
      description="A plain-language packet explaining what the product does, what it does not do, how readiness data is handled, and what customers can produce from the workspace."
    >
      <TrustSection title="What ComplianceOne does">
        <p>
          ComplianceOne helps Canadian defence suppliers organize CPCSC Level 1 readiness work in one workspace instead of scattered spreadsheets, inbox threads, and shared-drive folders.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {included.map((item) => (
            <div key={item} className="rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {item}
            </div>
          ))}
        </div>
      </TrustSection>

      <TrustSection title="What ComplianceOne does not do">
        <div className="grid gap-3 md:grid-cols-2">
          {notIncluded.map((item) => (
            <div key={item} className="rounded-[1.1rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {item}
            </div>
          ))}
        </div>
      </TrustSection>

      <TrustSection title="CPCSC Level 1 scope">
        <p>
          The product is focused on CPCSC Level 1 readiness. The workspace maps practical work to the 13 Level 1 controls, including ownership, implementation notes, evidence references, review status, and reporting.
        </p>
        <p>
          The current scope is intentionally narrow. It is designed to help teams prepare a credible readiness snapshot, not to replace a complete security program or external assessment process.
        </p>
      </TrustSection>

      <TrustSection title="Sample report value">
        <p>The readiness PDF is the core buyer-facing artifact. It turns workspace activity into a point-in-time summary that can support internal leadership, customer, partner, or procurement-readiness conversations.</p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {reportIncludes.map((item) => (
            <div key={item} className="rounded-[1.1rem] border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm font-medium text-cyan-950">
              {item}
            </div>
          ))}
        </div>
      </TrustSection>

      <TrustSection title="Security and data boundaries">
        <p>
          ComplianceOne uses Supabase for authentication and application data, Stripe for billing, and server-side route checks for workspace access. Workspace data is scoped by organization, and practical tenant-isolation checks are run before broader launch.
        </p>
        <p>
          Evidence is currently a register. It stores metadata and source/reference locations, not uploaded source files. Source documents should remain in the customer’s approved system of record until file storage is separately designed and verified.
        </p>
        <p>
          See the <Link className="font-medium text-cyan-700" href="/security">security page</Link> for the current public security boundaries.
        </p>
      </TrustSection>

      <TrustSection title="Pricing and next step">
        <p>
          Start is designed for a small supplier or single compliance lead. Growth is designed for teams with more contributors, owners, and recurring reporting needs. Both plans use monthly CAD billing through Stripe.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            View pricing
          </Link>
          <Link
            href="/sample-report"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-800 transition hover:border-cyan-200 hover:text-cyan-800"
          >
            See sample report
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-800 transition hover:border-cyan-200 hover:text-cyan-800"
          >
            Request walkthrough
          </Link>
          <a
            href={`mailto:${supportEmail}?subject=${encodeURIComponent("ComplianceOne buyer packet question")}`}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-800 transition hover:border-cyan-200 hover:text-cyan-800"
          >
            Email questions
          </a>
        </div>
      </TrustSection>
    </TrustPage>
  );
}

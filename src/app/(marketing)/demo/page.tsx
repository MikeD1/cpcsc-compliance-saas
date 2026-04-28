import Link from "next/link";
import { TrustPage, TrustSection } from "@/components/marketing/trust-page";

const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@complianceone.ca";
const subject = encodeURIComponent("ComplianceOne readiness walkthrough");
const body = encodeURIComponent(
  "Hi ComplianceOne team,\n\nI’d like to book a CPCSC Level 1 readiness walkthrough.\n\nOrganization:\nName:\nRole:\nApprox. number of users involved:\nCurrent readiness workflow (spreadsheet, shared drive, consultant, etc.):\nMain question or deadline:\n\nThanks!",
);

export default function DemoPage() {
  return (
    <TrustPage
      eyebrow="Readiness walkthrough"
      title="See whether ComplianceOne fits your CPCSC Level 1 workflow."
      description="A short walkthrough is for teams that want to understand the readiness report, evidence register, security boundaries, and pricing before creating a paid workspace."
    >
      <TrustSection title="What we cover">
        <ul className="grid gap-3 text-slate-600">
          <li>• How the 13 CPCSC Level 1 controls are organized.</li>
          <li>• How owners, status, implementation notes, and review state work.</li>
          <li>• What the evidence register tracks — and what it does not store yet.</li>
          <li>• What the buyer-ready PDF includes.</li>
          <li>• Where ComplianceOne helps, and where you may still need internal security, legal, or advisor support.</li>
        </ul>
      </TrustSection>

      <TrustSection title="Best fit">
        <p>
          ComplianceOne is best for Canadian defence suppliers that need a simple CPCSC Level 1 readiness workspace before buyer, procurement, leadership, or partner conversations.
        </p>
        <p>
          It is not a certification service, assessor replacement, Government of Canada system, or secure file vault.
        </p>
      </TrustSection>

      <TrustSection title="Request a walkthrough">
        <p>
          Email <a className="font-medium text-cyan-700" href={`mailto:${supportEmail}?subject=${subject}&body=${body}`}>{supportEmail}</a> with your organization name, role, and main readiness question. We’ll use that context to keep the walkthrough focused.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={`mailto:${supportEmail}?subject=${subject}&body=${body}`}
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Email for walkthrough
          </a>
          <Link
            href="/buyer-packet"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-800 transition hover:border-cyan-200 hover:text-cyan-800"
          >
            View buyer packet
          </Link>
        </div>
      </TrustSection>
    </TrustPage>
  );
}

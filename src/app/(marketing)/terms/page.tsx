import { TrustPage, TrustSection } from "@/components/marketing/trust-page";

const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@complianceone.ca";

export default function TermsPage() {
  return (
    <TrustPage
      eyebrow="Terms"
      title="Service terms for ComplianceOne private launch users."
      description="These terms set practical expectations for using ComplianceOne to organize CPCSC Level 1 readiness work."
    >
      <TrustSection title="Use of the service">
        <p>ComplianceOne helps Canadian defence suppliers organize CPCSC Level 1 readiness work, evidence references, ownership, and reporting. Users are responsible for entering accurate information and using the product in line with their organization’s policies.</p>
      </TrustSection>
      <TrustSection title="No certification guarantee">
        <p>ComplianceOne does not guarantee CPCSC certification, contract eligibility, security approval, or acceptance by any buyer, program, or assessor. The product supports readiness management and reporting; it does not replace legal, security, or assessor advice.</p>
      </TrustSection>
      <TrustSection title="Billing expectations">
        <p>Plans are billed monthly through Stripe checkout in Canadian dollars unless another written arrangement applies. Support can help with plan changes or cancellation while self-serve billing management is being expanded.</p>
      </TrustSection>
      <TrustSection title="Customer responsibility">
        <p>Customers remain responsible for implementation decisions, evidence quality, external submissions, and any attestations made outside the product.</p>
      </TrustSection>
      <TrustSection title="Support and changes">
        <p>Questions about access, billing, or these terms can be sent to <a className="font-medium text-cyan-700" href={`mailto:${supportEmail}`}>{supportEmail}</a>. These terms may be updated as ComplianceOne moves from private launch toward broader availability.</p>
      </TrustSection>
    </TrustPage>
  );
}

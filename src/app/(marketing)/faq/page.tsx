import { TrustPage, TrustSection } from "@/components/marketing/trust-page";

export default function FaqPage() {
  return (
    <TrustPage
      eyebrow="FAQ"
      title="Procurement and readiness questions, answered plainly."
      description="ComplianceOne helps teams organize CPCSC Level 1 readiness work. These answers keep the product promise clear without overstating compliance outcomes."
    >
      <TrustSection title="Does ComplianceOne certify CPCSC compliance?">
        <p>No. ComplianceOne helps organize readiness work, evidence references, owners, and reporting. Certification, program acceptance, or procurement eligibility decisions remain with the relevant program, buyer, assessor, or authority.</p>
      </TrustSection>
      <TrustSection title="What CPCSC scope does the product cover today?">
        <p>The current workspace focuses on CPCSC Level 1 readiness: the 13 controls, implementation notes, ownership, evidence register entries, review status, and readiness reporting.</p>
      </TrustSection>
      <TrustSection title="Where are files stored?">
        <p>ComplianceOne currently acts as an evidence register. It stores evidence names, types, and source locations so teams can find supporting artifacts in their approved system of record. File upload storage is planned separately.</p>
      </TrustSection>
      <TrustSection title="How does billing work?">
        <p>Plans are billed monthly in CAD through Stripe. Users can access Stripe’s billing portal from settings once a Stripe customer is linked to the workspace.</p>
      </TrustSection>
      <TrustSection title="What support should private launch testers expect?">
        <p>Private launch support focuses on account activation, billing recovery, workspace setup, and product issues. Support aims to respond within one business day during the testing period.</p>
      </TrustSection>
      <TrustSection title="What security details are available for procurement?">
        <p>The public security page describes account protection, billing handling, current evidence storage boundaries, and the security contact path. Procurement-grade questionnaires and customer-specific security documentation are handled through support while the product matures.</p>
      </TrustSection>
    </TrustPage>
  );
}

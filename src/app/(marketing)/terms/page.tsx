import { TrustPage, TrustSection } from "@/components/marketing/trust-page";

export default function TermsPage() {
  return (
    <TrustPage
      eyebrow="Terms"
      title="Simple service terms while the product moves toward launch."
      description="These notes set expectations for use of ComplianceOne without pretending to be a finished legal agreement."
    >
      <TrustSection title="Use of the service">
        <p>ComplianceOne is provided to help Canadian defence suppliers organize CPCSC Level 1 readiness work, evidence references, ownership, and reporting.</p>
      </TrustSection>
      <TrustSection title="No certification guarantee">
        <p>The product does not guarantee CPCSC certification, contract eligibility, security approval, or acceptance by any buyer, program, or assessor.</p>
      </TrustSection>
      <TrustSection title="Customer responsibility">
        <p>Customers remain responsible for the accuracy of their readiness information, implementation decisions, evidence quality, and any external submissions or attestations.</p>
      </TrustSection>
      <TrustSection title="Billing expectations">
        <p>Plans are billed monthly through Stripe checkout. Listed pricing is in Canadian dollars. Cancellation and plan-change handling should be confirmed through support until self-serve billing management is available.</p>
      </TrustSection>
      <TrustSection title="Formal agreement status">
        <p>These notes are not a substitute for a reviewed terms of service. A formal agreement should be added before larger customer rollout.</p>
      </TrustSection>
    </TrustPage>
  );
}

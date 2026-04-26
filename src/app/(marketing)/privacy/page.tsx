import { TrustPage, TrustSection } from "@/components/marketing/trust-page";

export default function PrivacyPage() {
  return (
    <TrustPage
      eyebrow="Privacy"
      title="Plain-language privacy notes for ComplianceOne users."
      description="This page summarizes how the product is intended to handle account, organization, billing, and readiness information."
    >
      <TrustSection title="Information used to run the service">
        <p>ComplianceOne uses account details such as name, work email, organization name, plan selection, and workspace activity to create accounts, manage access, and support CPCSC readiness workflows.</p>
      </TrustSection>
      <TrustSection title="Readiness content">
        <p>Teams may add control responses, owners, review cadence, and evidence metadata. Users should avoid adding information that is not needed for readiness tracking.</p>
      </TrustSection>
      <TrustSection title="Service providers">
        <p>Supabase supports authentication and application data storage. Stripe handles checkout and subscription billing. These services process information needed to provide the product.</p>
      </TrustSection>
      <TrustSection title="Formal policy status">
        <p>This is a lightweight product privacy page, not a full legal privacy policy. A formal policy should be reviewed before a broad public launch or enterprise procurement process.</p>
      </TrustSection>
    </TrustPage>
  );
}

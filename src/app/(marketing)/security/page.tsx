import { TrustPage, TrustSection } from "@/components/marketing/trust-page";

export default function SecurityPage() {
  return (
    <TrustPage
      eyebrow="Security"
      title="A practical security posture for sensitive readiness work."
      description="ComplianceOne is designed to keep CPCSC readiness activity organized in a protected workspace without overstating guarantees."
    >
      <TrustSection title="Account protection">
        <p>Users sign in through Supabase-backed authentication, and passwords must be at least 12 characters. Workspace access is tied to organization membership and subscription state.</p>
      </TrustSection>
      <TrustSection title="Data handling">
        <p>Readiness records, control responses, and evidence metadata are stored in Supabase. Evidence entries currently track artifact names, types, and locations so teams can reference where source documents live.</p>
      </TrustSection>
      <TrustSection title="Billing security">
        <p>Payments and subscription checkout are handled by Stripe. ComplianceOne does not collect or store card numbers in the application.</p>
      </TrustSection>
      <TrustSection title="Important note">
        <p>ComplianceOne helps organize readiness work. It does not guarantee CPCSC certification or replace legal, security, or assessor advice.</p>
      </TrustSection>
    </TrustPage>
  );
}

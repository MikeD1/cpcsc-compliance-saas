import { TrustPage, TrustSection } from "@/components/marketing/trust-page";

const securityEmail = process.env.NEXT_PUBLIC_SECURITY_EMAIL ?? process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@complianceone.ca";

export default function SecurityPage() {
  return (
    <TrustPage
      eyebrow="Security"
      title="Security posture for sensitive readiness work."
      description="ComplianceOne is designed to keep CPCSC readiness activity organized in a protected workspace while being clear about current capabilities and limits."
    >
      <TrustSection title="Account protection">
        <p>Users sign in through Supabase-backed authentication, and passwords must be at least 12 characters. Workspace access is tied to organization membership and subscription state.</p>
      </TrustSection>
      <TrustSection title="Application data handling">
        <p>Readiness records, control responses, and evidence metadata are stored in Supabase. Evidence entries currently track artifact names, types, and locations so teams can reference where source documents live.</p>
      </TrustSection>
      <TrustSection title="Evidence storage boundary">
        <p>ComplianceOne currently acts as an evidence register, not a full file vault. Source documents should remain in your organization’s approved system of record until file upload and retention controls are available.</p>
      </TrustSection>
      <TrustSection title="Billing security">
        <p>Payments and subscription checkout are handled by Stripe. ComplianceOne does not collect or store card numbers in the application.</p>
      </TrustSection>
      <TrustSection title="Security contact and incident handling">
        <p>Report suspected account, access, or data handling issues to <a className="font-medium text-cyan-700" href={`mailto:${securityEmail}`}>{securityEmail}</a>. Include your organization name, affected account, and a concise description of the concern.</p>
      </TrustSection>
      <TrustSection title="Important note">
        <p>ComplianceOne helps organize readiness work. It does not guarantee CPCSC certification or replace legal, security, or assessor advice.</p>
      </TrustSection>
    </TrustPage>
  );
}

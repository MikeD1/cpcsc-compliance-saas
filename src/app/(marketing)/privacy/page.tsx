import { TrustPage, TrustSection } from "@/components/marketing/trust-page";

const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@complianceone.ca";

export default function PrivacyPage() {
  return (
    <TrustPage
      eyebrow="Privacy"
      title="Privacy commitments for ComplianceOne users."
      description="This page explains how ComplianceOne handles account, organization, billing, and readiness information during product use."
    >
      <TrustSection title="Information used to run the service">
        <p>ComplianceOne uses account details such as name, work email, organization name, plan selection, membership role, and workspace activity to create accounts, manage access, and support CPCSC readiness workflows.</p>
      </TrustSection>
      <TrustSection title="Readiness content">
        <p>Teams may add control responses, ownership details, review notes, and evidence metadata. Users should only enter information that is useful for readiness tracking and should avoid adding unnecessary sensitive personal information.</p>
      </TrustSection>
      <TrustSection title="Service providers">
        <p>Supabase supports authentication and application data storage. Stripe handles checkout, card processing, and subscription billing. These providers process information needed to operate the service.</p>
      </TrustSection>
      <TrustSection title="Retention and deletion">
        <p>During private launch, deletion and export requests are handled through support. Email <a className="font-medium text-cyan-700" href={`mailto:${supportEmail}`}>{supportEmail}</a> with your organization name and request type.</p>
      </TrustSection>
      <TrustSection title="Procurement note">
        <p>This privacy page is intended to be launch-safe for private testers. Larger enterprise or procurement deployments may require a customer-specific agreement, data processing terms, or security questionnaire.</p>
      </TrustSection>
    </TrustPage>
  );
}

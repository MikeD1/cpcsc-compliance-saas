import { TrustPage, TrustSection } from "@/components/marketing/trust-page";

const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@complianceone.ca";
const securityEmail = process.env.NEXT_PUBLIC_SECURITY_EMAIL ?? supportEmail;

export default function ContactPage() {
  return (
    <TrustPage
      eyebrow="Contact"
      title="Get help with workspace access, billing, or readiness setup."
      description="Use these support paths for account activation, billing, product questions, and security concerns."
    >
      <TrustSection title="Product and workspace support">
        <p>Email <a className="font-medium text-cyan-700" href={`mailto:${supportEmail}`}>{supportEmail}</a> with your organization name, account email, and a short description of the issue.</p>
        <p>For launch testers, support aims to respond within one business day during the private testing period.</p>
      </TrustSection>
      <TrustSection title="Billing or activation issues">
        <p>If checkout completed but the workspace still shows inactive, use the “Recheck billing” action on the activation screen first. If it remains inactive, email support with your selected plan and checkout email.</p>
      </TrustSection>
      <TrustSection title="Security contact">
        <p>For suspected account access, data handling, or security issues, email <a className="font-medium text-cyan-700" href={`mailto:${securityEmail}`}>{securityEmail}</a> and include “Security” in the subject line.</p>
      </TrustSection>
    </TrustPage>
  );
}

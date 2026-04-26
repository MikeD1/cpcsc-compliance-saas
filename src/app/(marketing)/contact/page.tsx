import { TrustPage, TrustSection } from "@/components/marketing/trust-page";

export default function ContactPage() {
  return (
    <TrustPage
      eyebrow="Contact"
      title="Get help with workspace access, billing, or readiness setup."
      description="ComplianceOne support is intentionally simple while the product is being prepared for wider launch."
    >
      <TrustSection title="Existing customers and trial users">
        <p>Use the sales, onboarding, or support contact that invited your organization to ComplianceOne. Include your organization name, account email, and whether the issue is about login, checkout, subscription status, or workspace content.</p>
      </TrustSection>
      <TrustSection title="Billing or activation issues">
        <p>If checkout completed but the workspace still shows as inactive, wait a moment for billing confirmation to process, then log out and back in. If it remains inactive, contact your onboarding/support contact with the plan selected and checkout email.</p>
      </TrustSection>
      <TrustSection title="Before public launch">
        <p>A dedicated public support email or contact form should be added here before broader marketing traffic is sent to this site.</p>
      </TrustSection>
    </TrustPage>
  );
}

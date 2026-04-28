import { TrustPage, TrustSection } from "@/components/marketing/trust-page";

const securityEmail = process.env.NEXT_PUBLIC_SECURITY_EMAIL ?? process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@complianceone.ca";
const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? securityEmail;

export default function SecurityPage() {
  return (
    <TrustPage
      eyebrow="Security"
      title="Plain-English security boundaries for CPCSC readiness work."
      description="ComplianceOne is built to organize CPCSC Level 1 readiness in a protected workspace. This page explains what is protected today, where the boundaries are, and what the product does not claim to be."
    >
      <TrustSection title="Organization isolation and RLS">
        <p>
          ComplianceOne separates workspace data by organization. Users are attached to an organization membership, and app routes scope controls, evidence records, invitations, subscriptions, and settings to that organization.
        </p>
        <p>
          The Supabase database is designed with row-level security policies for tenant isolation. We also run practical two-user/two-organization checks before broader launch to confirm that one organization cannot view or update another organization’s records through the browser client.
        </p>
      </TrustSection>

      <TrustSection title="Access control">
        <p>
          Users sign in with Supabase-backed authentication. Workspace access depends on an active organization membership, and billing/team-management actions are restricted to owner/admin-style roles in the app.
        </p>
        <p>
          Control ownership, member lifecycle changes, invitations, billing portal access, and billing reconciliation are checked server-side before changes are made.
        </p>
      </TrustSection>

      <TrustSection title="Service-role boundary">
        <p>
          Some server routes use a Supabase service-role key so the application can perform trusted backend work. That key is kept server-side and is never exposed to the browser.
        </p>
        <p>
          Because service-role access can bypass database RLS, server routes must verify the signed-in user, organization membership, and resource ownership before reading or changing workspace data.
        </p>
      </TrustSection>

      <TrustSection title="Evidence is a register, not a file vault">
        <p>
          ComplianceOne currently stores evidence metadata: titles, types, linked controls, status, and source/reference locations. It helps teams organize where proof lives and whether each control has supporting evidence.
        </p>
        <p>
          It is not currently a production document vault. Source files should stay in your approved system of record until file upload, storage policies, retention controls, signed URLs, and audit logging are implemented and verified.
        </p>
      </TrustSection>

      <TrustSection title="Backups and retention boundaries">
        <p>
          Application data is stored in Supabase. Database backup, point-in-time recovery, and infrastructure retention depend on the configured Supabase project and hosting plan.
        </p>
        <p>
          ComplianceOne has not yet implemented customer-configurable retention schedules, legal holds, or secure file-retention workflows. Treat evidence entries as readiness records and references, not long-term records-management storage.
        </p>
      </TrustSection>

      <TrustSection title="Billing security">
        <p>
          Payments, checkout, invoices, payment methods, and subscription portal actions are handled by Stripe. ComplianceOne does not collect or store card numbers in the application.
        </p>
      </TrustSection>

      <TrustSection title="Support and security contact">
        <p>
          For product or billing support, contact <a className="font-medium text-cyan-700" href={`mailto:${supportEmail}`}>{supportEmail}</a>. For suspected account, access, or data handling issues, contact <a className="font-medium text-cyan-700" href={`mailto:${securityEmail}`}>{securityEmail}</a>.
        </p>
        <p>
          Include your organization name, account email, affected workspace area, and a concise description of the issue so we can investigate quickly.
        </p>
      </TrustSection>

      <TrustSection title="Incident response expectations">
        <p>
          If a suspected security issue is reported, we triage the concern, protect affected access where appropriate, review relevant application and provider records, and communicate next steps to the reporting contact.
        </p>
        <p>
          Formal customer notification timelines, severity levels, and escalation commitments should be documented before broader enterprise or regulated launch.
        </p>
      </TrustSection>

      <TrustSection title="Not government affiliated and not certification">
        <p>
          ComplianceOne is an independent readiness workspace. It is not affiliated with, endorsed by, or operated by the Government of Canada.
        </p>
        <p>
          The product helps organize CPCSC Level 1 readiness work, evidence references, ownership, and reports. It does not guarantee certification, contract eligibility, government acceptance, audit results, or assessor approval.
        </p>
      </TrustSection>
    </TrustPage>
  );
}

type SendTeamInviteEmailInput = {
  to: string;
  organizationName: string;
  inviteUrl: string;
  invitedByEmail: string | null;
};

type EmailDeliveryResult = {
  status: "sent" | "not_configured" | "failed";
  provider?: "resend";
  messageId?: string;
  error?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendTeamInviteEmail({
  to,
  organizationName,
  inviteUrl,
  invitedByEmail,
}: SendTeamInviteEmailInput): Promise<EmailDeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.INVITE_FROM_EMAIL;
  const replyTo = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

  if (!apiKey || !from) {
    return { status: "not_configured", provider: "resend" };
  }

  const safeOrganizationName = escapeHtml(organizationName);
  const safeInviteUrl = escapeHtml(inviteUrl);
  const safeInviter = invitedByEmail ? escapeHtml(invitedByEmail) : "a workspace admin";

  const text = [
    `You have been invited to join ${organizationName} on ComplianceOne.`,
    invitedByEmail ? `Invited by: ${invitedByEmail}` : null,
    "",
    "Accept the invitation:",
    inviteUrl,
    "",
    "This invitation link expires in 14 days.",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:620px;margin:0 auto;padding:24px;">
      <p style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#0891b2;">ComplianceOne invitation</p>
      <h1 style="font-size:28px;line-height:1.2;margin:12px 0 16px;">Join ${safeOrganizationName}</h1>
      <p>${safeInviter} invited you to join their CPCSC Level 1 readiness workspace.</p>
      <p style="margin:28px 0;">
        <a href="${safeInviteUrl}" style="background:#020617;color:#ffffff;text-decoration:none;border-radius:999px;padding:12px 18px;display:inline-block;font-weight:600;">Accept invitation</a>
      </p>
      <p style="font-size:14px;color:#475569;">This invitation link expires in 14 days. If the button does not work, copy and paste this link into your browser:</p>
      <p style="font-size:14px;word-break:break-all;color:#0f172a;">${safeInviteUrl}</p>
    </div>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `You're invited to ${organizationName} on ComplianceOne`,
        text,
        html,
        reply_to: replyTo || undefined,
      }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        status: "failed",
        provider: "resend",
        error: payload?.message || payload?.error || "Unable to send invitation email.",
      };
    }

    return { status: "sent", provider: "resend", messageId: payload?.id };
  } catch (error) {
    return {
      status: "failed",
      provider: "resend",
      error: error instanceof Error ? error.message : "Unable to send invitation email.",
    };
  }
}

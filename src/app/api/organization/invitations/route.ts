import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { canInviteMembers } from "@/lib/permissions";
import { sendTeamInviteEmail } from "@/lib/email";
import { getSupabaseAdmin } from "@/lib/supabase";

const inviteSchema = z.object({
  email: z.email("Enter a valid email address.").transform((email) => email.trim().toLowerCase()),
  role: z.enum(["admin", "member"]).default("member"),
});

function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function GET() {
  const user = await getCurrentUser();

  if (!user?.organization?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!canInviteMembers(user)) {
    return NextResponse.json({ error: "Only organization owners and admins can view invitations." }, { status: 403 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("organization_invitations")
    .select("id, email, role, status, expires_at, created_at")
    .eq("organization_id", user.organization.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Unable to load invitations." }, { status: 500 });
  }

  return NextResponse.json({ invitations: data ?? [] });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user?.organization?.id || !user.organizationMembership?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!canInviteMembers(user)) {
    return NextResponse.json({ error: "Only organization owners and admins can invite teammates." }, { status: 403 });
  }

  const parsed = inviteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid invitation." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: existingMember } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("email", parsed.data.email)
    .maybeSingle();

  if (existingMember?.user_id) {
    const { data: membership } = await supabase
      .from("organization_memberships")
      .select("id, status")
      .eq("organization_id", user.organization.id)
      .eq("user_id", existingMember.user_id)
      .maybeSingle();

    if (membership && membership.status !== "disabled") {
      return NextResponse.json({ error: "That user is already a member or has an active invitation." }, { status: 409 });
    }
  }

  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashInviteToken(token);
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("organization_invitations")
    .insert({
      organization_id: user.organization.id,
      email: parsed.data.email,
      role: parsed.data.role,
      token_hash: tokenHash,
      invited_by_membership_id: user.organizationMembership.id,
      status: "pending",
      expires_at: expiresAt,
    })
    .select("id, email, role, status, expires_at, created_at")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Unable to create invitation." }, { status: 500 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const inviteUrl = `${baseUrl}/invite/accept?token=${token}`;
  const delivery = await sendTeamInviteEmail({
    to: parsed.data.email,
    organizationName: user.organization.name,
    inviteUrl,
    invitedByEmail: user.email,
  });

  const deliveryPatch = {
    delivery_status: delivery.status,
    delivery_provider: delivery.provider ?? null,
    provider_message_id: delivery.messageId ?? null,
    last_delivery_error: delivery.error ?? null,
    last_sent_at: delivery.status === "sent" ? new Date().toISOString() : null,
  };

  const { data: updatedInvitation } = await supabase
    .from("organization_invitations")
    .update(deliveryPatch)
    .eq("id", data.id)
    .select("id, email, role, status, expires_at, created_at")
    .single();

  return NextResponse.json({
    invitation: updatedInvitation ?? data,
    inviteUrl,
    delivery,
  });
}

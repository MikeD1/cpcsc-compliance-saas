import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";

  if (!token) {
    return NextResponse.json({ error: "Invitation token is required." }, { status: 400 });
  }

  const user = await getCurrentUser();
  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "Sign in before accepting this invitation." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data: invitation, error: invitationError } = await supabase
    .from("organization_invitations")
    .select("id, organization_id, email, role, status, expires_at")
    .eq("token_hash", hashInviteToken(token))
    .maybeSingle();

  if (invitationError || !invitation) {
    return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
  }

  if (invitation.status !== "pending") {
    return NextResponse.json({ error: "This invitation is no longer pending." }, { status: 400 });
  }

  if (new Date(invitation.expires_at).getTime() < Date.now()) {
    await supabase.from("organization_invitations").update({ status: "expired" }).eq("id", invitation.id);
    return NextResponse.json({ error: "This invitation has expired." }, { status: 400 });
  }

  if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
    return NextResponse.json({ error: "This invitation was sent to a different email address." }, { status: 403 });
  }

  const { data: membership, error: membershipError } = await supabase
    .from("organization_memberships")
    .upsert(
      {
        organization_id: invitation.organization_id,
        user_id: user.id,
        role: invitation.role,
        status: "active",
        joined_at: new Date().toISOString(),
      },
      { onConflict: "organization_id,user_id" },
    )
    .select("id")
    .single();

  if (membershipError || !membership) {
    return NextResponse.json({ error: "Unable to join organization." }, { status: 500 });
  }

  await supabase
    .from("profiles")
    .update({ default_organization_id: invitation.organization_id })
    .eq("user_id", user.id);

  await supabase
    .from("organization_invitations")
    .update({ status: "accepted", accepted_at: new Date().toISOString() })
    .eq("id", invitation.id);

  return NextResponse.json({ ok: true, organizationId: invitation.organization_id });
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { canInviteMembers } from "@/lib/permissions";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function DELETE(_request: Request, context: { params: Promise<{ invitationId: string }> }) {
  const { invitationId } = await context.params;
  const user = await getCurrentUser();

  if (!user?.organization?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!canInviteMembers(user)) {
    return NextResponse.json({ error: "Only organization owners and admins can revoke invitations." }, { status: 403 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("organization_invitations")
    .update({ status: "revoked", revoked_at: new Date().toISOString() })
    .eq("id", invitationId)
    .eq("organization_id", user.organization.id)
    .eq("status", "pending")
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Unable to revoke invitation." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

function mapUiStatusToDb(status: string) {
  switch (status) {
    case "COMPLETE":
      return "implemented";
    case "READY_FOR_REVIEW":
      return "needs-review";
    case "IN_PROGRESS":
      return "in-progress";
    default:
      return "not-started";
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ controlId: string }> }) {
  const { controlId } = await context.params;
  const body = await request.json().catch(() => null);
  const user = await getCurrentUser();

  if (!user?.organization?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const payload: Record<string, unknown> = {};

  if (typeof body.status === "string") {
    payload.status = mapUiStatusToDb(body.status);
  }

  if (typeof body.implementationDetails === "string") {
    payload.implementation_prompt = body.implementationDetails;
  }

  if (body.ownerMembershipId !== undefined) {
    if (body.ownerMembershipId === null || body.ownerMembershipId === "") {
      payload.owner_membership_id = null;
    } else if (typeof body.ownerMembershipId === "string") {
      const { data: ownerMembership, error: ownerError } = await supabase
        .from("organization_memberships")
        .select("id, status")
        .eq("id", body.ownerMembershipId)
        .eq("organization_id", user.organization.id)
        .limit(1)
        .maybeSingle();

      if (ownerError || !ownerMembership) {
        return NextResponse.json({ error: "Owner must be a member of this organization." }, { status: 400 });
      }

      if (ownerMembership.status !== "active") {
        return NextResponse.json({ error: "Owner must be an active organization member." }, { status: 400 });
      }

      payload.owner_membership_id = ownerMembership.id;
    } else {
      return NextResponse.json({ error: "Invalid owner value." }, { status: 400 });
    }
  }

  if (body.reviewCadence !== undefined) {
    payload.reviewed_at = body.reviewCadence ? new Date().toISOString() : null;
  }

  const { data, error } = await supabase
    .from("controls")
    .update(payload)
    .eq("organization_id", user.organization.id)
    .eq("id", controlId)
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Unable to update control." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

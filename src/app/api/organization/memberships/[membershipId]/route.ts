import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { canManageMemberLifecycle } from "@/lib/permissions";
import { getSupabaseAdmin } from "@/lib/supabase";

const membershipUpdateSchema = z.object({
  role: z.enum(["owner", "admin", "member"]).optional(),
  status: z.enum(["active", "disabled"]).optional(),
});

async function countActiveOwners(organizationId: string) {
  const supabase = getSupabaseAdmin();
  const { count } = await supabase
    .from("organization_memberships")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("role", "owner")
    .eq("status", "active");

  return count ?? 0;
}

export async function PATCH(request: Request, context: { params: Promise<{ membershipId: string }> }) {
  const { membershipId } = await context.params;
  const user = await getCurrentUser();

  if (!user?.organization?.id || !user.organizationMembership?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!canManageMemberLifecycle(user)) {
    return NextResponse.json({ error: "Only organization owners and admins can manage members." }, { status: 403 });
  }

  const parsed = membershipUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || (!parsed.data.role && !parsed.data.status)) {
    return NextResponse.json({ error: parsed.error?.issues[0]?.message ?? "No membership changes provided." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: membership, error: loadError } = await supabase
    .from("organization_memberships")
    .select("id, organization_id, role, status")
    .eq("id", membershipId)
    .eq("organization_id", user.organization.id)
    .maybeSingle();

  if (loadError || !membership) {
    return NextResponse.json({ error: "Membership not found." }, { status: 404 });
  }

  const nextRole = parsed.data.role ?? membership.role;
  const nextStatus = parsed.data.status ?? membership.status;

  if (membership.role === "owner" && membership.status === "active" && (nextRole !== "owner" || nextStatus !== "active")) {
    const activeOwners = await countActiveOwners(user.organization.id);
    if (activeOwners <= 1) {
      return NextResponse.json({ error: "At least one active owner must remain in the organization." }, { status: 400 });
    }
  }

  if (membership.id === user.organizationMembership.id && nextStatus !== "active") {
    return NextResponse.json({ error: "You cannot disable your own active membership." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("organization_memberships")
    .update({ role: nextRole, status: nextStatus })
    .eq("id", membership.id)
    .eq("organization_id", user.organization.id)
    .select("id, role, status")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Unable to update membership." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, membership: data });
}

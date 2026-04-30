import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { canManageOrganization } from "@/lib/permissions";

const optionalText = z.string().trim().max(5000).optional().nullable();
const optionalDate = z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD dates.").optional().nullable().or(z.literal(""));

const organizationSettingsSchema = z.object({
  name: z.string().trim().min(2, "Organization name must be at least 2 characters.").max(160, "Organization name is too long."),
  canadaBuysId: optionalText,
  primaryContactName: optionalText,
  primaryContactEmail: optionalText,
  readinessScope: optionalText,
  systemsInScope: optionalText,
  attestationCycleStartedAt: optionalDate,
  attestationCompletedAt: optionalDate,
  attestationExpiresAt: optionalDate,
  siInformationInventory: optionalText,
  siStorageLocations: optionalText,
  siPeopleAccess: optionalText,
  siCloudServices: optionalText,
  shortSecurityRules: optionalText,
});

function nullable(value: string | null | undefined) {
  if (value === undefined || value === null || value === "") return null;
  return value;
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();

  if (!user?.organization?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!canManageOrganization(user)) {
    return NextResponse.json({ error: "Only organization owners and admins can update organization settings." }, { status: 403 });
  }

  const parsed = organizationSettingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid settings." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("organizations")
    .update({
      name: parsed.data.name,
      canada_buys_id: nullable(parsed.data.canadaBuysId),
      primary_contact_name: nullable(parsed.data.primaryContactName),
      primary_contact_email: nullable(parsed.data.primaryContactEmail),
      readiness_scope: nullable(parsed.data.readinessScope),
      systems_in_scope: nullable(parsed.data.systemsInScope),
      attestation_cycle_started_at: nullable(parsed.data.attestationCycleStartedAt),
      attestation_completed_at: nullable(parsed.data.attestationCompletedAt),
      attestation_expires_at: nullable(parsed.data.attestationExpiresAt),
      si_information_inventory: nullable(parsed.data.siInformationInventory),
      si_storage_locations: nullable(parsed.data.siStorageLocations),
      si_people_access: nullable(parsed.data.siPeopleAccess),
      si_cloud_services: nullable(parsed.data.siCloudServices),
      short_security_rules: nullable(parsed.data.shortSecurityRules),
    })
    .eq("id", user.organization.id)
    .select("id, name")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Unable to update organization settings." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, organization: data });
}

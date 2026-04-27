import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

const organizationSettingsSchema = z.object({
  name: z.string().trim().min(2, "Organization name must be at least 2 characters.").max(160, "Organization name is too long."),
});

export async function PATCH(request: Request) {
  const user = await getCurrentUser();

  if (!user?.organization?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (user.organizationMembership?.status !== "active") {
    return NextResponse.json({ error: "Organization membership is not active." }, { status: 403 });
  }

  const parsed = organizationSettingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid settings." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("organizations")
    .update({ name: parsed.data.name })
    .eq("id", user.organization.id)
    .select("id, name")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Unable to update organization settings." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, organization: data });
}

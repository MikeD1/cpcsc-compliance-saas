import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const user = await getCurrentUser();

  if (!user?.organization?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { controlId, title, location, artifactType } = (body ?? {}) as Record<string, string>;

  if (!controlId || !title || !location) {
    return NextResponse.json({ error: "controlId, title, and location are required." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("evidence_items")
    .insert({
      organization_id: user.organization.id,
      control_id: controlId,
      file_name: title,
      storage_path: location,
      evidence_type: artifactType || "Document",
      source: "manual",
      status: "active",
      uploaded_by: user.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Unable to add evidence." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

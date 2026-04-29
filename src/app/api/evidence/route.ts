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
  const { data: control } = await supabase
    .from("controls")
    .select("id")
    .eq("id", controlId)
    .eq("organization_id", user.organization.id)
    .limit(1)
    .maybeSingle();

  if (!control) {
    return NextResponse.json({ error: "Evidence must be linked to a control in this organization." }, { status: 400 });
  }

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
    .select("id, file_name, storage_path, evidence_type, status")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Unable to add evidence." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    evidence: {
      id: data.id,
      title: data.file_name,
      location: data.storage_path,
      artifactType: data.evidence_type ?? "Document",
      status: data.status ?? "active",
    },
  });
}

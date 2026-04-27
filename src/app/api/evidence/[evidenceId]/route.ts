import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

async function verifyControl(controlId: string, organizationId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("controls")
    .select("id")
    .eq("id", controlId)
    .eq("organization_id", organizationId)
    .limit(1)
    .maybeSingle();

  return !error && Boolean(data);
}

export async function PATCH(request: Request, context: { params: Promise<{ evidenceId: string }> }) {
  const { evidenceId } = await context.params;
  const body = await request.json().catch(() => null);
  const user = await getCurrentUser();

  if (!user?.organization?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const payload: Record<string, unknown> = {};

  if (typeof body.title === "string") {
    const title = body.title.trim();
    if (!title) {
      return NextResponse.json({ error: "Evidence title is required." }, { status: 400 });
    }
    payload.file_name = title;
  }

  if (typeof body.location === "string") {
    const location = body.location.trim();
    if (!location) {
      return NextResponse.json({ error: "Evidence location is required." }, { status: 400 });
    }
    payload.storage_path = location;
  }

  if (typeof body.artifactType === "string") {
    payload.evidence_type = body.artifactType.trim() || "Document";
  }

  if (typeof body.controlId === "string") {
    const validControl = await verifyControl(body.controlId, user.organization.id);
    if (!validControl) {
      return NextResponse.json({ error: "Evidence must be linked to a control in this organization." }, { status: 400 });
    }
    payload.control_id = body.controlId;
  }

  if (typeof body.status === "string") {
    if (!["active", "archived", "needs-review"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid evidence status." }, { status: 400 });
    }
    payload.status = body.status;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("evidence_items")
    .update(payload)
    .eq("id", evidenceId)
    .eq("organization_id", user.organization.id)
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Unable to update evidence." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: { params: Promise<{ evidenceId: string }> }) {
  const { evidenceId } = await context.params;
  const user = await getCurrentUser();

  if (!user?.organization?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("evidence_items")
    .update({ status: "archived" })
    .eq("id", evidenceId)
    .eq("organization_id", user.organization.id)
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Unable to archive evidence." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

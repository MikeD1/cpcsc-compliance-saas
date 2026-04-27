import { NextResponse } from "next/server";
import { getCurrentAdminAccess } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function DELETE(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { user, isAdmin } = await getCurrentAdminAccess();

  if (!user) {
    return NextResponse.json({ error: "Log in before using admin actions." }, { status: 401 });
  }

  if (!isAdmin) {
    return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
  }

  const { userId } = await params;

  if (!userId) {
    return NextResponse.json({ error: "userId is required." }, { status: 400 });
  }

  if (userId === user.id) {
    return NextResponse.json({ error: "You cannot delete your own admin user from this screen." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: targetUser, error: getUserError } = await supabase.auth.admin.getUserById(userId);
  if (getUserError || !targetUser?.user) {
    return NextResponse.json({ error: getUserError?.message || "User not found." }, { status: 404 });
  }

  await supabase.from("organization_memberships").delete().eq("user_id", userId);
  await supabase.from("profiles").delete().eq("user_id", userId);

  const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

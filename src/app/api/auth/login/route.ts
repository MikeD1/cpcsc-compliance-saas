import { NextResponse } from "next/server";
import { createSession, getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!accessToken) {
    return NextResponse.json({ error: "Missing Supabase access token." }, { status: 400 });
  }

  await createSession(accessToken);
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unable to establish a Supabase session." }, { status: 401 });
  }

  return NextResponse.json({ ok: true, redirectTo: "/dashboard" });
}

import { cookies, headers } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase";

const SESSION_COOKIE_CANDIDATES = [
  "sb-access-token",
  "sb-dznaipvkmyfmcfbeqfil-auth-token",
  "complianceone_access_token",
];

const APP_SESSION_COOKIE = "complianceone_access_token";

type AppUser = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  organizationMembership: {
    organizationId: string;
    role: string;
    status: string;
  } | null;
  organization: {
    id: string;
    name: string;
    slug: string;
    planCode: string;
    subscriptionStatus: string;
    primaryContactUserId: string | null;
  } | null;
};

export async function createSession(accessToken: string) {
  const cookieStore = await cookies();
  cookieStore.set(APP_SESSION_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(APP_SESSION_COOKIE);
}

export async function verifyPassword() {
  return false;
}

function extractAccessTokenFromCookieValue(raw: string | undefined) {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      const tokenLike = parsed.find((item) => typeof item === "string" && item.split(".").length === 3);
      return tokenLike ?? null;
    }

    if (typeof parsed === "object" && parsed && "access_token" in parsed && typeof parsed.access_token === "string") {
      return parsed.access_token;
    }
  } catch {
    // ignore non-JSON cookie values
  }

  if (raw.split(".").length === 3) {
    return raw;
  }

  return null;
}

export async function getCurrentUser(): Promise<AppUser | null> {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const bearer = headerStore.get("authorization");
  const tokenFromHeader = bearer?.startsWith("Bearer ") ? bearer.slice(7) : null;
  const tokenFromCookie = SESSION_COOKIE_CANDIDATES.map((name) => extractAccessTokenFromCookieValue(cookieStore.get(name)?.value)).find(Boolean) ?? null;
  const token = tokenFromHeader || tokenFromCookie;

  if (!token) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const userResult = await supabase.auth.getUser(token);
  const authUser = userResult.data.user;

  if (!authUser) {
    return null;
  }

  const { data: memberships } = await supabase
    .from("organization_memberships")
    .select("organization_id, role, status")
    .eq("user_id", authUser.id)
    .order("created_at", { ascending: true })
    .limit(1);

  const membership = memberships?.[0] ?? null;

  let organization: AppUser["organization"] = null;
  if (membership?.organization_id) {
    const { data: organizations } = await supabase
      .from("organizations")
      .select("id, name, slug, plan_code, subscription_status, primary_contact_user_id")
      .eq("id", membership.organization_id)
      .limit(1);

    const org = organizations?.[0];
    if (org) {
      organization = {
        id: org.id,
        name: org.name,
        slug: org.slug,
        planCode: org.plan_code,
        subscriptionStatus: org.subscription_status,
        primaryContactUserId: org.primary_contact_user_id,
      };
    }
  }

  return {
    id: authUser.id,
    email: authUser.email ?? null,
    firstName: (authUser.user_metadata.first_name as string | undefined) ?? null,
    lastName: (authUser.user_metadata.last_name as string | undefined) ?? null,
    organizationMembership: membership
      ? {
          organizationId: membership.organization_id,
          role: membership.role,
          status: membership.status,
        }
      : null,
    organization,
  };
}

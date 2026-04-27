import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase";

const APP_SESSION_COOKIE = "complianceone_access_token";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

type AppUser = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  organizationMembership: {
    id: string;
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
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set(APP_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getCurrentUser(): Promise<AppUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(APP_SESSION_COOKIE)?.value ?? null;

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
    .select("id, organization_id, role, status")
    .eq("user_id", authUser.id)
    .order("created_at", { ascending: true })
    .limit(1);

  const membership = memberships?.[0] ?? null;

  let organization: AppUser["organization"] = null;
  if (membership?.organization_id) {
    const { data: organizations, error: organizationError } = await supabase
      .from("organizations")
      .select("id, name, slug, plan_code, subscription_status, primary_contact_user_id")
      .eq("id", membership.organization_id)
      .limit(1);

    let org = organizations?.[0] ?? null;

    if (organizationError || !org) {
      const fallback = await supabase
        .from("organizations")
        .select("id, name, slug")
        .eq("id", membership.organization_id)
        .limit(1);
      const fallbackOrg = fallback.data?.[0] ?? null;

      if (fallbackOrg) {
        org = {
          ...fallbackOrg,
          plan_code: "start",
          subscription_status: "incomplete",
          primary_contact_user_id: null,
        };
      }
    }

    if (org) {
      organization = {
        id: org.id,
        name: org.name,
        slug: org.slug,
        planCode: org.plan_code ?? "start",
        subscriptionStatus: org.subscription_status ?? "incomplete",
        primaryContactUserId: org.primary_contact_user_id ?? null,
      };
    } else {
      organization = {
        id: membership.organization_id,
        name: "Your workspace",
        slug: membership.organization_id,
        planCode: "start",
        subscriptionStatus: "incomplete",
        primaryContactUserId: null,
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
          id: membership.id,
          organizationId: membership.organization_id,
          role: membership.role,
          status: membership.status,
        }
      : null,
    organization,
  };
}

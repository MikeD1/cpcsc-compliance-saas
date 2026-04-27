import { getSupabaseAdmin } from "@/lib/supabase";

export type OrganizationMember = {
  membershipId: string;
  userId: string | null;
  email: string | null;
  fullName: string | null;
  role: string;
  status: string;
  joinedAt: string | null;
};

type MembershipRow = {
  id: string;
  user_id: string | null;
  role: string | null;
  status: string | null;
  joined_at: string | null;
};

type ProfileRow = {
  user_id: string;
  email: string | null;
  full_name: string | null;
};

export async function getOrganizationMembers(organizationId: string): Promise<OrganizationMember[]> {
  const supabase = getSupabaseAdmin();

  const { data: memberships, error: membershipsError } = await supabase
    .from("organization_memberships")
    .select("id, user_id, role, status, joined_at")
    .eq("organization_id", organizationId)
    .order("joined_at", { ascending: true });

  if (membershipsError || !memberships?.length) {
    if (membershipsError) {
      console.error("Unable to load organization members", membershipsError);
    }
    return [];
  }

  const typedMemberships = memberships as MembershipRow[];
  const userIds = typedMemberships.map((membership) => membership.user_id).filter((userId): userId is string => Boolean(userId));

  const profileMap = new Map<string, ProfileRow>();
  if (userIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, email, full_name")
      .in("user_id", userIds);

    if (profilesError) {
      console.error("Unable to load organization member profiles", profilesError);
    }

    (profiles as ProfileRow[] | null)?.forEach((profile) => {
      profileMap.set(profile.user_id, profile);
    });
  }

  return typedMemberships.map((membership) => {
    const profile = membership.user_id ? profileMap.get(membership.user_id) : null;

    return {
      membershipId: membership.id,
      userId: membership.user_id,
      email: profile?.email ?? null,
      fullName: profile?.full_name ?? null,
      role: membership.role ?? "member",
      status: membership.status ?? "active",
      joinedAt: membership.joined_at,
    };
  });
}

export function getMemberDisplayName(member: OrganizationMember | undefined | null) {
  if (!member) {
    return null;
  }

  return member.fullName || member.email || "Unnamed member";
}

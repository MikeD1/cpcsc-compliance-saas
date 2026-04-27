import type { getCurrentUser } from "@/lib/auth";

type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export type OrganizationRole = "owner" | "admin" | "member";

const roleRank: Record<OrganizationRole, number> = {
  owner: 3,
  admin: 2,
  member: 1,
};

export function normalizeOrganizationRole(role: string | null | undefined): OrganizationRole {
  if (role === "owner" || role === "admin" || role === "member") {
    return role;
  }

  return "member";
}

export function isActiveOrganizationMember(user: CurrentUser | null) {
  return user?.organizationMembership?.status === "active";
}

export function hasOrganizationRole(user: CurrentUser | null, minimumRole: OrganizationRole) {
  if (!isActiveOrganizationMember(user)) {
    return false;
  }

  const role = normalizeOrganizationRole(user?.organizationMembership?.role);
  return roleRank[role] >= roleRank[minimumRole];
}

export function canManageOrganization(user: CurrentUser | null) {
  return hasOrganizationRole(user, "admin");
}

export function canManageBilling(user: CurrentUser | null) {
  return hasOrganizationRole(user, "admin");
}

export function canInviteMembers(user: CurrentUser | null) {
  return hasOrganizationRole(user, "admin");
}

export function canManageMemberLifecycle(user: CurrentUser | null) {
  return hasOrganizationRole(user, "admin");
}

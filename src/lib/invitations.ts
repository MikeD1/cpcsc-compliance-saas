import { getSupabaseAdmin } from "@/lib/supabase";

export type OrganizationInvitation = {
  id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
  created_at: string;
};

export async function getOrganizationInvitations(organizationId: string): Promise<OrganizationInvitation[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("organization_invitations")
    .select("id, email, role, status, expires_at, created_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Unable to load organization invitations", error);
    return [];
  }

  return (data ?? []) as OrganizationInvitation[];
}

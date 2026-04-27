import { controls as controlCatalog } from "@/lib/cpcsc";
import { getCurrentUser } from "@/lib/auth";
import { getMemberDisplayName, getOrganizationMembers } from "@/lib/members";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function getDashboardData() {
  const currentUser = await getCurrentUser();
  const organizationId = currentUser?.organization?.id;

  if (!organizationId) {
    throw new Error("Organization data could not be loaded.");
  }

  const supabase = getSupabaseAdmin();

  const [{ data: organizations }, { data: subscriptions }, { data: controls }, { data: evidenceItems }, members] = await Promise.all([
    supabase
      .from("organizations")
      .select("id, name, slug, plan_code, subscription_status")
      .eq("id", organizationId)
      .single(),
    supabase
      .from("subscriptions")
      .select("id, plan_code, status, current_period_end")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("controls")
      .select("id, official_number, family, title, summary, status, implementation_prompt, guidance, owner_membership_id, reviewed_at")
      .eq("organization_id", organizationId)
      .order("official_number", { ascending: true }),
    supabase
      .from("evidence_items")
      .select("id, control_id, file_name, storage_path, evidence_type, status, created_at")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false }),
    getOrganizationMembers(organizationId),
  ]);

  if (!organizations) {
    throw new Error("Organization data could not be loaded.");
  }

  const organization = {
    id: organizations.id,
    name: organizations.name,
    legalName: organizations.name,
    canadaBuysId: null,
    primaryContact: [currentUser.firstName, currentUser.lastName].filter(Boolean).join(" ") || null,
    primaryEmail: currentUser.email,
  };

  const latestSubscription = subscriptions?.[0] ?? null;
  const membersById = new Map(members.map((member) => [member.membershipId, member]));

  const controlCards = controlCatalog.map((control) => {
    const row = controls?.find((item) => item.official_number === control.id);
    const relatedEvidence = (evidenceItems ?? []).filter((item) => item.control_id === row?.id);

    const mappedStatus =
      row?.status === "implemented"
        ? "COMPLETE"
        : row?.status === "needs-review"
          ? "READY_FOR_REVIEW"
          : row?.status === "in-progress"
            ? "IN_PROGRESS"
            : "NOT_STARTED";

    return {
      ...control,
      response: row
        ? {
            id: row.id,
            status: mappedStatus,
            implementationDetails: row.implementation_prompt ?? control.exampleImplementation,
            owner: getMemberDisplayName(membersById.get(row.owner_membership_id ?? "")) ?? "Unassigned",
            ownerMembershipId: row.owner_membership_id ?? null,
            reviewCadence: row.reviewed_at ? "Reviewed" : "Set cadence",
            evidenceItems: relatedEvidence.map((item) => ({
              id: item.id,
              title: item.file_name,
              location: item.storage_path,
              artifactType: item.evidence_type ?? "Document",
            })),
          }
        : null,
    };
  });

  const statusCounts = {
    complete: controlCards.filter((response) => response.response?.status === "COMPLETE").length,
    review: controlCards.filter((response) => response.response?.status === "READY_FOR_REVIEW").length,
    inProgress: controlCards.filter((response) => response.response?.status === "IN_PROGRESS").length,
    notStarted: controlCards.filter((response) => !response.response || response.response.status === "NOT_STARTED").length,
  };

  const categorySummaries = Array.from(
    new Map(
      controlCards.map((item) => [
        item.category,
        {
          category: item.category,
          total: controlCards.filter((card) => card.category === item.category).length,
          completed: controlCards.filter(
            (card) => card.category === item.category && card.response?.status === "COMPLETE",
          ).length,
        },
      ]),
    ).values(),
  );

  const recentEvidence = controlCards
    .flatMap((item) =>
      (item.response?.evidenceItems ?? []).map((evidence) => ({
        controlId: item.id,
        controlTitle: item.title,
        category: item.category,
        ...evidence,
      })),
    )
    .slice(0, 8);

  return {
    organization,
    assessment: {
      title: "CPCSC Level 1 Readiness",
      scopeSummary: "Track the 13 Level 1 controls, ownership, implementation notes, and evidence references your team needs for readiness reviews.",
      riskStatement: latestSubscription?.status
        ? `Subscription status: ${latestSubscription.status}`
        : `Workspace status: ${organizations.subscription_status}`,
    },
    controlCards,
    statusCounts,
    categorySummaries,
    recentEvidence,
    members,
  };
}

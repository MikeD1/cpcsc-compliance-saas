import { controls as controlCatalog, getControlReadinessGuidance, getCriteriaAlignment } from "@/lib/cpcsc";
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
      .select("id, name, slug, plan_code, subscription_status, canada_buys_id, primary_contact_name, primary_contact_email, readiness_scope, systems_in_scope, attestation_cycle_started_at, attestation_completed_at, attestation_expires_at, si_information_inventory, si_storage_locations, si_people_access, si_cloud_services, short_security_rules")
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
    canadaBuysId: organizations.canada_buys_id ?? null,
    primaryContact: organizations.primary_contact_name ?? ([currentUser.firstName, currentUser.lastName].filter(Boolean).join(" ") || null),
    primaryEmail: organizations.primary_contact_email ?? currentUser.email,
    readinessScope: organizations.readiness_scope ?? null,
    systemsInScope: organizations.systems_in_scope ?? null,
    attestationCycleStartedAt: organizations.attestation_cycle_started_at ?? null,
    attestationCompletedAt: organizations.attestation_completed_at ?? null,
    attestationExpiresAt: organizations.attestation_expires_at ?? null,
    siInformationInventory: organizations.si_information_inventory ?? null,
    siStorageLocations: organizations.si_storage_locations ?? null,
    siPeopleAccess: organizations.si_people_access ?? null,
    siCloudServices: organizations.si_cloud_services ?? null,
    shortSecurityRules: organizations.short_security_rules ?? null,
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
      readinessGuidance: getControlReadinessGuidance(control),
      criteriaAlignment: getCriteriaAlignment(control),
      response: row
        ? {
            id: row.id,
            status: mappedStatus,
            implementationDetails: row.implementation_prompt ?? control.exampleImplementation,
            owner: getMemberDisplayName(membersById.get(row.owner_membership_id ?? "")) ?? "Unassigned",
            ownerMembershipId: row.owner_membership_id ?? null,
            reviewCadence: row.reviewed_at ? `Reviewed ${new Date(row.reviewed_at).toISOString().slice(0, 10)}` : "Not reviewed yet",
            reviewedAt: row.reviewed_at ?? null,
            evidenceItems: relatedEvidence.map((item) => ({
              id: item.id,
              title: item.file_name,
              location: item.storage_path,
              artifactType: item.evidence_type ?? "Document",
              status: item.status ?? "active",
              createdAt: item.created_at ?? null,
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

  const actionSummary = {
    readinessPercent: Math.round((statusCounts.complete / Math.max(controlCards.length, 1)) * 100),
    unassigned: controlCards.filter((control) => !control.response?.ownerMembershipId).length,
    missingEvidence: controlCards.filter((control) => (control.response?.evidenceItems.length ?? 0) === 0).length,
    readyForReview: statusCounts.review,
    reviewed: controlCards.filter((control) => Boolean(control.response?.reviewedAt)).length,
  };

  const priorityActions = controlCards
    .flatMap((control) => {
      const response = control.response;
      const status = response?.status ?? "NOT_STARTED";
      const owner = response?.owner ?? "Unassigned";
      const evidenceCount = response?.evidenceItems.length ?? 0;
      const needsOwner = !response?.ownerMembershipId;
      const needsEvidence = evidenceCount === 0;
      const readyForReview = status === "READY_FOR_REVIEW";
      const priority = control.id <= 4 ? "Critical" : control.id <= 9 ? "High" : "Medium";
      const actions = [];

      if (needsOwner) {
        actions.push({
          controlId: control.id,
          officialId: control.officialId,
          title: control.title,
          category: control.category,
          owner,
          status,
          priority,
          actionType: "Assign owner" as const,
          reason: "No one is accountable for this control yet.",
          nextStep: "Choose an active member as the owner so follow-up work has a clear home.",
          href: "/controls#assign-owners",
          sortScore: 100 - control.id,
          needsOwner,
          needsEvidence,
          readyForReview,
        });
      }

      if (needsEvidence) {
        actions.push({
          controlId: control.id,
          officialId: control.officialId,
          title: control.title,
          category: control.category,
          owner,
          status,
          priority,
          actionType: "Add evidence" as const,
          reason: "This control has no evidence records attached.",
          nextStep: `Add one supporting record such as ${control.evidenceExamples[0]?.toLowerCase() ?? "a policy, screenshot, register, or review note"}.`,
          href: "/controls#assign-owners",
          sortScore: 80 - control.id,
          needsOwner,
          needsEvidence,
          readyForReview,
        });
      }

      if (readyForReview) {
        actions.push({
          controlId: control.id,
          officialId: control.officialId,
          title: control.title,
          category: control.category,
          owner,
          status,
          priority,
          actionType: "Review control" as const,
          reason: "The work is marked ready for review but not completed.",
          nextStep: "Review the implementation notes and evidence, then mark it reviewed or send it back for updates.",
          href: "/controls#assign-owners",
          sortScore: 90 - control.id,
          needsOwner,
          needsEvidence,
          readyForReview,
        });
      }

      if (status === "NOT_STARTED" && !needsOwner && !needsEvidence) {
        actions.push({
          controlId: control.id,
          officialId: control.officialId,
          title: control.title,
          category: control.category,
          owner,
          status,
          priority,
          actionType: "Start implementation" as const,
          reason: "This control has an owner and evidence, but no implementation progress is recorded.",
          nextStep: "Update the implementation notes and move the status to in progress when work has started.",
          href: "/controls",
          sortScore: 60 - control.id,
          needsOwner,
          needsEvidence,
          readyForReview,
        });
      }

      return actions;
    })
    .sort((a, b) => b.sortScore - a.sortScore)
    .slice(0, 5);

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

  const strongestCategory = [...categorySummaries]
    .sort((a, b) => b.completed / Math.max(b.total, 1) - a.completed / Math.max(a.total, 1))[0];
  const riskiestControls = controlCards
    .filter((control) => control.response?.status !== "COMPLETE")
    .sort((a, b) => {
      const aScore = (a.response?.ownerMembershipId ? 0 : 3) + ((a.response?.evidenceItems.length ?? 0) > 0 ? 0 : 3) + (a.id <= 4 ? 2 : a.id <= 9 ? 1 : 0);
      const bScore = (b.response?.ownerMembershipId ? 0 : 3) + ((b.response?.evidenceItems.length ?? 0) > 0 ? 0 : 3) + (b.id <= 4 ? 2 : b.id <= 9 ? 1 : 0);
      return bScore - aScore;
    })
    .slice(0, 3);
  const evidenceQualityWarnings = controlCards
    .filter((control) => {
      const details = control.response?.implementationDetails?.trim() ?? "";
      return control.response?.status === "COMPLETE" && ((control.response?.evidenceItems.length ?? 0) === 0 || details.length < 80);
    })
    .slice(0, 3)
    .map((control) => `${control.officialId}: ${control.title}`);
  const readinessDiagnosis = {
    confidenceLevel:
      actionSummary.readinessPercent >= 85 && actionSummary.missingEvidence === 0
        ? "High"
        : actionSummary.readinessPercent >= 55 && actionSummary.missingEvidence <= 4
          ? "Moderate"
          : "Early",
    headline:
      actionSummary.readinessPercent >= 85 && actionSummary.missingEvidence === 0
        ? "This workspace is close to a buyer-ready CPCSC Level 1 snapshot."
        : actionSummary.readinessPercent >= 55
          ? "This workspace has a credible start, but the buyer-ready story still has gaps."
          : "This workspace is not buyer-ready yet because ownership, evidence, or review coverage is still thin.",
    why: [
      `${statusCounts.complete} of ${controlCards.length} controls are marked complete.`,
      `${actionSummary.missingEvidence} controls still have no evidence records.`,
      `${actionSummary.unassigned} controls still need an accountable owner.`,
      `${actionSummary.readyForReview} controls are waiting for review.`
    ],
    strongestArea: strongestCategory
      ? `${strongestCategory.category}: ${strongestCategory.completed}/${strongestCategory.total} controls complete.`
      : "No strongest area yet.",
    riskiestGaps: riskiestControls.map((control) => ({
      officialId: control.officialId,
      title: control.title,
      reason:
        !control.response?.ownerMembershipId && (control.response?.evidenceItems.length ?? 0) === 0
          ? "No owner and no evidence record yet."
          : !control.response?.ownerMembershipId
            ? "No owner assigned yet."
            : (control.response?.evidenceItems.length ?? 0) === 0
              ? "No evidence record attached yet."
              : "Implementation or review is not complete yet.",
    })),
    evidenceQualityWarnings,
  };


  const totalCriteria = controlCards.reduce((sum, control) => sum + control.criteriaAlignment.determinationStatements.length, 0);
  const coveredCriteria = controlCards.reduce((sum, control) => sum + (control.response?.status === "COMPLETE" ? control.criteriaAlignment.determinationStatements.length : 0), 0);
  const totalOdps = controlCards.reduce((sum, control) => sum + control.criteriaAlignment.organizationDefinedParameterDetails.length, 0);
  const scopeFields = [organization.readinessScope, organization.systemsInScope, organization.siInformationInventory, organization.siStorageLocations, organization.siPeopleAccess, organization.siCloudServices];
  const completedScopeFields = scopeFields.filter((value) => Boolean(value?.trim())).length;
  const now = new Date();
  const expiryDate = organization.attestationExpiresAt ? new Date(`${organization.attestationExpiresAt}T00:00:00Z`) : null;
  const daysUntilExpiry = expiryDate ? Math.ceil((expiryDate.getTime() - now.getTime()) / 86_400_000) : null;
  const attestationPackage = {
    canadaBuysReady: Boolean(organization.canadaBuysId && organization.attestationExpiresAt && actionSummary.missingEvidence === 0 && actionSummary.unassigned === 0),
    cycleStartedAt: organization.attestationCycleStartedAt,
    completedAt: organization.attestationCompletedAt,
    expiresAt: organization.attestationExpiresAt,
    daysUntilExpiry,
    renewalStatus: !expiryDate ? "Not scheduled" : daysUntilExpiry !== null && daysUntilExpiry < 0 ? "Expired" : daysUntilExpiry !== null && daysUntilExpiry <= 60 ? "Renewal soon" : "Current",
    checklist: [
      { label: "CanadaBuys supplier ID recorded", complete: Boolean(organization.canadaBuysId) },
      { label: "Specified Information scope documented", complete: completedScopeFields >= 4 },
      { label: "All 13 controls have evidence references", complete: actionSummary.missingEvidence === 0 },
      { label: "All controls have owners", complete: actionSummary.unassigned === 0 },
      { label: "Attestation expiry date recorded", complete: Boolean(organization.attestationExpiresAt) },
    ],
  };
  const criteriaCoverage = {
    total: totalCriteria,
    covered: coveredCriteria,
    percent: Math.round((coveredCriteria / Math.max(totalCriteria, 1)) * 100),
    totalOdps,
    unresolvedOdps: totalOdps,
  };
  const scopeInventory = {
    completedFields: completedScopeFields,
    totalFields: scopeFields.length,
    percent: Math.round((completedScopeFields / scopeFields.length) * 100),
  };
  const evidenceQuality = {
    strong: controlCards.filter((control) => (control.response?.evidenceItems.length ?? 0) > 0 && (control.response?.implementationDetails?.trim().length ?? 0) >= 120 && Boolean(control.response?.ownerMembershipId)).length,
    weak: controlCards.filter((control) => (control.response?.evidenceItems.length ?? 0) > 0 && ((control.response?.implementationDetails?.trim().length ?? 0) < 120 || !control.response?.ownerMembershipId)).length,
    missing: actionSummary.missingEvidence,
    checks: ["Evidence exists", "Evidence has a known location", "Evidence maps to scoped SI systems", "Implementation details explain current practice", "Owner/reviewer is assigned"],
  };
  const defaultShortSecurityRules: Array<{ title: string; text: string }> = [
    { title: "Approved systems rule", text: "Specified Information may only be stored, processed, or transmitted in approved business systems listed in the SI scope inventory." },
    { title: "Account and access rule", text: "Every user must have an individual account, access must match business need, and access must be removed when no longer required." },
    { title: "MFA and authentication rule", text: "Privileged accounts and systems handling SI must use multifactor authentication and documented re-authentication/session controls." },
    { title: "Device approval rule", text: "Only approved and managed devices may connect to systems or services that handle SI." },
    { title: "Media disposal rule", text: "Devices and media containing SI must be sanitized or destroyed before disposal, transfer, or reuse, with records retained." },
    { title: "Public content rule", text: "Public websites, marketing, and external content must be reviewed to ensure SI is not disclosed." },
  ];
  const customShortSecurityRules: Array<{ title: string; text: string }> | undefined = typeof organization.shortSecurityRules === "string"
    ? organization.shortSecurityRules
        .split("\n")
        .map((line: string) => line.trim())
        .filter(Boolean)
        .map((line: string, index: number) => {
      const [title, ...rest] = line.split(":");
      return rest.length > 0
        ? { title: title.trim(), text: rest.join(":").trim() }
        : { title: `Security rule ${index + 1}`, text: line };
        })
    : undefined;
  const shortSecurityRules = customShortSecurityRules?.length ? customShortSecurityRules : defaultShortSecurityRules;

  const recentEvidence = controlCards
    .flatMap((item) =>
      (item.response?.evidenceItems ?? []).map((evidence) => ({
        controlId: item.id,
        officialId: item.officialId,
        controlTitle: item.title,
        category: item.category,
        controlRowId: item.response?.id ?? "",
        ...evidence,
      })),
    )
    .slice(0, 8);

  return {
    organization,
    assessment: {
      title: "CPCSC Level 1 Readiness",
      scopeSummary: organization.readinessScope ?? "Track the 13 Level 1 controls, ownership, implementation notes, and evidence references your team needs for readiness reviews.",
      riskStatement: latestSubscription?.status
        ? `Subscription status: ${latestSubscription.status}`
        : `Workspace status: ${organizations.subscription_status}`,
    },
    controlCards,
    statusCounts,
    actionSummary,
    priorityActions,
    readinessDiagnosis,
    attestationPackage,
    criteriaCoverage,
    scopeInventory,
    evidenceQuality,
    shortSecurityRules,
    categorySummaries,
    recentEvidence,
    members,
  };
}

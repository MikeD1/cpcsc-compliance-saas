import { getCurrentUser } from "@/lib/auth";
import { normalizeBillingPlanSlug } from "@/lib/plans";

export async function getCurrentAccess() {
  const user = await getCurrentUser();
  const status = user?.organization?.subscriptionStatus ?? null;
  const planCode = normalizeBillingPlanSlug(user?.organization?.planCode) ?? user?.organization?.planCode ?? null;

  const hasActiveSubscription = status === "active" || status === "trialing";

  return {
    user,
    latestSubscription: status
      ? {
          status,
          planSlug: planCode,
        }
      : null,
    hasActiveSubscription,
  };
}

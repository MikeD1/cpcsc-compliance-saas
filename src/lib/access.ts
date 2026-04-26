import { getCurrentUser } from "@/lib/auth";

export async function getCurrentAccess() {
  const user = await getCurrentUser();
  const status = user?.organization?.subscriptionStatus ?? null;
  const planCode = user?.organization?.planCode ?? null;

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

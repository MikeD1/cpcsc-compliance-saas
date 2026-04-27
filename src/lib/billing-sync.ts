import Stripe from "stripe";
import { getPlanSlugByPriceId } from "@/lib/plans";
import { getStripeServer } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";

const statusMap: Record<string, string> = {
  trialing: "trialing",
  active: "active",
  past_due: "past_due",
  canceled: "canceled",
  incomplete: "incomplete",
  incomplete_expired: "incomplete",
  unpaid: "past_due",
  paused: "past_due",
};

type SupabaseAdmin = ReturnType<typeof getSupabaseAdmin>;

type SubscriptionSyncPayload = {
  organizationId: string;
  stripeSubscriptionId: string;
  stripePriceId: string | null;
  status: string;
  planCode: string;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd: boolean;
};

export async function syncOrganizationSubscription(supabase: SupabaseAdmin, payload: SubscriptionSyncPayload) {
  await supabase.from("subscriptions").upsert(
    {
      organization_id: payload.organizationId,
      stripe_subscription_id: payload.stripeSubscriptionId,
      stripe_price_id: payload.stripePriceId,
      plan_code: payload.planCode,
      status: payload.status,
      current_period_start: payload.currentPeriodStart ?? null,
      current_period_end: payload.currentPeriodEnd ?? null,
      cancel_at_period_end: payload.cancelAtPeriodEnd,
    },
    { onConflict: "stripe_subscription_id" },
  );

  await supabase
    .from("organizations")
    .update({
      plan_code: payload.planCode,
      subscription_status: payload.status,
    })
    .eq("id", payload.organizationId);
}

export async function syncStripeSubscriptionForOrganization({
  organizationId,
  stripeSubscription,
  fallbackPlanCode = "start",
}: {
  organizationId: string;
  stripeSubscription: Stripe.Subscription;
  fallbackPlanCode?: string | null;
}) {
  const supabase = getSupabaseAdmin();
  const stripePriceId = stripeSubscription.items.data[0]?.price?.id ?? null;
  const planCode = stripeSubscription.metadata?.plan || getPlanSlugByPriceId(stripePriceId) || fallbackPlanCode || "start";

  await syncOrganizationSubscription(supabase, {
    organizationId,
    stripeSubscriptionId: stripeSubscription.id,
    stripePriceId,
    status: statusMap[stripeSubscription.status] ?? "incomplete",
    planCode,
    currentPeriodStart: stripeSubscription.items.data[0]?.current_period_start
      ? new Date(stripeSubscription.items.data[0].current_period_start * 1000).toISOString()
      : null,
    currentPeriodEnd: stripeSubscription.items.data[0]?.current_period_end
      ? new Date(stripeSubscription.items.data[0].current_period_end * 1000).toISOString()
      : null,
    cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
  });

  return { status: statusMap[stripeSubscription.status] ?? "incomplete", planCode };
}

export async function syncCheckoutSessionForOrganization({
  checkoutSessionId,
  organizationId,
}: {
  checkoutSessionId: string;
  organizationId: string;
}) {
  const stripe = getStripeServer();
  const session = await stripe.checkout.sessions.retrieve(checkoutSessionId, { expand: ["subscription"] });

  if (session.metadata?.organizationId !== organizationId) {
    throw new Error("Checkout session does not belong to this organization.");
  }

  const subscription = session.subscription;
  if (!subscription || typeof subscription === "string") {
    throw new Error("Checkout session has no subscription to sync yet.");
  }

  return syncStripeSubscriptionForOrganization({
    organizationId,
    stripeSubscription: subscription,
    fallbackPlanCode: session.metadata?.plan,
  });
}

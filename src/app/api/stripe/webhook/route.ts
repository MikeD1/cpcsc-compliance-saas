import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getStripeServer } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getPlanSlugByPriceId } from "@/lib/plans";

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

async function syncOrganizationSubscription(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  payload: {
    organizationId: string;
    stripeSubscriptionId: string;
    stripePriceId: string | null;
    status: string;
    planCode: string;
    currentPeriodStart?: string | null;
    currentPeriodEnd?: string | null;
    cancelAtPeriodEnd: boolean;
  },
) {
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

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe webhook not configured." }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const stripe = getStripeServer();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid signature." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const organizationId = session.metadata?.organizationId;

    if (organizationId && typeof session.subscription === "string") {
      const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription);
      const stripePriceId = stripeSubscription.items.data[0]?.price?.id ?? null;
      const planCode =
        stripeSubscription.metadata?.plan ||
        session.metadata?.plan ||
        getPlanSlugByPriceId(stripePriceId) ||
        "start";

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
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const status = statusMap[subscription.status] ?? "incomplete";

    let organizationId = typeof subscription.metadata?.organizationId === "string" ? subscription.metadata.organizationId : null;
    if (!organizationId) {
      const { data: existing } = await supabase
        .from("subscriptions")
        .select("organization_id")
        .eq("stripe_subscription_id", subscription.id)
        .single();
      organizationId = existing?.organization_id ?? null;
    }

    if (organizationId) {
      const stripePriceId = subscription.items.data[0]?.price?.id ?? null;
      const planCode =
        (typeof subscription.metadata?.plan === "string" ? subscription.metadata.plan : null) ||
        getPlanSlugByPriceId(stripePriceId) ||
        "start";

      await syncOrganizationSubscription(supabase, {
        organizationId,
        stripeSubscriptionId: subscription.id,
        stripePriceId,
        status,
        planCode,
        currentPeriodStart: subscription.items.data[0]?.current_period_start
          ? new Date(subscription.items.data[0].current_period_start * 1000).toISOString()
          : null,
        currentPeriodEnd: subscription.items.data[0]?.current_period_end
          ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
          : null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      });
    }
  }

  return NextResponse.json({ received: true });
}

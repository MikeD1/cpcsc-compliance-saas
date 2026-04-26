import Stripe from "stripe";
import { NextResponse } from "next/server";
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
    const planSlug = session.metadata?.plan;

    if (organizationId && planSlug) {
      let stripePriceId: string | null = null;
      if (typeof session.subscription === "string") {
        const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription);
        stripePriceId = stripeSubscription.items.data[0]?.price?.id ?? null;
      }

      await supabase.from("subscriptions").upsert(
        {
          organization_id: organizationId,
          stripe_subscription_id: typeof session.subscription === "string" ? session.subscription : null,
          stripe_price_id: stripePriceId,
          plan_code: planSlug,
          status: "active",
          cancel_at_period_end: false,
        },
        { onConflict: "stripe_subscription_id" },
      );

      await supabase
        .from("organizations")
        .update({
          plan_code: planSlug,
          subscription_status: "active",
        })
        .eq("id", organizationId);
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const status = statusMap[subscription.status] ?? "incomplete";

    await supabase.from("subscriptions").upsert(
      {
        organization_id: typeof subscription.metadata?.organizationId === "string" ? subscription.metadata.organizationId : undefined,
        stripe_subscription_id: subscription.id,
        stripe_price_id: subscription.items.data[0]?.price?.id ?? null,
        plan_code: typeof subscription.metadata?.plan === "string" ? subscription.metadata.plan : "start",
        status,
        current_period_start: subscription.items.data[0]?.current_period_start
          ? new Date(subscription.items.data[0].current_period_start * 1000).toISOString()
          : null,
        current_period_end: subscription.items.data[0]?.current_period_end
          ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
          : null,
        cancel_at_period_end: subscription.cancel_at_period_end,
      },
      { onConflict: "stripe_subscription_id" },
    );

    const { data: existing } = await supabase
      .from("subscriptions")
      .select("organization_id")
      .eq("stripe_subscription_id", subscription.id)
      .single();

    if (existing?.organization_id) {
      await supabase
        .from("organizations")
        .update({ subscription_status: status })
        .eq("id", existing.organization_id);
    }
  }

  return NextResponse.json({ received: true });
}

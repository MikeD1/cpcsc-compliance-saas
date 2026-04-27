import Stripe from "stripe";
import { NextResponse } from "next/server";
import { syncOrganizationSubscription } from "@/lib/billing-sync";
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

type SupabaseAdmin = ReturnType<typeof getSupabaseAdmin>;

async function beginWebhookEvent(supabase: SupabaseAdmin, event: Stripe.Event) {
  const { data, error } = await supabase
    .from("stripe_webhook_events")
    .insert({
      stripe_event_id: event.id,
      event_type: event.type,
      livemode: event.livemode,
      event_created_at: event.created ? new Date(event.created * 1000).toISOString() : null,
      status: "processing",
      payload: event,
      last_error: null,
      processed_at: null,
    })
    .select("id")
    .single();

  if (data?.id) {
    return { shouldProcess: true, eventLogId: data.id as string };
  }

  if (error?.code !== "23505") {
    throw new Error(error?.message ?? "Unable to record Stripe webhook event.");
  }

  const { data: existing, error: existingError } = await supabase
    .from("stripe_webhook_events")
    .select("id, status")
    .eq("stripe_event_id", event.id)
    .single();

  if (existingError || !existing?.id) {
    throw new Error(existingError?.message ?? "Unable to load existing Stripe webhook event.");
  }

  if (existing.status === "processed" || existing.status === "processing") {
    return { shouldProcess: false, eventLogId: existing.id as string };
  }

  await supabase
    .from("stripe_webhook_events")
    .update({ status: "processing", last_error: null, processed_at: null })
    .eq("id", existing.id);

  return { shouldProcess: true, eventLogId: existing.id as string };
}

async function markWebhookEventProcessed(supabase: SupabaseAdmin, eventLogId: string) {
  await supabase
    .from("stripe_webhook_events")
    .update({ status: "processed", processed_at: new Date().toISOString(), last_error: null })
    .eq("id", eventLogId);
}

async function markWebhookEventFailed(supabase: SupabaseAdmin, eventLogId: string, error: unknown) {
  await supabase
    .from("stripe_webhook_events")
    .update({
      status: "failed",
      last_error: error instanceof Error ? error.message : "Unknown webhook processing error.",
    })
    .eq("id", eventLogId);
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
  let eventLogId: string;

  try {
    const eventState = await beginWebhookEvent(supabase, event);
    eventLogId = eventState.eventLogId;

    if (!eventState.shouldProcess) {
      return NextResponse.json({ received: true, duplicate: true });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to record webhook event." }, { status: 500 });
  }

  try {
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

    await markWebhookEventProcessed(supabase, eventLogId);
  } catch (error) {
    await markWebhookEventFailed(supabase, eventLogId, error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

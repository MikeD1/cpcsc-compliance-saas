import { NextResponse } from "next/server";
import { getStripeServer } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { getPlanSlugByPriceId } from "@/lib/plans";
import { canManageBilling } from "@/lib/permissions";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const organizationId = typeof body?.organizationId === "string" ? body.organizationId : "";

  if (!organizationId) {
    return NextResponse.json({ error: "organizationId is required." }, { status: 400 });
  }

  const currentUser = await getCurrentUser();
  if (!currentUser?.organizationMembership || currentUser.organizationMembership.organizationId !== organizationId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  if (!canManageBilling(currentUser)) {
    return NextResponse.json({ error: "Only organization owners and admins can reconcile billing." }, { status: 403 });
  }

  const supabase = getSupabaseAdmin();
  const stripe = getStripeServer();

  const { data: billingCustomer } = await supabase
    .from("billing_customers")
    .select("stripe_customer_id")
    .eq("organization_id", organizationId)
    .single();

  if (!billingCustomer?.stripe_customer_id) {
    return NextResponse.json({ error: "No Stripe customer found for this organization." }, { status: 404 });
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: billingCustomer.stripe_customer_id,
    limit: 5,
    status: "all",
  });

  const latest = subscriptions.data[0];
  if (!latest) {
    return NextResponse.json({ error: "No Stripe subscription found for this organization." }, { status: 404 });
  }

  const stripePriceId = latest.items.data[0]?.price?.id ?? null;
  const planCode = latest.metadata?.plan || getPlanSlugByPriceId(stripePriceId) || currentUser.organization?.planCode || "start";

  await supabase.from("subscriptions").upsert(
    {
      organization_id: organizationId,
      stripe_subscription_id: latest.id,
      stripe_price_id: stripePriceId,
      plan_code: planCode,
      status: latest.status,
      current_period_start: latest.items.data[0]?.current_period_start
        ? new Date(latest.items.data[0].current_period_start * 1000).toISOString()
        : null,
      current_period_end: latest.items.data[0]?.current_period_end
        ? new Date(latest.items.data[0].current_period_end * 1000).toISOString()
        : null,
      cancel_at_period_end: latest.cancel_at_period_end,
    },
    { onConflict: "stripe_subscription_id" },
  );

  await supabase
    .from("organizations")
    .update({
      plan_code: planCode,
      subscription_status: latest.status,
    })
    .eq("id", organizationId);

  return NextResponse.json({ ok: true, subscriptionId: latest.id, status: latest.status });
}

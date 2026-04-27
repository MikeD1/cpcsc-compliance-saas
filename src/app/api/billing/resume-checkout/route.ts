import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getConfiguredPlanBySlug, getPlanBySlug } from "@/lib/plans";
import { getStripeServer } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";

function checkoutConfigError(planSlug: string) {
  return NextResponse.json(
    {
      error:
        "Checkout is not configured for this plan yet. Confirm STRIPE_SECRET_KEY plus STRIPE_START_PRICE_ID/STRIPE_START_PRODUCT_ID or STRIPE_GROWTH_PRICE_ID/STRIPE_GROWTH_PRODUCT_ID are set in the deployed environment, then redeploy.",
      plan: planSlug,
    },
    { status: 503 },
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const requestedPlanSlug = typeof body.plan === "string" ? body.plan : "start";
  const requestedOrganizationId = typeof body.organizationId === "string" ? body.organizationId : null;
  const selectedPlan = getPlanBySlug(requestedPlanSlug);
  const plan = getConfiguredPlanBySlug(requestedPlanSlug);

  if (!selectedPlan) {
    return NextResponse.json({ error: "Unknown plan selected." }, { status: 400 });
  }

  if (!process.env.STRIPE_SECRET_KEY || !plan) {
    return checkoutConfigError(selectedPlan.slug);
  }

  const currentUser = await getCurrentUser();
  if (!currentUser?.organizationMembership || !currentUser.organization) {
    return NextResponse.json({ error: "Log in again before resuming checkout." }, { status: 401 });
  }

  const organizationId = requestedOrganizationId ?? currentUser.organization.id;
  if (currentUser.organizationMembership.organizationId !== organizationId) {
    return NextResponse.json({ error: "This checkout link does not belong to your active workspace." }, { status: 403 });
  }

  const supabase = getSupabaseAdmin();
  const { data: organization, error: organizationError } = await supabase
    .from("organizations")
    .select("id, name, primary_contact_user_id")
    .eq("id", organizationId)
    .single();

  if (organizationError || !organization) {
    return NextResponse.json({ error: "Workspace not found for checkout." }, { status: 404 });
  }

  const { data: billingCustomer } = await supabase
    .from("billing_customers")
    .select("stripe_customer_id, billing_email")
    .eq("organization_id", organization.id)
    .maybeSingle();

  let billingEmail = billingCustomer?.billing_email ?? currentUser.email ?? undefined;
  if (!billingEmail && organization.primary_contact_user_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("user_id", organization.primary_contact_user_id)
      .maybeSingle();
    billingEmail = profile?.email ?? undefined;
  }

  const stripe = getStripeServer();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

  let customerId = billingCustomer?.stripe_customer_id ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: billingEmail,
      name: organization.name,
      metadata: { organizationId: organization.id },
    });
    customerId = customer.id;

    await supabase.from("billing_customers").upsert({
      organization_id: organization.id,
      stripe_customer_id: customerId,
      billing_email: billingEmail ?? null,
    });
  }

  const [, subscriptionUpdate] = await Promise.all([
    supabase
      .from("organizations")
      .update({ plan_code: selectedPlan.slug, subscription_status: "incomplete" })
      .eq("id", organization.id),
    supabase
      .from("subscriptions")
      .update({ plan_code: selectedPlan.slug, stripe_price_id: plan.stripePriceId, status: "incomplete" })
      .eq("organization_id", organization.id)
      .is("stripe_subscription_id", null)
      .select("id"),
  ]);

  if (!subscriptionUpdate.data?.length) {
    await supabase.from("subscriptions").insert({
      organization_id: organization.id,
      stripe_price_id: plan.stripePriceId,
      plan_code: selectedPlan.slug,
      status: "incomplete",
      cancel_at_period_end: false,
    });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: organization.id,
      success_url: `${baseUrl}/dashboard?checkout=success`,
      cancel_url: `${baseUrl}/dashboard?checkout=cancelled`,
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      metadata: {
        plan: selectedPlan.slug,
        organizationId: organization.id,
        product_id: plan.stripeProductId,
      },
      subscription_data: {
        metadata: {
          plan: selectedPlan.slug,
          organizationId: organization.id,
        },
      },
      allow_promotion_codes: true,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Stripe did not return a checkout URL." }, { status: 502 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Resume checkout failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Stripe checkout could not be started." },
      { status: 502 },
    );
  }
}

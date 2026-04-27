import { NextResponse } from "next/server";
import { getConfiguredPlanBySlug, getPlanBySlug } from "@/lib/plans";
import { getStripeServer } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const planSlug = searchParams.get("plan") || "";
  const requestedOrganizationId = searchParams.get("organizationId") || "";
  const selectedPlan = getPlanBySlug(planSlug);
  const plan = getConfiguredPlanBySlug(planSlug);

  if (!selectedPlan) {
    return NextResponse.redirect(new URL("/pricing", request.url));
  }

  const currentUser = await getCurrentUser();
  const organizationId = requestedOrganizationId || currentUser?.organization?.id || currentUser?.organizationMembership?.organizationId || "";

  if (!organizationId) {
    return NextResponse.redirect(new URL(`/controls?billing=missing_org_context&plan=${selectedPlan.slug}`, request.url));
  }

  if (!process.env.STRIPE_SECRET_KEY || !plan) {
    return NextResponse.redirect(new URL(`/dashboard?billing=missing_config&plan=${selectedPlan.slug}`, request.url));
  }

  if (!currentUser?.organizationMembership || currentUser.organizationMembership.organizationId !== organizationId) {
    return NextResponse.redirect(new URL("/login?error=unauthorized_billing", request.url));
  }

  const supabase = getSupabaseAdmin();
  const { data: organization } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("id", organizationId)
    .single();

  if (!organization) {
    return NextResponse.redirect(new URL("/signup?billing=missing_org", request.url));
  }

  const { data: billingCustomer } = await supabase
    .from("billing_customers")
    .select("stripe_customer_id, billing_email")
    .eq("organization_id", organization.id)
    .single();

  const billingEmail = billingCustomer?.billing_email ?? currentUser.email ?? undefined;

  await Promise.all([
    supabase
      .from("organizations")
      .update({ plan_code: selectedPlan.slug, subscription_status: "incomplete" })
      .eq("id", organization.id),
    supabase
      .from("subscriptions")
      .update({ plan_code: selectedPlan.slug, stripe_price_id: plan.stripePriceId, status: "incomplete" })
      .eq("organization_id", organization.id)
      .is("stripe_subscription_id", null),
  ]);

  const stripe = getStripeServer();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

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

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: organization.id,
    success_url: `${baseUrl}/dashboard?checkout=success`,
    cancel_url: `${baseUrl}/pricing?plan=${plan.slug}&checkout=cancelled`,
    line_items: [
      {
        price: plan.stripePriceId,
        quantity: 1,
      },
    ],
    metadata: {
      plan: plan.slug,
      organizationId: organization.id,
      product_id: plan.stripeProductId,
    },
    subscription_data: {
      metadata: {
        plan: plan.slug,
        organizationId: organization.id,
      },
    },
    allow_promotion_codes: true,
  });

  return NextResponse.redirect(session.url || `${baseUrl}/pricing`);
}

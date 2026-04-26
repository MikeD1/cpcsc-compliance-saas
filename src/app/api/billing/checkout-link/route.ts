import { NextResponse } from "next/server";
import { getPlanBySlug } from "@/lib/plans";
import { getStripeServer } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const planSlug = searchParams.get("plan") || "";
  const organizationId = searchParams.get("organizationId") || "";
  const plan = getPlanBySlug(planSlug);

  if (!plan || !organizationId) {
    return NextResponse.redirect(new URL("/pricing", request.url));
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.redirect(new URL(`/signup?plan=${plan.slug}&billing=missing`, request.url));
  }

  const supabase = getSupabaseAdmin();
  const { data: organization } = await supabase
    .from("organizations")
    .select("id, name, primary_contact_user_id")
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

  let billingEmail = billingCustomer?.billing_email ?? undefined;
  if (!billingEmail && organization.primary_contact_user_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("user_id", organization.primary_contact_user_id)
      .single();
    billingEmail = profile?.email ?? undefined;
  }

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
    allow_promotion_codes: true,
  });

  return NextResponse.redirect(session.url || `${baseUrl}/pricing`);
}

import { NextResponse } from "next/server";
import { getConfiguredPlanBySlug, getPlanBySlug } from "@/lib/plans";
import { getStripeServer } from "@/lib/stripe";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const planSlug = typeof body.plan === "string" ? body.plan : "";
  const selectedPlan = getPlanBySlug(planSlug);
  const plan = getConfiguredPlanBySlug(planSlug);

  if (!selectedPlan) {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  if (!process.env.STRIPE_SECRET_KEY || !plan) {
    return NextResponse.json(
      {
        error: "Stripe is not configured yet. Add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to enable live checkout.",
      },
      { status: 503 },
    );
  }

  const stripe = getStripeServer();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    success_url: `${baseUrl}/signup?plan=${selectedPlan.slug}&checkout=success`,
    cancel_url: `${baseUrl}/pricing?plan=${selectedPlan.slug}&checkout=cancelled`,
    line_items: [
      {
        price: plan.stripePriceId,
        quantity: 1,
      },
    ],
    metadata: {
      plan: plan.slug,
      product_id: plan.stripeProductId,
    },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}

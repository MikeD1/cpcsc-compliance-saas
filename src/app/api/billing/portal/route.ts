import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getStripeServer } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";
import { canManageBilling } from "@/lib/permissions";

export async function GET(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser?.organization?.id || !currentUser.organizationMembership) {
    return NextResponse.redirect(new URL("/login?error=unauthorized_billing", request.url));
  }

  if (!canManageBilling(currentUser)) {
    return NextResponse.redirect(new URL("/settings?billing=role_required", request.url));
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.redirect(new URL("/settings?billing=missing_stripe", request.url));
  }

  const supabase = getSupabaseAdmin();
  const { data: billingCustomer } = await supabase
    .from("billing_customers")
    .select("stripe_customer_id")
    .eq("organization_id", currentUser.organization.id)
    .single();

  if (!billingCustomer?.stripe_customer_id) {
    return NextResponse.redirect(new URL("/settings?billing=missing_customer", request.url));
  }

  const stripe = getStripeServer();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const session = await stripe.billingPortal.sessions.create({
    customer: billingCustomer.stripe_customer_id,
    return_url: `${baseUrl}/settings?billing=portal_return`,
  });

  return NextResponse.redirect(session.url);
}

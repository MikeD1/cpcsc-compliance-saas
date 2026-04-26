import { NextResponse } from "next/server";
import { getPlanBySlug } from "@/lib/plans";
import { getCurrentUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { controls } from "@/lib/cpcsc";

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { firstName, lastName, email, organizationName, plan } = body as Record<string, string>;

  if (!firstName || !lastName || !email || !organizationName || !plan) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  const selectedPlan = getPlanBySlug(plan);
  if (!selectedPlan) {
    return NextResponse.json({ error: "Unknown plan selected." }, { status: 400 });
  }

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Supabase session missing. Please log in again." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const baseSlug = slugify(organizationName) || "organization";
  let slug = baseSlug;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const suffix = attempt === 0 ? "" : `-${Math.floor(Math.random() * 900 + 100)}`;
    const candidate = `${baseSlug}${suffix}`;
    const { data: existing } = await supabase.from("organizations").select("id").eq("slug", candidate).limit(1);
    if (!existing || existing.length === 0) {
      slug = candidate;
      break;
    }
  }

  const { data: organization, error: organizationError } = await supabase
    .from("organizations")
    .insert({
      name: organizationName,
      slug,
      created_by: currentUser.id,
      primary_contact_user_id: currentUser.id,
      plan_code: selectedPlan.slug,
      subscription_status: "incomplete",
      compliance_framework: "cpcsc_level_1",
    })
    .select("id, name, slug")
    .single();

  if (organizationError || !organization) {
    console.error("Organization create failed", organizationError);
    return NextResponse.json({ error: "Unable to create organization." }, { status: 500 });
  }

  await supabase.from("profiles").upsert({
    user_id: currentUser.id,
    email,
    full_name: `${firstName} ${lastName}`,
    default_organization_id: organization.id,
  });

  await supabase.from("organization_memberships").insert({
    organization_id: organization.id,
    user_id: currentUser.id,
    role: "owner",
    status: "active",
    joined_at: new Date().toISOString(),
  });

  await supabase.from("subscriptions").insert({
    organization_id: organization.id,
    stripe_price_id: selectedPlan.stripePriceId,
    plan_code: selectedPlan.slug,
    status: "incomplete",
    cancel_at_period_end: false,
  });

  await supabase.from("controls").insert(
    controls.map((control) => ({
      organization_id: organization.id,
      control_key: `cpcsc-${control.id}`,
      official_number: control.id,
      family: control.category,
      title: control.title,
      summary: control.objective,
      priority: control.id <= 4 ? "Critical" : control.id <= 9 ? "High" : "Medium",
      status: "not-started",
      implementation_prompt: control.exampleImplementation,
      guidance: {
        objective: control.objective,
        whatToDo: control.whatToDo,
        evidenceExamples: control.evidenceExamples,
      },
    })),
  );

  return NextResponse.json({
    ok: true,
    redirectTo: `/api/billing/checkout-link?plan=${selectedPlan.slug}&organizationId=${organization.id}`,
  });
}

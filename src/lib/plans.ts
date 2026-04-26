export type BillingPlanSlug = "start" | "growth";

export type BillingPlan = {
  slug: BillingPlanSlug;
  name: string;
  cadence: string;
  priceCad: number;
  stripeProductId: string;
  stripePriceId: string;
  description: string;
  features: string[];
};

const billingPlanCatalog: Record<BillingPlanSlug, Omit<BillingPlan, "stripeProductId" | "stripePriceId">> = {
  start: {
    slug: "start",
    name: "Start",
    cadence: "monthly",
    priceCad: 149,
    description: "For smaller suppliers getting their CPCSC readiness operation in place.",
    features: [
      "1 organization workspace",
      "13 CPCSC Level 1 controls",
      "Evidence vault and exportable reports",
      "Secure login and subscription-gated access",
    ],
  },
  growth: {
    slug: "growth",
    name: "Growth",
    cadence: "monthly",
    priceCad: 349,
    description: "For growing suppliers with more stakeholders, evidence, and reporting needs.",
    features: [
      "Multi-user readiness workspace",
      "Expanded reporting and plan management",
      "Evidence organization across teams",
      "Priority onboarding and support response",
    ],
  },
};

function getRequiredPlanEnv(slug: BillingPlanSlug, field: "product" | "price") {
  const envKey = `STRIPE_${slug.toUpperCase()}_${field.toUpperCase()}_ID` as const;
  const value = process.env[envKey];

  if (!value) {
    throw new Error(`Missing ${envKey} for billing plan ${slug}.`);
  }

  return value;
}

function getPlanEnv(slug: BillingPlanSlug, field: "product" | "price") {
  const envKey = `STRIPE_${slug.toUpperCase()}_${field.toUpperCase()}_ID` as const;
  return process.env[envKey] ?? null;
}

export function getBillingPlans(): BillingPlan[] {
  return (Object.keys(billingPlanCatalog) as BillingPlanSlug[]).map((slug) => ({
    ...billingPlanCatalog[slug],
    stripeProductId: getRequiredPlanEnv(slug, "product"),
    stripePriceId: getRequiredPlanEnv(slug, "price"),
  }));
}

export function getBillingPlansForDisplay(): BillingPlan[] {
  return (Object.keys(billingPlanCatalog) as BillingPlanSlug[]).map((slug) => ({
    ...billingPlanCatalog[slug],
    stripeProductId: getPlanEnv(slug, "product") ?? "Configured at deploy time",
    stripePriceId: getPlanEnv(slug, "price") ?? "Configured at deploy time",
  }));
}

export function getPlanBySlug(slug: string) {
  return getBillingPlans().find((plan) => plan.slug === slug);
}

export function getPlanSlugByPriceId(priceId: string | null | undefined): BillingPlanSlug | null {
  if (!priceId) {
    return null;
  }

  const plan = getBillingPlans().find((candidate) => candidate.stripePriceId === priceId);
  return plan?.slug ?? null;
}

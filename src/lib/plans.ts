export type BillingPlanSlug = "start" | "growth";

export type BillingPlan = {
  slug: BillingPlanSlug;
  name: string;
  cadence: string;
  priceCad: number;
  stripeProductId: string | null;
  stripePriceId: string | null;
  description: string;
  features: string[];
};

export type ConfiguredBillingPlan = BillingPlan & {
  stripePriceId: string;
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
      "Evidence register and exportable reports",
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
      "Evidence register organization across teams",
      "Priority onboarding and support response",
    ],
  },
};

function getPlanEnv(slug: BillingPlanSlug, field: "product" | "price") {
  const envKey = `STRIPE_${slug.toUpperCase()}_${field.toUpperCase()}_ID` as const;
  return process.env[envKey] || null;
}

export function normalizeBillingPlanSlug(slug: string | null | undefined): BillingPlanSlug | null {
  if (slug === "start" || slug === "starter") {
    return "start";
  }

  if (slug === "growth") {
    return "growth";
  }

  return null;
}

function hydratePlan(slug: BillingPlanSlug): BillingPlan {
  return {
    ...billingPlanCatalog[slug],
    stripeProductId: getPlanEnv(slug, "product"),
    stripePriceId: getPlanEnv(slug, "price"),
  };
}

export function getBillingPlans(): BillingPlan[] {
  return (Object.keys(billingPlanCatalog) as BillingPlanSlug[]).map((slug) => hydratePlan(slug));
}

export function getBillingPlansForDisplay(): BillingPlan[] {
  return getBillingPlans().map((plan) => ({
    ...plan,
    stripeProductId: plan.stripeProductId ?? "Configured at deploy time",
    stripePriceId: plan.stripePriceId ?? "Configured at deploy time",
  }));
}

export function getPlanBySlug(slug: string): BillingPlan | null {
  const normalizedSlug = normalizeBillingPlanSlug(slug);

  if (!normalizedSlug) {
    return null;
  }

  return hydratePlan(normalizedSlug);
}

export function getConfiguredPlanBySlug(slug: string): ConfiguredBillingPlan | null {
  const plan = getPlanBySlug(slug);

  if (!plan?.stripePriceId) {
    return null;
  }

  return plan as ConfiguredBillingPlan;
}

export function getPlanSlugByPriceId(priceId: string | null | undefined): BillingPlanSlug | null {
  if (!priceId) {
    return null;
  }

  const plan = getBillingPlans().find((candidate) => candidate.stripePriceId === priceId);
  return plan?.slug ?? null;
}

export type BillingPlan = {
  slug: "start" | "growth";
  name: string;
  cadence: string;
  priceCad: number;
  stripeProductId: string;
  stripePriceId: string;
  description: string;
  features: string[];
};

export const billingPlans: BillingPlan[] = [
  {
    slug: "start",
    name: "Start",
    cadence: "monthly",
    priceCad: 149,
    stripeProductId: "prod_UNo9gim8j9sDx8",
    stripePriceId: "price_1TP2Xa04be8INTzee9UwTJFI",
    description: "For smaller suppliers getting their CPCSC readiness operation in place.",
    features: [
      "1 organization workspace",
      "13 control readiness workspace",
      "Evidence vault and exportable reports",
      "Secure login and workspace access",
    ],
  },
  {
    slug: "growth",
    name: "Growth",
    cadence: "monthly",
    priceCad: 349,
    stripeProductId: "prod_UNoAIdDFbplooV",
    stripePriceId: "price_1TP2Xq04be8INTzeToSQJ7WF",
    description: "For growing suppliers with more stakeholders, evidence, and reporting needs.",
    features: [
      "Multi-user readiness workspace",
      "Expanded reporting and plan management",
      "Evidence organization across teams",
      "Priority support posture",
    ],
  },
];

export function getPlanBySlug(slug: string) {
  return billingPlans.find((plan) => plan.slug === slug);
}

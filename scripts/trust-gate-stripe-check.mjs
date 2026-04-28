import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

function loadEnv() {
  const env = { ...process.env };
  if (!fs.existsSync(".env")) return env;
  for (const raw of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    let v = line.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    env[line.slice(0, i).trim()] = v;
  }
  return env;
}

const env = loadEnv();
const appUrl = env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const anon = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const service = env.SUPABASE_SERVICE_ROLE_KEY;
const stripeSecret = env.STRIPE_SECRET_KEY;
const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
const priceId = env.STRIPE_START_PRICE_ID;

if (!supabaseUrl || !anon || !service || !stripeSecret || !webhookSecret || !priceId) {
  console.error("Missing required Supabase/Stripe env vars.");
  process.exit(1);
}

const admin = createClient(supabaseUrl, service, { auth: { persistSession: false, autoRefreshToken: false } });
const stripe = new Stripe(stripeSecret);
const tag = `stripe_gate_${Date.now()}`;
const password = `StripeGate-${Date.now()}!`;
const email = `${tag}@example.com`;
const created = { userId: null, orgId: null, customerId: null, subscriptionId: null, eventIds: [] };

async function cleanup() {
  for (const eventId of created.eventIds) await admin.from("stripe_webhook_events").delete().eq("stripe_event_id", eventId);
  if (created.orgId) {
    await admin.from("subscriptions").delete().eq("organization_id", created.orgId);
    await admin.from("billing_customers").delete().eq("organization_id", created.orgId);
    await admin.from("controls").delete().eq("organization_id", created.orgId);
    await admin.from("evidence_items").delete().eq("organization_id", created.orgId);
    await admin.from("organization_memberships").delete().eq("organization_id", created.orgId);
    await admin.from("organizations").delete().eq("id", created.orgId);
  }
  if (created.userId) {
    await admin.from("profiles").delete().eq("user_id", created.userId);
    await admin.auth.admin.deleteUser(created.userId).catch(() => null);
  }
  if (created.customerId) await stripe.customers.del(created.customerId).catch(() => null);
}

function getSetCookie(headers) {
  if (typeof headers.getSetCookie === "function") return headers.getSetCookie().join("; ");
  return headers.get("set-cookie") || "";
}

try {
  console.log(`App URL: ${appUrl}`);
  console.log("Creating test user/org for billing QA...");
  const { data: authData, error: userError } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { first_name: "Stripe", last_name: "Gate" } });
  if (userError || !authData.user) throw new Error(`create user failed: ${userError?.message}`);
  created.userId = authData.user.id;

  const { data: org, error: orgError } = await admin
    .from("organizations")
    .insert({ name: `${tag} Org`, slug: `${tag}-org`, created_by: created.userId, primary_contact_user_id: created.userId, plan_code: "start", subscription_status: "incomplete", compliance_framework: "cpcsc_level_1" })
    .select("id")
    .single();
  if (orgError || !org) throw new Error(`create org failed: ${orgError?.message}`);
  created.orgId = org.id;
  await admin.from("profiles").upsert({ user_id: created.userId, email, full_name: "Stripe Gate", default_organization_id: created.orgId });
  await admin.from("organization_memberships").insert({ organization_id: created.orgId, user_id: created.userId, role: "owner", status: "active", joined_at: new Date().toISOString() });
  await admin.from("subscriptions").insert({ organization_id: created.orgId, stripe_price_id: priceId, plan_code: "start", status: "incomplete", cancel_at_period_end: false });

  const client = createClient(supabaseUrl, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const signIn = await client.auth.signInWithPassword({ email, password });
  if (signIn.error || !signIn.data.session?.access_token) throw new Error(`sign in failed: ${signIn.error?.message}`);
  const login = await fetch(`${appUrl}/api/auth/login`, { method: "POST", headers: { authorization: `Bearer ${signIn.data.session.access_token}` }, redirect: "manual" });
  if (!login.ok) throw new Error(`app login failed: ${login.status} ${await login.text()}`);
  const cookie = getSetCookie(login.headers);
  if (!cookie.includes("complianceone_access_token")) throw new Error("app session cookie missing");
  console.log("PASS app session established");

  const checkout = await fetch(`${appUrl}/api/billing/checkout-link?plan=start&organizationId=${created.orgId}`, { headers: { cookie }, redirect: "manual" });
  const checkoutLocation = checkout.headers.get("location") || "";
  const checkoutPass = [303, 307, 308].includes(checkout.status) && checkoutLocation.includes("checkout.stripe.com");
  console.log(`${checkoutPass ? "PASS" : "FAIL"} checkout-link redirects to Stripe Checkout (${checkout.status})`);
  if (!checkoutPass) throw new Error(`checkout redirect failed: ${checkout.status} ${checkoutLocation}`);

  const { data: billingCustomer } = await admin.from("billing_customers").select("stripe_customer_id").eq("organization_id", created.orgId).single();
  if (!billingCustomer?.stripe_customer_id) throw new Error("billing customer missing after checkout-link");
  created.customerId = billingCustomer.stripe_customer_id;
  console.log("PASS billing customer recorded");

  const subscription = await stripe.subscriptions.create({ customer: created.customerId, items: [{ price: priceId }], trial_period_days: 1, metadata: { organizationId: created.orgId, plan: "start" } });
  created.subscriptionId = subscription.id;
  console.log(`PASS Stripe test subscription created (${subscription.status})`);

  const reconcile = await fetch(`${appUrl}/api/billing/reconcile`, { method: "POST", headers: { cookie, "content-type": "application/json" }, body: JSON.stringify({ organizationId: created.orgId }) });
  const reconcileBody = await reconcile.json().catch(() => ({}));
  const reconcilePass = reconcile.ok && reconcileBody.subscriptionId === subscription.id;
  console.log(`${reconcilePass ? "PASS" : "FAIL"} reconcile route syncs subscription (${reconcile.status})`);
  if (!reconcilePass) throw new Error(`reconcile failed: ${reconcile.status} ${JSON.stringify(reconcileBody)}`);

  const portal = await fetch(`${appUrl}/api/billing/portal`, { headers: { cookie }, redirect: "manual" });
  const portalLocation = portal.headers.get("location") || "";
  const portalPass = [303, 307, 308].includes(portal.status) && portalLocation.includes("billing.stripe.com");
  console.log(`${portalPass ? "PASS" : "FAIL"} customer portal route redirects to Stripe Billing Portal (${portal.status})`);
  if (!portalPass) throw new Error(`portal failed: ${portal.status} ${portalLocation}`);

  const eventId = `evt_${tag}`;
  created.eventIds.push(eventId);
  const event = {
    id: eventId,
    object: "event",
    api_version: "2024-06-20",
    created: Math.floor(Date.now() / 1000),
    data: { object: subscription },
    livemode: false,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
    type: "customer.subscription.updated",
  };
  const payload = JSON.stringify(event);
  const signature = stripe.webhooks.generateTestHeaderString({ payload, secret: webhookSecret });
  const webhook1 = await fetch(`${appUrl}/api/stripe/webhook`, { method: "POST", headers: { "stripe-signature": signature, "content-type": "application/json" }, body: payload });
  const webhook1Body = await webhook1.json().catch(() => ({}));
  console.log(`${webhook1.ok && webhook1Body.received ? "PASS" : "FAIL"} webhook accepts signed subscription update (${webhook1.status})`);
  if (!webhook1.ok) throw new Error(`webhook first failed: ${webhook1.status} ${JSON.stringify(webhook1Body)}`);

  const webhook2 = await fetch(`${appUrl}/api/stripe/webhook`, { method: "POST", headers: { "stripe-signature": signature, "content-type": "application/json" }, body: payload });
  const webhook2Body = await webhook2.json().catch(() => ({}));
  const duplicatePass = webhook2.ok && webhook2Body.duplicate === true;
  console.log(`${duplicatePass ? "PASS" : "FAIL"} duplicate webhook is idempotent (${webhook2.status})`);
  if (!duplicatePass) throw new Error(`webhook duplicate failed: ${webhook2.status} ${JSON.stringify(webhook2Body)}`);

  const { data: eventRow } = await admin.from("stripe_webhook_events").select("status").eq("stripe_event_id", eventId).single();
  console.log(`${eventRow?.status === "processed" ? "PASS" : "FAIL"} webhook event row status=${eventRow?.status ?? "missing"}`);

  await cleanup();
  process.exit(0);
} catch (error) {
  console.error("CHECK_FAILED", error instanceof Error ? error.message : String(error));
  await cleanup();
  process.exit(1);
}

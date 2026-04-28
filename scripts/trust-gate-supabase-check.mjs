import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

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
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anon = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const service = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anon || !service) {
  console.error("Missing Supabase env vars.");
  process.exit(1);
}

const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
const requiredTables = [
  "organizations",
  "profiles",
  "organization_memberships",
  "organization_invitations",
  "subscriptions",
  "billing_customers",
  "controls",
  "evidence_items",
  "control_activity_events",
  "control_comments",
  "admin_support_notes",
  "stripe_webhook_events",
];
const tag = `trust_gate_${Date.now()}`;
const password = `TrustGate-${Date.now()}!`;
const users = [
  { email: `${tag}+a@example.com`, org: `${tag} Org A`, slug: `${tag}-org-a` },
  { email: `${tag}+b@example.com`, org: `${tag} Org B`, slug: `${tag}-org-b` },
];
const created = { userIds: [], orgIds: [], controlIds: [], evidenceIds: [] };

async function cleanup() {
  for (const id of created.evidenceIds) await admin.from("evidence_items").delete().eq("id", id);
  for (const id of created.controlIds) await admin.from("controls").delete().eq("id", id);
  for (const id of created.orgIds) {
    await admin.from("organization_memberships").delete().eq("organization_id", id);
    await admin.from("subscriptions").delete().eq("organization_id", id);
    await admin.from("billing_customers").delete().eq("organization_id", id);
    await admin.from("organizations").delete().eq("id", id);
  }
  for (const id of created.userIds) {
    await admin.from("profiles").delete().eq("user_id", id);
    await admin.auth.admin.deleteUser(id).catch(() => null);
  }
}

try {
  console.log(`Supabase project: ${url}`);
  console.log("\nRequired table reachability via service role:");
  let tableOk = true;
  for (const table of requiredTables) {
    const { error, count } = await admin.from(table).select("*", { head: true, count: "exact" });
    if (error) {
      tableOk = false;
      console.log(`FAIL ${table}: ${error.message}`);
    } else {
      console.log(`PASS ${table}: reachable${typeof count === "number" ? ` (${count} rows)` : ""}`);
    }
  }

  console.log("\nCreating two isolated test users/orgs...");
  for (const u of users) {
    const { data: authData, error: userError } = await admin.auth.admin.createUser({
      email: u.email,
      password,
      email_confirm: true,
      user_metadata: { first_name: "Trust", last_name: "Gate" },
    });
    if (userError || !authData.user) throw new Error(`create user failed: ${userError?.message}`);
    u.userId = authData.user.id;
    created.userIds.push(u.userId);

    const { data: org, error: orgError } = await admin
      .from("organizations")
      .insert({ name: u.org, slug: u.slug, created_by: u.userId, primary_contact_user_id: u.userId, plan_code: "start", subscription_status: "active", compliance_framework: "cpcsc_level_1" })
      .select("id")
      .single();
    if (orgError || !org) throw new Error(`create org failed: ${orgError?.message}`);
    u.orgId = org.id;
    created.orgIds.push(org.id);

    await admin.from("profiles").upsert({ user_id: u.userId, email: u.email, full_name: `Trust Gate ${u.email}`, default_organization_id: u.orgId });
    const { error: membershipError } = await admin.from("organization_memberships").insert({ organization_id: u.orgId, user_id: u.userId, role: "owner", status: "active", joined_at: new Date().toISOString() });
    if (membershipError) throw new Error(`membership failed: ${membershipError.message}`);

    const { data: control, error: controlError } = await admin
      .from("controls")
      .insert({ organization_id: u.orgId, control_key: `${tag}-${u.slug}-control`, official_number: 1, family: "Trust gate", title: `${u.org} isolation control`, summary: "Tenant isolation smoke test", priority: "Critical", status: "in-progress", implementation_prompt: "Trust gate test record" })
      .select("id")
      .single();
    if (controlError || !control) throw new Error(`control failed: ${controlError?.message}`);
    u.controlId = control.id;
    created.controlIds.push(control.id);

    const { data: evidence, error: evidenceError } = await admin
      .from("evidence_items")
      .insert({ organization_id: u.orgId, control_id: u.controlId, file_name: `${u.org} evidence`, storage_path: `trust-gate/${u.slug}`, evidence_type: "Trust gate", status: "active" })
      .select("id")
      .single();
    if (evidenceError || !evidence) throw new Error(`evidence failed: ${evidenceError?.message}`);
    created.evidenceIds.push(evidence.id);
  }

  async function clientFor(email) {
    const client = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw new Error(`sign in ${email} failed: ${error.message}`);
    return client;
  }

  console.log("\nTenant isolation via authenticated browser clients:");
  let isolationOk = true;
  for (const [index, u] of users.entries()) {
    const other = users[index === 0 ? 1 : 0];
    const client = await clientFor(u.email);
    const orgs = await client.from("organizations").select("id,name").in("id", [u.orgId, other.orgId]);
    const controls = await client.from("controls").select("id,organization_id,title").in("id", [u.controlId, other.controlId]);
    const evidence = await client.from("evidence_items").select("id,organization_id,file_name").in("organization_id", [u.orgId, other.orgId]);
    for (const [label, result, expectedId] of [["organizations", orgs, u.orgId], ["controls", controls, u.controlId], ["evidence_items", evidence, u.orgId]]) {
      if (result.error) {
        isolationOk = false;
        console.log(`FAIL ${u.email} ${label}: ${result.error.message}`);
        continue;
      }
      const rows = result.data ?? [];
      const seesOwn = rows.some((row) => row.id === expectedId || row.organization_id === expectedId);
      const seesOther = rows.some((row) => row.id === other.orgId || row.id === other.controlId || row.organization_id === other.orgId);
      const pass = seesOwn && !seesOther;
      if (!pass) isolationOk = false;
      console.log(`${pass ? "PASS" : "FAIL"} ${u.email} ${label}: own=${seesOwn} other=${seesOther} rows=${rows.length}`);
    }

    const updateOther = await client.from("controls").update({ title: "SHOULD_NOT_UPDATE" }).eq("id", other.controlId).select("id");
    const blocked = !updateOther.error && (updateOther.data?.length ?? 0) === 0;
    if (!blocked) isolationOk = false;
    console.log(`${blocked ? "PASS" : "FAIL"} ${u.email} cannot update other org control`);
  }

  console.log("\nSummary:");
  console.log(`${tableOk ? "PASS" : "FAIL"} required table reachability`);
  console.log(`${isolationOk ? "PASS" : "FAIL"} practical tenant isolation`);
  await cleanup();
  process.exit(tableOk && isolationOk ? 0 : 1);
} catch (error) {
  console.error("CHECK_FAILED", error instanceof Error ? error.message : String(error));
  await cleanup();
  process.exit(1);
}

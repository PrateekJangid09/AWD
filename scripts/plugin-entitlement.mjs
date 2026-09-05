#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let failed = false;

function fail(msg) {
  failed = true;
  console.error("fail", msg);
}

function ok(msg) {
  console.log("ok ", msg);
}

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx < 1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(join(root, ".env.local"));
loadEnvFile(join(root, ".env"));

const admin = readFileSync(join(root, "lib/supabase-admin.ts"), "utf8");
if (!admin.includes("export async function ensurePluginUser")) {
  fail("supabase-admin must export ensurePluginUser");
} else ok("ensurePluginUser is exported");
if (!admin.includes("await ensurePluginUser(figmaUserId, trackId)")) {
  fail("recordUse must reuse ensurePluginUser");
} else ok("recordUse upserts through ensurePluginUser");

const entitlement = readFileSync(join(root, "app/api/plugins/entitlement/route.ts"), "utf8");
if (!entitlement.includes("ensurePluginUser")) fail("entitlement check must upsert plugin_users");
else ok("entitlement route calls ensurePluginUser");
if (!entitlement.includes("await ensurePluginUser(figmaUserId, trackId || undefined)")) {
  fail("entitlement must upsert on every check, not only consume");
} else ok("check upserts before consume");
for (const field of ["trackId", "currentPeriodEnd", "status"]) {
  if (!entitlement.includes(field)) fail(`entitlement response must include ${field}`);
}
if (!failed) ok("entitlement returns trackId, status, and currentPeriodEnd");

const supabaseUrl = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const apiBase = (process.env.ENTITLEMENT_TEST_URL || process.env.PLUGIN_API_BASE || "").replace(/\/$/, "");

async function rest(path, { method = "GET", body, extra = {} } = {}) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...extra,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, json };
}

if (apiBase && supabaseUrl && supabaseKey) {
  const figmaUserId = `settings-check-${Date.now()}`;
  const trackId = String(1000000000 + Math.floor(Math.random() * 9000000000));
  try {
    const res = await fetch(`${apiBase}/api/plugins/entitlement`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        figmaUserId,
        trackId,
        plugin: "suite",
        action: "check",
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok && res.status !== 402) {
      fail(`check HTTP ${res.status}`);
    } else if (data.trackId !== trackId) {
      fail(`check should echo trackId, got ${data.trackId}`);
    } else ok(`check returned trackId and plan ${data.plan ?? "null"}`);

    const row = await rest(
      `plugin_users?figma_user_id=eq.${encodeURIComponent(figmaUserId)}&select=figma_user_id,email`,
    );
    const found = Array.isArray(row.json) ? row.json[0] : null;
    if (!found) fail("check without consume did not create plugin_users");
    else if (found.email !== `track:${trackId}`) fail(`plugin_users email was ${found.email}`);
    else ok("check without consume upserted plugin_users");
  } finally {
    await rest(`plugin_users?figma_user_id=eq.${encodeURIComponent(figmaUserId)}`, {
      method: "DELETE",
      extra: { Prefer: "return=minimal" },
    });
    await rest(`plugin_usage?figma_user_id=eq.${encodeURIComponent(figmaUserId)}`, {
      method: "DELETE",
      extra: { Prefer: "return=minimal" },
    });
  }
} else if (supabaseUrl && supabaseKey) {
  ok("source checks passed; set ENTITLEMENT_TEST_URL to also upsert against a running API");
} else {
  ok("source checks passed; Supabase unset so live plugin_users upsert was skipped");
}

if (failed) {
  console.error("plugin-entitlement: failed");
  process.exit(1);
}
console.log("plugin-entitlement: passed");

#!/usr/bin/env node
// Verifies plugin billing tables. Reads SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
// from the environment. Never prints the key.

const url = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!url || !key) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

async function rest(path, { token = key, method = "GET", body, extra = {} } = {}) {
  const res = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: token,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...extra,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  return { status: res.status, json };
}

const users = await rest("plugin_users?select=figma_user_id&limit=1");
if (users.status === 404 && users.json?.code === "PGRST205") {
  console.error("Tables are missing. Run supabase/plugin-billing.sql in the SQL editor:");
  console.error("https://supabase.com/dashboard/project/kxqykdxydhfglnubjghj/sql/new");
  process.exit(2);
}
if (users.status !== 200) {
  console.error("plugin_users unexpected", users.status, users.json);
  process.exit(1);
}
console.log("ok  plugin_users reachable with service role");

const id = `verify-${Date.now()}`;
const insUser = await rest("plugin_users", {
  method: "POST",
  extra: { Prefer: "return=representation" },
  body: { figma_user_id: id, email: "verify@allwebsites.design" },
});
if (insUser.status >= 400) {
  console.error("insert user failed", insUser.status, insUser.json);
  process.exit(1);
}
const insUse = await rest("plugin_usage", {
  method: "POST",
  body: { figma_user_id: id, plugin: "chromary", action: "apply" },
});
if (insUse.status >= 400) {
  console.error("insert usage failed", insUse.status, insUse.json);
  process.exit(1);
}
console.log("ok  service role can insert usage");

if (anon) {
  const blocked = await rest("plugin_users?select=figma_user_id&limit=1", { token: anon });
  if (blocked.status === 200 && Array.isArray(blocked.json) && blocked.json.length > 0) {
    console.error("FAIL anon was able to read plugin_users");
    process.exit(1);
  }
  console.log("ok  anon cannot read billing rows", blocked.status);
}

await rest(`plugin_users?figma_user_id=eq.${encodeURIComponent(id)}`, { method: "DELETE", extra: { Prefer: "return=minimal" } });
console.log("ok  cleaned verify row");
console.log("supabase-verify: passed");

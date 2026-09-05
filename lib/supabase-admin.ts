const PLUGINS = ["chromary", "colorhyme", "truegradient", "webpalette"] as const;

type Row = Record<string, unknown>;

function config() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

async function rest(
  path: string,
  init: RequestInit & { query?: string } = {},
): Promise<{ ok: boolean; status: number; json: unknown }> {
  const cfg = config();
  if (!cfg) return { ok: false, status: 503, json: { error: "supabase_unconfigured" } };
  const { query, ...restInit } = init;
  const response = await fetch(`${cfg.url}/rest/v1/${path}${query ? `?${query}` : ""}`, {
    ...restInit,
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(restInit.headers || {}),
    },
  });
  const json = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, json };
}

export function supabaseConfigured() {
  return Boolean(config());
}

export async function getEntitlement(figmaUserId: string) {
  const res = await rest("plugin_entitlements", {
    query: `figma_user_id=eq.${encodeURIComponent(figmaUserId)}&select=*`,
  });
  const rows = Array.isArray(res.json) ? (res.json as Row[]) : [];
  return rows[0] ?? null;
}

export async function getEntitlementByTrack(trackId: string) {
  const res = await rest("plugin_users", {
    query: `email=eq.${encodeURIComponent(`track:${trackId}`)}&select=figma_user_id,email`,
  });
  const rows = Array.isArray(res.json) ? (res.json as Row[]) : [];
  const userId = typeof rows[0]?.figma_user_id === "string" ? rows[0].figma_user_id : "";
  if (!userId) return null;
  return getEntitlement(userId);
}

export async function countUses(figmaUserId: string, plugin: string) {
  const cfg = config();
  if (!cfg) return 0;
  const query = `figma_user_id=eq.${encodeURIComponent(figmaUserId)}&plugin=eq.${encodeURIComponent(plugin)}&select=id`;
  const response = await fetch(`${cfg.url}/rest/v1/plugin_usage?${query}`, {
    method: "GET",
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      Prefer: "count=exact",
      Range: "0-0",
    },
  });
  const range = response.headers.get("content-range");
  const total = range?.split("/")[1];
  const n = Number(total);
  return Number.isFinite(n) ? n : 0;
}

export async function countSuiteUses(ids: string[]) {
  const cfg = config();
  if (!cfg) return 0;
  const unique = [...new Set(ids.map((id) => id.trim()).filter(Boolean))].slice(0, 4);
  if (!unique.length) return 0;
  const list = unique.map((id) => encodeURIComponent(id)).join(",");
  const query = `figma_user_id=in.(${list})&select=id`;
  const response = await fetch(`${cfg.url}/rest/v1/plugin_usage?${query}`, {
    method: "GET",
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      Prefer: "count=exact",
      Range: "0-0",
    },
  });
  const range = response.headers.get("content-range");
  const total = range?.split("/")[1];
  const n = Number(total);
  return Number.isFinite(n) ? n : 0;
}

export async function ensurePluginUser(figmaUserId: string, trackId?: string) {
  const email = trackId && /^\d{10}$/.test(trackId) ? `track:${trackId}` : undefined;
  await rest("plugin_users", {
    method: "POST",
    query: "on_conflict=figma_user_id",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({
      figma_user_id: figmaUserId,
      ...(email ? { email } : {}),
    }),
  });
}

export async function recordUse(figmaUserId: string, plugin: string, action: string, trackId?: string) {
  await ensurePluginUser(figmaUserId, trackId);
  await rest("plugin_usage", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ figma_user_id: figmaUserId, plugin, action }),
  });
}

export async function upsertEntitlement(input: {
  figmaUserId: string;
  paddleCustomerId?: string | null;
  email?: string | null;
  status: string;
  plan: string | null;
  paddleSubscriptionId: string | null;
  currentPeriodEnd: string | null;
}) {
  await rest("plugin_users", {
    method: "POST",
    query: "on_conflict=figma_user_id",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({
      figma_user_id: input.figmaUserId,
      paddle_customer_id: input.paddleCustomerId ?? null,
      email: input.email ?? null,
    }),
  });
  await rest("plugin_entitlements", {
    method: "POST",
    query: "on_conflict=figma_user_id",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({
      figma_user_id: input.figmaUserId,
      status: input.status,
      plan: input.plan,
      paddle_subscription_id: input.paddleSubscriptionId,
      current_period_end: input.currentPeriodEnd,
      updated_at: new Date().toISOString(),
    }),
  });
}

export async function entitlementByPaddleCustomer(customerId: string) {
  const users = await rest("plugin_users", {
    query: `paddle_customer_id=eq.${encodeURIComponent(customerId)}&select=figma_user_id,email`,
  });
  const row = Array.isArray(users.json) ? (users.json as Row[])[0] : null;
  return row;
}

export { PLUGINS };

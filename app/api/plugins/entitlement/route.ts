import { NextResponse } from "next/server";
import {
  FREE_USES_PER_PLUGIN,
  PADDLE_PRICE_MONTHLY,
  PADDLE_PRICE_YEARLY,
  checkoutEnabled,
  isPluginId,
} from "@/lib/paddle-catalog";
import {
  countSuiteUses,
  ensurePluginUser,
  getEntitlement,
  getEntitlementByTrack,
  recordUse,
  supabaseConfigured,
} from "@/lib/supabase-admin";
import { absUrl } from "@/lib/seo";

export const runtime = "nodejs";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: CORS });
}

export async function POST(request: Request) {
  let body: { figmaUserId?: string; plugin?: string; action?: string; trackId?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const figmaUserId = typeof body.figmaUserId === "string" ? body.figmaUserId.trim() : "";
  const trackId =
    typeof body.trackId === "string" && /^\d{10}$/.test(body.trackId.trim()) ? body.trackId.trim() : "";
  const plugin = typeof body.plugin === "string" ? body.plugin.trim() : "";
  const action = body.action === "consume" ? "consume" : "check";
  if (!figmaUserId || !isPluginId(plugin)) {
    return json({ error: "figmaUserId and a known plugin are required." }, 400);
  }

  const checkoutUrl = absUrl("/api/pay");
  const payload = {
    checkoutUrl,
    checkoutEnabled: checkoutEnabled(),
    priceMonthly: PADDLE_PRICE_MONTHLY,
    priceYearly: PADDLE_PRICE_YEARLY,
    trackId: trackId || null,
  };

  if (!supabaseConfigured()) {
    return json(
      {
        allowed: false,
        remaining: 0,
        plan: null,
        status: null,
        currentPeriodEnd: null,
        reason: "billing_unconfigured",
        ...payload,
      },
      402,
    );
  }

  await ensurePluginUser(figmaUserId, trackId || undefined);

  const entitlement =
    (await getEntitlement(figmaUserId)) || (trackId ? await getEntitlementByTrack(trackId) : null);
  const periodEnd =
    typeof entitlement?.current_period_end === "string" ? entitlement.current_period_end : null;
  const subscribed =
    entitlement?.status === "active" || entitlement?.status === "trialing";
  if (subscribed) {
    return json({
      allowed: true,
      remaining: null,
      plan: typeof entitlement?.plan === "string" ? entitlement.plan : "monthly",
      status: typeof entitlement?.status === "string" ? entitlement.status : "active",
      currentPeriodEnd: periodEnd,
      reason: "subscribed",
      ...payload,
    });
  }

  const used = await countSuiteUses([figmaUserId, trackId]);
  const remaining = Math.max(0, FREE_USES_PER_PLUGIN - used);
  if (remaining <= 0) {
    return json(
      {
        allowed: false,
        remaining: 0,
        plan: "free",
        status: "free",
        currentPeriodEnd: null,
        reason: "paywall",
        ...payload,
      },
      402,
    );
  }

  if (action === "consume") {
    await recordUse(figmaUserId, plugin, "apply", trackId || undefined);
  }

  return json({
    allowed: true,
    remaining: action === "consume" ? remaining - 1 : remaining,
    plan: "free",
    status: "free",
    currentPeriodEnd: null,
    reason: "free_use",
    ...payload,
  });
}

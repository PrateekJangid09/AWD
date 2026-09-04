import { NextResponse } from "next/server";
import {
  FREE_USES_PER_PLUGIN,
  PADDLE_PRICE_MONTHLY,
  PADDLE_PRICE_YEARLY,
  checkoutEnabled,
  isPluginId,
} from "@/lib/paddle-catalog";
import {
  countUses,
  getEntitlement,
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
  let body: { figmaUserId?: string; plugin?: string; action?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const figmaUserId = typeof body.figmaUserId === "string" ? body.figmaUserId.trim() : "";
  const plugin = typeof body.plugin === "string" ? body.plugin.trim() : "";
  const action = body.action === "consume" ? "consume" : "check";
  if (!figmaUserId || !isPluginId(plugin)) {
    return json({ error: "figmaUserId and a known plugin are required." }, 400);
  }

  const checkoutUrl = absUrl("/pricing");
  const payload = {
    checkoutUrl,
    checkoutEnabled: checkoutEnabled(),
    priceMonthly: PADDLE_PRICE_MONTHLY,
    priceYearly: PADDLE_PRICE_YEARLY,
  };

  if (!supabaseConfigured()) {
    return json({
      allowed: true,
      remaining: null,
      plan: null,
      reason: "billing_unconfigured",
      ...payload,
    });
  }

  const entitlement = await getEntitlement(figmaUserId);
  const subscribed =
    entitlement?.status === "active" || entitlement?.status === "trialing";
  if (subscribed) {
    return json({
      allowed: true,
      remaining: null,
      plan: entitlement?.plan ?? "active",
      reason: "subscribed",
      ...payload,
    });
  }

  const used = await countUses(figmaUserId, plugin);
  const remaining = Math.max(0, FREE_USES_PER_PLUGIN - used);
  if (remaining <= 0) {
    return json(
      {
        allowed: false,
        remaining: 0,
        plan: null,
        reason: "paywall",
        ...payload,
      },
      402,
    );
  }

  if (action === "consume") {
    await recordUse(figmaUserId, plugin, "apply");
  }

  return json({
    allowed: true,
    remaining: action === "consume" ? remaining - 1 : remaining,
    plan: "free",
    reason: "free_use",
    ...payload,
  });
}

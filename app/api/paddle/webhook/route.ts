import { NextResponse } from "next/server";
import { PADDLE_PRICE_MONTHLY, PADDLE_PRICE_YEARLY } from "@/lib/paddle-catalog";
import {
  clientIp,
  ipInCidrs,
  paddleWebhookCidrs,
  verifyPaddleSignature,
} from "@/lib/paddle";
import {
  entitlementByPaddleCustomer,
  supabaseConfigured,
  upsertEntitlement,
} from "@/lib/supabase-admin";

export const runtime = "nodejs";

type PaddleEvent = {
  event_type?: string;
  data?: {
    id?: string;
    status?: string;
    customer_id?: string;
    custom_data?: Record<string, unknown> | null;
    items?: Array<{ price?: { id?: string } }>;
    current_billing_period?: { ends_at?: string } | null;
    email?: string;
  };
};

function planFromPriceId(priceId: string | undefined) {
  if (priceId === PADDLE_PRICE_YEARLY) return "yearly";
  if (priceId === PADDLE_PRICE_MONTHLY) return "monthly";
  return null;
}

function figmaIdFrom(event: PaddleEvent, existing?: string | null) {
  const custom = event.data?.custom_data || {};
  const fromCustom =
    (typeof custom.figmaUserId === "string" && custom.figmaUserId) ||
    (typeof custom.figma_user_id === "string" && custom.figma_user_id) ||
    null;
  return fromCustom || existing || null;
}

export async function POST(request: Request) {
  const raw = await request.text();
  const secret = process.env.PADDLE_WEBHOOK_SECRET || "";
  const signature = request.headers.get("paddle-signature");
  if (!verifyPaddleSignature(raw, signature, secret)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  if (process.env.PADDLE_SKIP_IP_CHECK !== "true") {
    try {
      const ip = clientIp(request);
      const cidrs = await paddleWebhookCidrs();
      if (!ip || !ipInCidrs(ip, cidrs)) {
        return NextResponse.json({ error: "ip_not_allowed" }, { status: 401 });
      }
    } catch {
      return NextResponse.json({ error: "ip_list_unavailable" }, { status: 503 });
    }
  }

  let event: PaddleEvent;
  try {
    event = JSON.parse(raw) as PaddleEvent;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!supabaseConfigured()) {
    return NextResponse.json({ ok: true, stored: false, reason: "supabase_unconfigured" });
  }

  const type = event.event_type || "";
  const data = event.data || {};
  const customerId = data.customer_id || null;
  const existing = customerId ? await entitlementByPaddleCustomer(customerId) : null;
  const figmaUserId = figmaIdFrom(event, (existing?.figma_user_id as string | undefined) ?? null);

  if (!figmaUserId) {
    return NextResponse.json({ ok: true, stored: false, reason: "no_figma_user" });
  }

  const priceId = data.items?.[0]?.price?.id;
  const plan = planFromPriceId(priceId);
  const periodEnd = data.current_billing_period?.ends_at ?? null;

  if (
    type === "subscription.activated" ||
    type === "subscription.trialing" ||
    type === "subscription.updated" ||
    type === "subscription.resumed"
  ) {
    await upsertEntitlement({
      figmaUserId,
      paddleCustomerId: customerId,
      email: typeof data.email === "string" ? data.email : null,
      status: data.status === "trialing" ? "trialing" : "active",
      plan,
      paddleSubscriptionId: data.id ?? null,
      currentPeriodEnd: periodEnd,
    });
  }

  if (type === "subscription.canceled" || type === "subscription.paused" || type === "subscription.past_due") {
    await upsertEntitlement({
      figmaUserId,
      paddleCustomerId: customerId,
      status: data.status || "canceled",
      plan,
      paddleSubscriptionId: data.id ?? null,
      currentPeriodEnd: periodEnd,
    });
  }

  return NextResponse.json({ ok: true, stored: true });
}

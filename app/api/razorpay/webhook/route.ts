import { NextResponse } from "next/server";
import { cancelPluginAccess, grantPluginAccess, periodEndFromSubscription } from "@/lib/plugin-access";
import { planById } from "@/lib/paddle-catalog";
import { razorpayKeys, verifyRazorpayWebhookSignature } from "@/lib/razorpay";

export const runtime = "nodejs";

const GRANT_EVENTS = new Set([
  "subscription.charged",
  "subscription.activated",
  "subscription.authenticated",
  "payment_link.paid",
]);

const CANCEL_EVENTS = new Set([
  "subscription.cancelled",
  "subscription.completed",
  "subscription.halted",
  "subscription.expired",
]);

type Notes = Record<string, string>;

function notesOf(value?: { notes?: Notes }) {
  return value?.notes && typeof value.notes === "object" ? value.notes : {};
}

export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature") || "";
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || razorpayKeys().keySecret;
  if (!secret || !verifyRazorpayWebhookSignature(raw, signature, secret)) {
    return NextResponse.json({ error: "signature_mismatch" }, { status: 400 });
  }

  let event: {
    event?: string;
    payload?: {
      payment?: { entity?: { id?: string } };
      payment_link?: { entity?: { status?: string; notes?: Notes } };
      subscription?: {
        entity?: {
          id?: string;
          status?: string;
          current_end?: number | null;
          notes?: Notes;
        };
      };
    };
  };
  try {
    event = JSON.parse(raw) as typeof event;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const name = event.event || "";
  if (!GRANT_EVENTS.has(name) && !CANCEL_EVENTS.has(name)) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const subscription = event.payload?.subscription?.entity;
  const notes = {
    ...notesOf(event.payload?.payment_link?.entity),
    ...notesOf(subscription),
  };
  const paymentId = event.payload?.payment?.entity?.id || "";
  const figmaUserId = typeof notes.figmaUserId === "string" ? notes.figmaUserId : "";
  const trackId = typeof notes.trackId === "string" ? notes.trackId : "";
  const planId = typeof notes.plan === "string" ? notes.plan : "monthly";
  const billingId = figmaUserId || trackId;
  if (!billingId) return NextResponse.json({ ok: true, skipped: true });

  const plan = planById(planId);
  const periodEnd = periodEndFromSubscription(subscription?.current_end, plan?.accessDays);

  if (CANCEL_EVENTS.has(name)) {
    await cancelPluginAccess({
      figmaUserId: billingId,
      planId,
      trackId,
      subscriptionId: subscription?.id,
      periodEnd,
    });
    return NextResponse.json({ ok: true, cancelled: true });
  }

  if (name === "payment_link.paid" && !paymentId) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  await grantPluginAccess({
    figmaUserId: billingId,
    planId,
    paymentId,
    trackId,
    subscriptionId: subscription?.id,
    periodEnd,
  });
  return NextResponse.json({ ok: true });
}

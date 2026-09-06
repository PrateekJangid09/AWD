import { NextResponse } from "next/server";
import { planById } from "@/lib/paddle-catalog";
import { grantPluginAccess, periodEndFromSubscription } from "@/lib/plugin-access";
import {
  razorpayClient,
  razorpayKeys,
  verifyRazorpayPaymentSignature,
  verifyRazorpaySubscriptionSignature,
} from "@/lib/razorpay";

export const runtime = "nodejs";

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status });
}

export async function POST(request: Request) {
  let body: {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_subscription_id?: string;
    razorpay_signature?: string;
    figmaUserId?: string;
    plan?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const orderId = typeof body.razorpay_order_id === "string" ? body.razorpay_order_id.trim() : "";
  const paymentId = typeof body.razorpay_payment_id === "string" ? body.razorpay_payment_id.trim() : "";
  const subscriptionId =
    typeof body.razorpay_subscription_id === "string" ? body.razorpay_subscription_id.trim() : "";
  const signature = typeof body.razorpay_signature === "string" ? body.razorpay_signature.trim() : "";
  if (!paymentId || !signature || (!orderId && !subscriptionId)) {
    return json({ error: "missing_fields" }, 400);
  }

  const { keySecret } = razorpayKeys();
  if (!keySecret) return json({ error: "razorpay_unconfigured" }, 503);

  const signed = subscriptionId
    ? verifyRazorpaySubscriptionSignature(paymentId, subscriptionId, signature, keySecret)
    : verifyRazorpayPaymentSignature(orderId, paymentId, signature, keySecret);
  if (!signed) return json({ error: "signature_mismatch" }, 400);

  let planId = typeof body.plan === "string" ? body.plan : "";
  let figmaUserId =
    typeof body.figmaUserId === "string" && body.figmaUserId.trim() && body.figmaUserId.trim().length <= 128
      ? body.figmaUserId.trim()
      : "";
  let periodEnd: string | null = null;

  const client = razorpayClient();
  if (client && subscriptionId) {
    try {
      const subscription = await client.subscriptions.fetch(subscriptionId);
      const notes = (subscription.notes || {}) as Record<string, string>;
      if (!planId && typeof notes.plan === "string") planId = notes.plan;
      if (!figmaUserId && typeof notes.figmaUserId === "string") figmaUserId = notes.figmaUserId;
      periodEnd = periodEndFromSubscription(subscription.current_end, planById(planId || "monthly")?.accessDays);
    } catch {
      // Signature already matched; notes are optional for unlocking.
    }
  } else if (client && orderId) {
    try {
      const order = await client.orders.fetch(orderId);
      const notes = (order.notes || {}) as Record<string, string>;
      if (!planId && typeof notes.plan === "string") planId = notes.plan;
      if (!figmaUserId && typeof notes.figmaUserId === "string") figmaUserId = notes.figmaUserId;
    } catch {
      // Signature already matched; notes are optional for unlocking.
    }
  }

  const plan = planById(planId);
  if (figmaUserId && plan) {
    await grantPluginAccess({
      figmaUserId,
      planId: plan.id,
      paymentId,
      subscriptionId: subscriptionId || undefined,
      periodEnd,
    });
  }

  return json({
    ok: true,
    paid: true,
    order_id: orderId || null,
    subscription_id: subscriptionId || null,
    payment_id: paymentId,
  });
}

import { NextResponse } from "next/server";
import { planById } from "@/lib/paddle-catalog";
import { grantPluginAccess } from "@/lib/plugin-access";
import {
  razorpayClient,
  razorpayKeys,
  verifyRazorpayPaymentSignature,
} from "@/lib/razorpay";

export const runtime = "nodejs";

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status });
}

export async function POST(request: Request) {
  let body: {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
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
  const signature = typeof body.razorpay_signature === "string" ? body.razorpay_signature.trim() : "";
  if (!orderId || !paymentId || !signature) {
    return json({ error: "missing_fields" }, 400);
  }

  const { keySecret } = razorpayKeys();
  if (!keySecret) return json({ error: "razorpay_unconfigured" }, 503);

  if (!verifyRazorpayPaymentSignature(orderId, paymentId, signature, keySecret)) {
    return json({ error: "signature_mismatch" }, 400);
  }

  let planId = typeof body.plan === "string" ? body.plan : "";
  let figmaUserId =
    typeof body.figmaUserId === "string" && body.figmaUserId.trim() && body.figmaUserId.trim().length <= 128
      ? body.figmaUserId.trim()
      : "";

  const client = razorpayClient();
  if (client) {
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
    await grantPluginAccess({ figmaUserId, planId: plan.id, paymentId });
  }

  return json({
    ok: true,
    paid: true,
    order_id: orderId,
    payment_id: paymentId,
  });
}

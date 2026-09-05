import { NextResponse } from "next/server";
import { planById } from "@/lib/paddle-catalog";
import {
  MIN_AMOUNT_PAISE,
  RAZORPAY_CURRENCY,
  razorpayClient,
  razorpayErrorStatus,
  razorpayKeys,
} from "@/lib/razorpay";

export const runtime = "nodejs";

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status });
}

export async function POST(request: Request) {
  const { keyId, keySecret } = razorpayKeys();
  if (!keyId || !keySecret) {
    return json({ error: "razorpay_unconfigured" }, 503);
  }

  let body: {
    plan?: string;
    amount?: number;
    currency?: string;
    receipt?: string;
    figmaUserId?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const plan = typeof body.plan === "string" ? planById(body.plan) : null;
  const amount = plan
    ? plan.amountPaise
    : Number.isFinite(body.amount)
      ? Math.trunc(Number(body.amount))
      : NaN;
  const currency = plan?.currency || (body.currency === "INR" ? "INR" : RAZORPAY_CURRENCY);

  if (!Number.isFinite(amount) || amount < MIN_AMOUNT_PAISE) {
    return json({ error: "amount_too_small", minimum: MIN_AMOUNT_PAISE }, 400);
  }

  const figmaUserId =
    typeof body.figmaUserId === "string" && body.figmaUserId.trim() && body.figmaUserId.trim().length <= 128
      ? body.figmaUserId.trim()
      : "";
  const receipt =
    typeof body.receipt === "string" && body.receipt.trim()
      ? body.receipt.trim().slice(0, 40)
      : `awd_${plan?.id || "pay"}_${Date.now()}`.slice(0, 40);

  const client = razorpayClient();
  if (!client) return json({ error: "razorpay_unconfigured" }, 503);

  try {
    const order = await client.orders.create({
      amount,
      currency,
      receipt,
      notes: {
        ...(plan ? { plan: plan.id } : {}),
        ...(figmaUserId ? { figmaUserId } : {}),
      },
    });
    return json({
      order_id: order.id,
      amount: Number(order.amount),
      currency: order.currency,
    });
  } catch (err) {
    const { status, message } = razorpayErrorStatus(err);
    return json({ error: message }, status === 401 ? 401 : 500);
  }
}

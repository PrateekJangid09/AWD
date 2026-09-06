import { createHmac, timingSafeEqual } from "node:crypto";
import Razorpay from "razorpay";

export const MIN_AMOUNT_PAISE = 100;
export const RAZORPAY_CURRENCY = "INR";

export function razorpayKeys() {
  return {
    keyId: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "",
  };
}

export function razorpayConfigured() {
  const { keyId, keySecret } = razorpayKeys();
  return Boolean(keyId && keySecret);
}

export function razorpayClient() {
  const { keyId, keySecret } = razorpayKeys();
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

/** HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET) */
export function verifyRazorpayPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string,
): boolean {
  return compareHmac(`${orderId}|${paymentId}`, signature, secret);
}

/** payment_link_id|reference_id|status|payment_id */
export function verifyRazorpayPaymentLinkSignature(
  paymentLinkId: string,
  referenceId: string,
  status: string,
  paymentId: string,
  signature: string,
  secret: string,
): boolean {
  return compareHmac(
    `${paymentLinkId}|${referenceId}|${status}|${paymentId}`,
    signature,
    secret,
  );
}

/** Razorpay webhook: HMAC-SHA256(rawBody, webhook secret) */
export function verifyRazorpayWebhookSignature(rawBody: string, signature: string, secret: string): boolean {
  return compareHmac(rawBody, signature, secret);
}

function compareHmac(payload: string, signature: string, secret: string): boolean {
  if (!payload || !signature || !secret) return false;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** payment_id|subscription_id */
export function verifyRazorpaySubscriptionSignature(
  paymentId: string,
  subscriptionId: string,
  signature: string,
  secret: string,
): boolean {
  return compareHmac(`${paymentId}|${subscriptionId}`, signature, secret);
}

type PlanPeriod = "monthly" | "yearly";

const planIdCache = new Map<string, string>();

function envPlanId(planId: PlanPeriod, currency: string) {
  const specific = process.env[`RAZORPAY_PLAN_${planId.toUpperCase()}_${currency}`] || "";
  const generic = process.env[`RAZORPAY_PLAN_${planId.toUpperCase()}`] || "";
  return specific || generic;
}

function planKey(planId: PlanPeriod, currency: string) {
  return `awd_${planId}_${currency}`;
}

function planItemName(planId: PlanPeriod, currency: string) {
  if (planId === "yearly") {
    return currency === "USD"
      ? "AWD plugin suite · yearly subscription $30"
      : "AWD plugin suite · yearly subscription ₹2490";
  }
  return currency === "USD"
    ? "AWD plugin suite · monthly subscription $3"
    : "AWD plugin suite · monthly subscription ₹249";
}

export async function ensureRazorpayPlanId(input: {
  planId: PlanPeriod;
  currency: string;
  amount: number;
}) {
  const cacheKey = `${input.planId}:${input.currency}:${input.amount}`;
  const cached = planIdCache.get(cacheKey);
  if (cached) return cached;

  const fromEnv = envPlanId(input.planId, input.currency);
  if (fromEnv) {
    planIdCache.set(cacheKey, fromEnv);
    return fromEnv;
  }

  const client = razorpayClient();
  if (!client) throw new Error("razorpay_unconfigured");

  const key = planKey(input.planId, input.currency);
  const name = planItemName(input.planId, input.currency);
  const listed = (await client.plans.all({ count: 100 })) as {
    items?: Array<{
      id?: string;
      period?: string;
      notes?: Record<string, string>;
      item?: { name?: string; amount?: number; currency?: string };
    }>;
  };
  const found = (listed.items || []).find((row) => {
    if (row.notes?.awd_key === key) return true;
    return (
      row.item?.name === name &&
      row.item?.currency === input.currency &&
      Number(row.item?.amount) === input.amount
    );
  });
  if (found?.id) {
    planIdCache.set(cacheKey, found.id);
    return found.id;
  }

  const created = await client.plans.create({
    period: input.planId === "yearly" ? "yearly" : "monthly",
    interval: 1,
    item: {
      name,
      amount: input.amount,
      currency: input.currency,
      description:
        input.planId === "yearly"
          ? "Color Tool Suite yearly subscription — $30 / year"
          : "Color Tool Suite monthly subscription — $3 / month",
    },
    notes: { awd_key: key, plan: input.planId, currency: input.currency },
  });
  planIdCache.set(cacheKey, created.id);
  return created.id;
}

export async function createRazorpaySubscription(input: {
  planId: PlanPeriod;
  amount: number;
  currency: string;
  notes: Record<string, string>;
}) {
  const client = razorpayClient();
  if (!client) throw new Error("razorpay_unconfigured");
  const razorpayPlanId = await ensureRazorpayPlanId({
    planId: input.planId,
    currency: input.currency,
    amount: input.amount,
  });
  const subscription = await client.subscriptions.create({
    plan_id: razorpayPlanId,
    total_count: input.planId === "yearly" ? 10 : 36,
    quantity: 1,
    customer_notify: 0,
    expire_by: Math.floor(Date.now() / 1000) + 2 * 24 * 60 * 60,
    notes: input.notes,
  });
  return subscription;
}

export async function createRazorpayPaymentLink(input: {
  amount: number;
  currency: string;
  description: string;
  referenceId: string;
  notes: Record<string, string>;
  callbackUrl: string;
}) {
  const client = razorpayClient();
  if (!client) throw new Error("razorpay_unconfigured");
  const link = (await client.paymentLink.create({
    amount: input.amount,
    currency: input.currency,
    accept_partial: false,
    description: input.description,
    reference_id: input.referenceId.slice(0, 40),
    notify: { sms: false, email: false },
    reminder_enable: false,
    notes: input.notes,
    callback_url: input.callbackUrl,
    callback_method: "get",
  } as never)) as { id?: string; short_url?: string };
  return link;
}

export function razorpayErrorStatus(err: unknown): { status: number; message: string } {
  if (err && typeof err === "object") {
    const row = err as {
      statusCode?: number;
      status?: number;
      error?: { description?: string; code?: string };
      message?: string;
    };
    const status = Number(row.statusCode || row.status || 500);
    const message =
      row.error?.description || row.message || "Razorpay request failed.";
    if (status === 401) return { status: 401, message };
    return { status: 500, message };
  }
  return { status: 500, message: "Razorpay request failed." };
}

import { createHmac, timingSafeEqual } from "node:crypto";
import Razorpay from "razorpay";

export const MIN_AMOUNT_PAISE = 100;
export const RAZORPAY_CURRENCY = "INR";

export function razorpayKeys() {
  return {
    keyId: process.env.RAZORPAY_KEY_ID || "",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "",
  };
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
  if (!orderId || !paymentId || !signature || !secret) return false;
  const expected = createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
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

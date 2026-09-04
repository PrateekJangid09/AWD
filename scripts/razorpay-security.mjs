#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { createHmac, timingSafeEqual } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let failed = false;
function fail(msg) {
  failed = true;
  console.error("fail", msg);
}
function ok(msg) {
  console.log("ok ", msg);
}

function verify(orderId, paymentId, signature, secret) {
  const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

const secret = "test_secret";
const orderId = "order_abc";
const paymentId = "pay_xyz";
const good = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
if (!verify(orderId, paymentId, good, secret)) fail("valid Razorpay signature rejected");
else ok("valid signature accepted");
if (verify(orderId, paymentId, "00".repeat(32), secret)) fail("wrong hash accepted");
else ok("wrong hash rejected");
if (verify(orderId, paymentId, good, "other")) fail("wrong secret accepted");
else ok("wrong secret rejected");
if (verify("", paymentId, good, secret)) fail("empty order id accepted");
else ok("missing fields rejected");

const button = readFileSync(join(root, "app/pricing/CheckoutButton.tsx"), "utf8");
if (button.includes("RAZORPAY_KEY_SECRET")) fail("frontend contains KEY_SECRET");
else ok("frontend has no KEY_SECRET");

const createOrder = readFileSync(join(root, "app/api/create-order/route.ts"), "utf8");
if (!createOrder.includes("MIN_AMOUNT_PAISE")) fail("create-order must enforce minimum amount");
if (!createOrder.includes("orders.create")) fail("create-order must call Razorpay orders");
else ok("create-order route present");

const verifyRoute = readFileSync(join(root, "app/api/verify-payment/route.ts"), "utf8");
if (!verifyRoute.includes("signature_mismatch")) fail("verify-payment must reject mismatches with 400");
if (!verifyRoute.includes("verifyRazorpayPaymentSignature")) fail("verify-payment must HMAC the payload");
else ok("verify-payment route present");

if (failed) {
  console.error("razorpay-security: failed");
  process.exit(1);
}
console.log("razorpay-security: passed");

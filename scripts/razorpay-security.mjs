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

function verifyLink(linkId, referenceId, status, paymentId, signature, secret) {
  const expected = createHmac("sha256", secret)
    .update(`${linkId}|${referenceId}|${status}|${paymentId}`)
    .digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

const linkGood = createHmac("sha256", secret)
  .update("plink_1|ref_1|paid|pay_xyz")
  .digest("hex");
if (!verifyLink("plink_1", "ref_1", "paid", "pay_xyz", linkGood, secret)) {
  fail("valid payment-link signature rejected");
} else ok("valid payment-link signature accepted");
if (verifyLink("plink_1", "ref_1", "paid", "pay_xyz", "00".repeat(32), secret)) {
  fail("wrong payment-link hash accepted");
} else ok("wrong payment-link hash rejected");

const button = readFileSync(join(root, "app/pricing/CheckoutButton.tsx"), "utf8");
if (button.includes("RAZORPAY_KEY_SECRET")) fail("frontend contains KEY_SECRET");
else ok("frontend has no KEY_SECRET");
if (!button.includes("/api/pay")) fail("CheckoutButton must open /api/pay");
else ok("CheckoutButton opens hosted /api/pay");

const createOrder = readFileSync(join(root, "app/api/create-order/route.ts"), "utf8");
if (!createOrder.includes("MIN_AMOUNT_PAISE")) fail("create-order must enforce minimum amount");
if (!createOrder.includes("orders.create")) fail("create-order must call Razorpay orders");
else ok("create-order route present");

const verifyRoute = readFileSync(join(root, "app/api/verify-payment/route.ts"), "utf8");
if (!verifyRoute.includes("signature_mismatch")) fail("verify-payment must reject mismatches with 400");
if (!verifyRoute.includes("verifyRazorpayPaymentSignature")) fail("verify-payment must HMAC the payload");
if (!verifyRoute.includes("grantPluginAccess")) fail("verify-payment must grant plugin access");
else ok("verify-payment route present");

const payRoute = readFileSync(join(root, "app/api/pay/route.ts"), "utf8");
if (!payRoute.includes("createRazorpayPaymentLink")) fail("/api/pay must create a payment link");
if (!payRoute.includes("figmaUserId")) fail("/api/pay must attach the Figma user id");
else ok("/api/pay creates a hosted payment link");

const callback = readFileSync(join(root, "app/api/razorpay/callback/route.ts"), "utf8");
if (!callback.includes("verifyRazorpayPaymentLinkSignature")) {
  fail("callback must HMAC the payment-link payload");
}
if (!callback.includes("grantPluginAccess")) fail("callback must grant plugin access");
else ok("payment-link callback grants access");

if (failed) {
  console.error("razorpay-security: failed");
  process.exit(1);
}
console.log("razorpay-security: passed");

#!/usr/bin/env node
// Asserts webhook HMAC + CIDR matching, and that Paddle's live IP list is
// fetched (never hard-coded). Keep the algorithms aligned with lib/paddle.ts.

import { createHmac, timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = readFileSync(join(root, "lib/paddle.ts"), "utf8");

function fail(msg) {
  console.error(`FAIL ${msg}`);
  process.exitCode = 1;
}

function ok(msg) {
  console.log(`ok  ${msg}`);
}

if (!source.includes('const IPS_URL = "https://api.paddle.com/ips"')) {
  fail("lib/paddle.ts must fetch https://api.paddle.com/ips");
} else {
  ok("IP list URL is api.paddle.com/ips");
}
if (!source.includes("data?.ipv4_cidrs")) {
  fail("lib/paddle.ts must read data.ipv4_cidrs");
} else {
  ok("reads data.ipv4_cidrs");
}
if (!source.includes("`${ts}:${rawBody}`")) {
  fail("signature payload must be ts:rawBody");
} else {
  ok("HMAC payload is ts:rawBody");
}

function ipv4ToInt(ip) {
  const parts = ip.trim().split(".");
  if (parts.length !== 4) return null;
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null;
  return ((nums[0] << 24) | (nums[1] << 16) | (nums[2] << 8) | nums[3]) >>> 0;
}

function ipInCidrs(ip, cidrs) {
  const addr = ipv4ToInt(ip);
  if (addr === null) return false;
  for (const cidr of cidrs) {
    const [base, bitsRaw] = cidr.split("/");
    const bits = Number(bitsRaw ?? "32");
    const network = ipv4ToInt(base);
    if (network === null || !Number.isFinite(bits)) continue;
    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
    if ((addr & mask) === (network & mask)) return true;
  }
  return false;
}

function verifyPaddleSignature(rawBody, header, secret) {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(
    header.split(";").map((part) => {
      const idx = part.indexOf("=");
      return [part.slice(0, idx).trim(), part.slice(idx + 1).trim()];
    }),
  );
  const ts = parts.ts;
  const h1 = parts.h1;
  if (!ts || !h1) return false;
  const expected = createHmac("sha256", secret).update(`${ts}:${rawBody}`).digest("hex");
  const a = Buffer.from(h1, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

const cidrs = ["34.194.127.46/32", "10.0.0.0/8"];
if (!ipInCidrs("34.194.127.46", cidrs)) fail("exact /32 should match");
else ok("/32 match");
if (ipInCidrs("34.194.127.47", cidrs)) fail("neighbouring /32 should not match");
else ok("/32 neighbour rejected");
if (!ipInCidrs("10.9.8.7", cidrs)) fail("/8 should match");
else ok("/8 match");
if (ipInCidrs("not-an-ip", cidrs)) fail("garbage IP should not match");
else ok("garbage IP rejected");

const secret = "endpoint_secret_test";
const body = '{"event_type":"subscription.activated"}';
const ts = "1710000000";
const h1 = createHmac("sha256", secret).update(`${ts}:${body}`).digest("hex");
if (!verifyPaddleSignature(body, `ts=${ts};h1=${h1}`, secret)) fail("valid signature rejected");
else ok("valid signature accepted");
if (verifyPaddleSignature(body, `ts=${ts};h1=${"00".repeat(32)}`, secret)) fail("wrong hash accepted");
else ok("wrong hash rejected");
if (verifyPaddleSignature(body, `ts=${ts};h1=${h1}`, "other")) fail("wrong secret accepted");
else ok("wrong secret rejected");
if (verifyPaddleSignature(body, null, secret)) fail("missing header accepted");
else ok("missing header rejected");

const catalog = readFileSync(join(root, "lib/paddle-catalog.ts"), "utf8");
for (const needle of ["sandbox-api.paddle.com", "Paddle.Environment", "test_"]) {
  if (catalog.includes(needle) || source.includes(needle)) fail(`live code still mentions ${needle}`);
}
ok("no sandbox host or Environment.set in paddle libs");

const checkout = readFileSync(join(root, "app/pricing/CheckoutButton.tsx"), "utf8");
if (checkout.includes("RAZORPAY_KEY_SECRET") || checkout.includes("KEY_SECRET")) {
  fail("CheckoutButton must never include the Razorpay secret");
}
if (checkout.includes("checkout.razorpay.com/v1/checkout.js")) {
  fail("CheckoutButton must not load checkout.js; use hosted /api/pay");
}
if (!checkout.includes("/api/pay")) fail("CheckoutButton must open hosted /api/pay");
if (!checkout.includes("autoOpen")) fail("CheckoutButton must support auto-opening Razorpay");
else ok("CheckoutButton uses Razorpay hosted payment links");

const entitlement = readFileSync(join(root, "app/api/plugins/entitlement/route.ts"), "utf8");
if (!entitlement.includes('absUrl("/api/pay")')) fail("plugin entitlement must send /api/pay, not /pricing");
else ok("entitlement checkoutUrl is /api/pay");

const checkoutPage = readFileSync(join(root, "app/checkout/page.tsx"), "utf8");
if (!checkoutPage.includes("autoOpen")) fail("checkout page must auto-open Razorpay for old plugin links");
else ok("checkout page auto-opens Razorpay for plugin pay links");

const pricingPage = readFileSync(join(root, "app/pricing/page.tsx"), "utf8");
if (!pricingPage.includes("$3") && !pricingPage.includes("${plan.amountUsd}")) {
  fail("pricing page must show USD as the primary price");
} else if (pricingPage.includes("autoOpen")) {
  fail("pricing page must not auto-create payment links");
} else {
  ok("pricing page shows USD and does not auto-open checkout");
}

const ips = await fetch("https://api.paddle.com/ips", {
  headers: { "Paddle-Version": "1" },
});
if (!ips.ok) {
  fail(`live IP fetch failed: ${ips.status}`);
} else {
  const json = await ips.json();
  const liveCidrs = json?.data?.ipv4_cidrs ?? [];
  if (!liveCidrs.length) fail("Paddle returned no ipv4_cidrs");
  else {
    ok(`fetched ${liveCidrs.length} live webhook CIDRs`);
    const sample = String(liveCidrs[0]).replace(/\/\d+$/, "");
    if (!ipInCidrs(sample, liveCidrs)) fail("matcher rejected the first live CIDR");
    else ok(`matcher accepts ${liveCidrs[0]}`);
  }
}

if (process.exitCode) {
  console.error("paddle-security: failed");
  process.exit(1);
}
console.log("paddle-security: passed");

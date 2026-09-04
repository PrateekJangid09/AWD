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
const checkoutLive = checkout
  .split("\n")
  .filter((line) => !line.trim().startsWith("//"))
  .join("\n");
if (checkoutLive.includes("Environment.set")) fail("CheckoutButton must not set sandbox");
if (!checkout.includes("pwCustomer")) fail("CheckoutButton must pass pwCustomer when a ctm_ id is known");
if (!checkout.includes("autoOpen")) fail("CheckoutButton must support auto-opening Paddle overlay");
else ok("CheckoutButton is live-default and supports pwCustomer");

const entitlement = readFileSync(join(root, "app/api/plugins/entitlement/route.ts"), "utf8");
if (!entitlement.includes('absUrl("/checkout")')) fail("plugin entitlement must send /checkout, not /pricing");
else ok("entitlement checkoutUrl is /checkout");

const checkoutPage = readFileSync(join(root, "app/checkout/page.tsx"), "utf8");
if (!checkoutPage.includes("autoOpen")) fail("checkout page must auto-open Paddle");
else ok("checkout page auto-opens Paddle");

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

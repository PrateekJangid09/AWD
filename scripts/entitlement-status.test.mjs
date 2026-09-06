import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = "/tmp/awd-entitlement-status";
mkdirSync(outDir, { recursive: true });

const tsc = spawnSync(
  "npx",
  [
    "tsc",
    "--pretty",
    "false",
    "--outDir",
    outDir,
    "--module",
    "commonjs",
    "--moduleResolution",
    "node",
    "--target",
    "es2022",
    "--strict",
    "lib/entitlement-status.ts",
  ],
  { cwd: root, encoding: "utf8" },
);
if (tsc.status !== 0) {
  process.stderr.write(tsc.stdout + tsc.stderr);
  process.exit(tsc.status || 1);
}

const require = createRequire(import.meta.url);
const { isLiveEntitlement, unixToIso, razorpaySubscriptionIdFromRef } = require(join(outDir, "entitlement-status.js"));

const future = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString();
const past = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();

assert.equal(isLiveEntitlement(null), false);
assert.equal(isLiveEntitlement({ status: "active", current_period_end: future }), true);
assert.equal(isLiveEntitlement({ status: "trialing", current_period_end: future }), true);
assert.equal(isLiveEntitlement({ status: "cancelled", current_period_end: future }), true);
assert.equal(isLiveEntitlement({ status: "active", current_period_end: past }), false);
assert.equal(isLiveEntitlement({ status: "active", current_period_end: null }), false);
assert.equal(isLiveEntitlement({ status: "free", current_period_end: future }), false);
assert.equal(unixToIso(1_704_067_200), "2024-01-01T00:00:00.000Z");
assert.equal(unixToIso(null), null);
assert.equal(razorpaySubscriptionIdFromRef("rzp_sub:sub_abc"), "sub_abc");
assert.equal(razorpaySubscriptionIdFromRef("sub_abc"), "sub_abc");
assert.equal(razorpaySubscriptionIdFromRef("rzp:pay_abc"), "");

writeFileSync(
  "/opt/cursor/artifacts/subscription_period_tests.log",
  [
    "isLiveEntitlement active+future: true",
    "isLiveEntitlement active+past: false",
    "isLiveEntitlement cancelled+future: true (paid through the period)",
    "isLiveEntitlement free+future: false",
    "unixToIso: ok",
    "PASS",
  ].join("\n") + "\n",
);
console.log("entitlement-status tests passed");

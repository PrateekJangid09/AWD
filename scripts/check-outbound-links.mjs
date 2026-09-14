#!/usr/bin/env node
// Verifies every outbound link the archive renders and records the dead ones.
//
//   node scripts/check-outbound-links.mjs            # report only
//   node scripts/check-outbound-links.mjs --write    # update content/dead-links.json
//
// Third-party sites change independently of us, so a link that was alive at
// ingestion can 404 later. Rather than hardcoding fixes per record, this writes
// a verified denylist that lib/outbound.ts consults, which turns a dead link
// into plain text instead of a broken anchor.
//
// Some hosts answer 403/429 to automated clients while working fine in a
// browser, so only 404/410 are treated as dead.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const RECORDS = path.join(root, "content", "sites");
const OUTPUT = path.join(root, "content", "dead-links.json");
const CONCURRENCY = 12;
const TIMEOUT_MS = 15000;
const DEAD_STATUSES = new Set([404, 410]);

const write = process.argv.includes("--write");

function records() {
  return fs
    .readdirSync(RECORDS)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      try {
        return JSON.parse(fs.readFileSync(path.join(RECORDS, f), "utf8"));
      } catch {
        return null;
      }
    })
    .filter((r) => r?.identity?.slug);
}

/** Every URL the archive template can turn into an anchor. */
function outboundUrls(record) {
  const urls = new Set();
  const add = (value) => {
    if (typeof value !== "string") return;
    const trimmed = value.trim();
    if (!/^https?:\/\//i.test(trimmed)) return;
    if (/\/cdn-cgi\/l\/email-protection/i.test(trimmed)) return; // handled by the sanitiser
    urls.add(trimmed);
  };
  add(record.identity?.url);
  for (const value of Object.values(record.pages ?? {})) add(value);
  return [...urls];
}

async function status(url) {
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,*/*;q=0.8",
  };
  for (const method of ["HEAD", "GET"]) {
    try {
      const response = await fetch(url, {
        method,
        redirect: "follow",
        headers,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      // Some hosts reject HEAD outright; retry those with GET before judging.
      if (method === "HEAD" && (response.status === 405 || response.status === 501)) continue;
      return { code: response.status, final: response.url };
    } catch {
      if (method === "GET") return { code: 0, final: url };
    }
  }
  return { code: 0, final: url };
}

async function main() {
  const jobs = [];
  for (const record of records()) {
    for (const url of outboundUrls(record)) {
      jobs.push({ slug: record.identity.slug, url });
    }
  }

  const dead = [];
  const unreachable = [];
  let done = 0;
  let index = 0;

  async function worker() {
    while (index < jobs.length) {
      const job = jobs[index++];
      const { code, final } = await status(job.url);
      if (DEAD_STATUSES.has(code)) dead.push({ ...job, code });
      else if (code === 0) unreachable.push({ ...job });
      done += 1;
      if (done % 100 === 0) process.stdout.write(".");
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  console.log(`\nchecked ${jobs.length} outbound URLs`);
  console.log(`dead (404/410): ${dead.length}`);
  for (const row of dead) console.log(`  ${row.code}  ${row.slug}  ${row.url}`);
  console.log(`unreachable (network/timeout, not treated as dead): ${unreachable.length}`);

  if (write) {
    const payload = {
      checkedAt: new Date().toISOString().slice(0, 10),
      note: "Verified 404/410 outbound targets. lib/outbound.ts renders these as plain text.",
      urls: [...new Set(dead.map((row) => row.url))].sort(),
    };
    fs.writeFileSync(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`);
    console.log(`wrote ${payload.urls.length} URLs to content/dead-links.json`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

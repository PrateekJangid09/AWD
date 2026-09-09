#!/usr/bin/env node
/**
 * Notify IndexNow that URLs on allwebsites.design have changed.
 *
 * IndexNow keys are public by design — the key file is hosted at the site
 * root so search engines can verify ownership. This script only tells them
 * which URLs to look at; it does not guarantee crawl or index.
 *
 * Usage:
 *   npm run indexnow -- https://allwebsites.design/archive/apple
 *   npm run indexnow -- /archive/apple /tools/chromary
 *   npm run indexnow -- --verify
 *
 * Do not dump the whole sitemap on first enable. IndexNow's own FAQ says to
 * publish only URLs that change after you start using it; historical URLs
 * should be left for the regular crawl.
 *
 * Responses: 200 OK, 202 Accepted (key validation pending — expected until
 * the key file is live on the apex host), 403 key invalid, 422 host mismatch.
 */
import fs from "node:fs";
import path from "node:path";

const SITE_HOST = "allwebsites.design";
const SITE_URL = `https://${SITE_HOST}`;
const ENDPOINT = "https://api.indexnow.org/indexnow";
const KEY_FILE = "a5cfc756c2c746cfac2c4062f7e57c4f.txt";
const KEY_LOCATION = `${SITE_URL}/${KEY_FILE}`;
const MAX_BATCH = 10_000;

const root = path.resolve(import.meta.dirname, "..");
const keyPath = path.join(root, "public", KEY_FILE);

function loadKey() {
  if (!fs.existsSync(keyPath)) {
    throw new Error(`missing key file at public/${KEY_FILE}`);
  }
  const key = fs.readFileSync(keyPath, "utf8").trim();
  if (!key) throw new Error(`key file public/${KEY_FILE} is empty`);
  if (key !== KEY_FILE.replace(/\.txt$/, "")) {
    throw new Error(
      `key file contents ("${key}") do not match the filename stem — IndexNow requires both to match`,
    );
  }
  return key;
}

function toAbsolute(input) {
  if (/^https?:\/\//i.test(input)) {
    const url = new URL(input);
    if (url.hostname.replace(/^www\./i, "") !== SITE_HOST) {
      throw new Error(`URL is not on ${SITE_HOST}: ${input}`);
    }
    url.protocol = "https:";
    url.hostname = SITE_HOST;
    return url.toString().replace(/\/$/, "") || SITE_URL;
  }
  if (!input.startsWith("/")) {
    throw new Error(`expected an absolute URL or a site path, got: ${input}`);
  }
  return `${SITE_URL}${input === "/" ? "" : input}`;
}

function parseArgs(argv) {
  const urls = [];
  let verify = false;
  for (const arg of argv) {
    if (arg === "--verify") verify = true;
    else if (arg.startsWith("-")) throw new Error(`unknown flag: ${arg}`);
    else urls.push(toAbsolute(arg));
  }
  if (verify) urls.unshift(SITE_URL);
  return [...new Set(urls)];
}

async function submit(key, urlList) {
  if (urlList.length === 0) {
    throw new Error(
      "no URLs to submit. Pass paths/URLs, or --verify to ping the homepage.",
    );
  }
  if (urlList.length > MAX_BATCH) {
    throw new Error(`IndexNow accepts at most ${MAX_BATCH} URLs per request`);
  }

  const body = {
    host: SITE_HOST,
    key,
    keyLocation: KEY_LOCATION,
    urlList,
  };

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });
  const text = await response.text();

  return { status: response.status, text, body };
}

async function main() {
  const key = loadKey();
  const urlList = parseArgs(process.argv.slice(2));
  const { status, text, body } = await submit(key, urlList);

  console.log(`POST ${ENDPOINT}`);
  console.log(`  keyLocation: ${body.keyLocation}`);
  console.log(`  urls:        ${body.urlList.length}`);
  for (const url of body.urlList.slice(0, 10)) console.log(`    - ${url}`);
  if (body.urlList.length > 10) console.log(`    … +${body.urlList.length - 10} more`);
  console.log(`  response:    HTTP ${status}${text ? ` ${text}` : ""}`);

  if (status === 200 || status === 202) {
    if (status === 202) {
      console.log(
        "  note: 202 means the URLs were accepted but key validation is still pending — deploy public/" +
          KEY_FILE +
          " first if this is a fresh onboarding.",
      );
    }
    return;
  }

  process.exitCode = 1;
  console.error("  IndexNow rejected the submission. Check the key file is live at");
  console.error(`  ${KEY_LOCATION} and that every URL belongs to ${SITE_HOST}.`);
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});

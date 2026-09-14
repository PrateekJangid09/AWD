#!/usr/bin/env node
// Pre-generates the card thumbnail for every canonical record.
//
//   node scripts/generate-thumbnails.mjs [--force]
//
// Archive cards show a 9:16 crop of the top of a full-page capture, which can
// be 900x15195. Serving that capture to a card would ship (and decode) tens of
// megabytes across a grid of 300, so the crop is baked once here and committed
// next to the screenshot it came from.
//
// The resize deliberately mirrors the CSS the card applies — `object-cover`
// with `object-top` — so swapping the card over to this file is a pure
// performance change with no visual difference.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const RECORDS = path.join(root, "content", "sites");
const ASSETS = path.join(root, "public", "sites");

export const THUMB_FILE = "thumb.webp";
export const THUMB_WIDTH = 600;
export const THUMB_HEIGHT = 1067; // 600 x 16/9, matching the card's aspect-[9/16]
const QUALITY = 72;

const force = process.argv.includes("--force");

/** The capture a record actually has on disk, or null when it has none. */
function sourceShot(slug, declared) {
  const candidates = [declared, "desktop.webp", "desktop.png"].filter(Boolean);
  for (const file of candidates) {
    const full = path.join(ASSETS, slug, file);
    if (fs.existsSync(full)) return full;
  }
  return null;
}

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

async function main() {
  let written = 0;
  let skipped = 0;
  let bytes = 0;
  const missing = [];

  for (const record of records()) {
    const slug = record.identity.slug;
    const source = sourceShot(slug, record.screenshots?.desktop);
    if (!source) {
      missing.push(slug);
      continue;
    }

    const target = path.join(ASSETS, slug, THUMB_FILE);
    if (!force && fs.existsSync(target) && fs.statSync(target).mtimeMs >= fs.statSync(source).mtimeMs) {
      skipped += 1;
      bytes += fs.statSync(target).size;
      continue;
    }

    await sharp(source)
      .resize(THUMB_WIDTH, THUMB_HEIGHT, { fit: "cover", position: "top" })
      .webp({ quality: QUALITY })
      .toFile(target);

    written += 1;
    bytes += fs.statSync(target).size;
  }

  const mb = (bytes / 1024 / 1024).toFixed(1);
  console.log(`${THUMB_FILE}: ${written} written, ${skipped} up to date, ${mb}MB total`);
  if (missing.length) {
    console.log(`no capture on disk (${missing.length}): ${missing.join(", ")}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

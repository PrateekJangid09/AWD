/**
 * Seed the directory.
 *
 *   node scripts/seed.js https://linear.app https://stripe.com   # live crawl
 *   node scripts/seed.js --no-shot https://linear.app            # skip screenshot
 *   node scripts/seed.js                                         # offline demo rows
 *
 * Live mode runs the real pipeline (needs network; screenshots need
 * `npx playwright install chromium`). Demo mode builds field bundles from
 * built-in HTML fixtures with the same extractors, so the gallery renders
 * anywhere with no network.
 */
import { openDb, upsertSite } from "../src/db.js";
import { runPipeline } from "../src/pipeline/index.js";
import { extractIdentity } from "../src/pipeline/identity.js";
import { classifyToEnvelopes } from "../src/pipeline/taxonomy.js";
import { extractPalette } from "../src/pipeline/palette.js";
import { extractFonts } from "../src/pipeline/fonts.js";
import { classifyStyle } from "../src/pipeline/style.js";
import { extractSocial } from "../src/pipeline/social.js";
import { detectTechStack } from "../src/pipeline/techstack.js";
import { extractContact } from "../src/pipeline/contact.js";

const args = process.argv.slice(2);
const noShot = args.includes("--no-shot");
const urls = args.filter((a) => !a.startsWith("--"));
const db = openDb("data/allwebsites.db");

if (urls.length) {
  for (const url of urls) {
    process.stdout.write(`Analyzing ${url} … `);
    const fields = {};
    const ctx = {
      wantScreenshot: !noShot,
      screenshotPath: `public/shots/${safe(url)}.png`,
      fields, stages: {},
      setField: (k, v) => { fields[k] = v; },
      setStage: () => {}
    };
    try {
      await runPipeline(url, ctx);      const saved = upsertSite(db, fields);
      console.log(`ok → ${saved.category || "uncategorized"}`);
    } catch (e) { console.log("failed:", e.message); }
  }
} else {
  console.log("No URLs given - inserting offline demo rows.");
  for (const d of demos()) upsertSite(db, buildDemo(d));
  console.log(`Seeded ${demos().length} demo sites. Run \`npm start\` and open http://localhost:3000`);
}

function buildDemo({ url, html, screenshot, headers, cookies }) {
  const resolved = { resolved_url: url, canonical_origin: new URL(url).origin, registrable_domain: new URL(url).hostname.replace(/^www\./, "") };
  const id = extractIdentity(html, resolved);
  const cls = classifyToEnvelopes(html, url);
  const pal = extractPalette(html, resolved);
  const fon = extractFonts(html, resolved);
  const sty = classifyStyle(html, resolved, { palette: pal.dp_palette.value || [], fonts: fon.dp_fonts.value || [] });
  const soc = extractSocial(html, resolved);
  const tech = detectTechStack(html, headers || {}, cookies || [], url);
  const now = new Date().toISOString();
  return {
    ...id, ...cls, dp_palette: pal.dp_palette, dp_fonts: fon.dp_fonts, dp_style: sty.dp_style, dp_social: soc.dp_social,
    dp_tech_stack: tech.dp_tech_stack,
    dp_contact: extractContact(html, resolved).dp_contact,
    dp_key_pages: { value: { Homepage: { url: resolved.canonical_origin + "/", method: "homepage_root" } }, status: "probable", confidence: 0.6, confidence_band: "inferred" },
    dp_screenshot: screenshot ? { value: { path: screenshot }, status: "verified", confidence: 0.9, confidence_band: "verified" } : { value: null, status: "unmeasured", confidence: 0, confidence_band: "unknown" },
    _internal: { date_added: now, last_checked: now }
  };
}
function safe(u){ try { return new URL(/^https?:/.test(u)?u:"https://"+u).hostname.replace(/^www\./,""); } catch { return "site"; } }

function demos(){ return [
  { url: "https://linearly.app", headers:{"x-vercel-id":"iad","x-vercel-cache":"HIT"}, html: `<html><head><title>Linearly - Project tracking for modern software teams</title><meta name="description" content="The issue tracker built for high-performing teams. Start free trial or book a demo."><meta property="og:site_name" content="Linearly"><meta name="theme-color" content="#5E6AD2"><link href="https://fonts.googleapis.com/css2?family=Inter" rel="stylesheet"><style>:root{--brand-primary:#5E6AD2;--bg:#08090A;--accent:#A8B0FF}body{font-family:'Inter',sans-serif}.b{border-radius:8px;box-shadow:0 1px 2px rgba(0,0,0,.1)}</style></head><body><nav><a href="/features">Features</a><a href="/pricing">Pricing</a></nav><h1>Project tracking for modern software teams</h1><p>The SaaS platform teams use to plan, track and ship. Start free trial. API and SDK included.</p><a href="https://x.com/linearly">x</a><a href="https://linkedin.com/company/linearly">li</a></body></html>` },
  { url: "https://studio-meridian.com", headers:{"server":"nginx","cf-ray":"84","cf-cache-status":"HIT"}, html: `<html><head><title>Studio Meridian | Brand & Digital Design Studio</title><meta name="description" content="We craft brand identities and digital products for ambitious companies."><style>body{font-family:'Playfair Display',serif;color:#111}a{border:1px solid #000;text-transform:uppercase}h1{color:#B4472A}</style></head><body><nav><a href="/work">Work</a><a href="/about">About</a><a href="/contact">Contact</a></nav><h1>We craft brand identities and digital products</h1><a href=\"mailto:studio@studio-meridian.com\">Email</a><p>Studio Meridian is a creative studio. Our work spans branding, visual design and art direction.</p></body></html>` },
  { url: "https://nord-goods.com", cookies:["_shopify_y=a"], html: `<html><head><title>NORD - Minimalist Everyday Carry</title><meta name="description" content="Shop our collection of everyday essentials. Free shipping."><meta name="theme-color" content="#1a1a1a"><style>body{font-family:'Plus Jakarta Sans',sans-serif}.p{color:#c9a227}</style></head><body><nav><a href="/collections/all">Shop</a><a href="/pages/about">About</a></nav><h1>Everyday essentials</h1><p>Add to cart and enjoy free shipping. Browse the collection.</p><a href="/cart">Cart</a><a href="/products/wallet">Wallet</a></body></html>` },
  { url: "https://groveschool.org", headers:{"server":"Apache","x-powered-by":"PHP/8.1"}, html: `<html><head><title>Grove Learning - Online courses for curious people</title><meta name="description" content="Enroll in expert-led online courses. Learn at your own pace."><style>body{font-family:'Nunito',sans-serif}.c{border-radius:24px;background:linear-gradient(90deg,#FF8A5B,#FFD166)}</style></head><body><nav><a href="/courses">Courses</a><a href="/pricing">Pricing</a></nav><h1>Online courses for curious people</h1><p>Enroll now. Video lessons and a full curriculum for students and lifelong learners.</p></body></html>` }
]; }

/**
 * DP: Find key pages (Homepage, About, Contact, Pricing, Jobs/Careers)
 * Two layers: (1) read the actual nav/footer links and match them by
 * href-slug + anchor text; (2) for anything still missing, probe the common
 * slugs directly with a lightweight HEAD/GET and reject soft-404s.
 */
import * as cheerio from "cheerio";
import { envelope, evidence } from "./envelope.js";
import { fetchWithTimeout, BROWSER_HEADERS, isSameSiteHost } from "./resolve.js";

const TARGETS = {
  "Homepage": { slugs: ["/"], text: [/^home$/i], always: true },
  "About": { slugs: ["/about", "/about-us", "/company", "/who-we-are", "/our-story", "/pages/about"], text: [/about/i, /our story/i, /who we are/i] },
  "Contact": { slugs: ["/contact", "/contact-us", "/get-in-touch", "/pages/contact"], text: [/contact/i, /get in touch/i] },
  "Pricing": { slugs: ["/pricing", "/plans", "/price", "/pages/pricing"], text: [/pricing/i, /plans/i, /^pricing$/i] },
  "Jobs/Careers": { slugs: ["/careers", "/jobs", "/join-us", "/open-roles", "/work-with-us", "/pages/careers"], text: [/careers/i, /jobs/i, /join us/i, /we'?re hiring/i, /open roles/i] }
};

export async function findKeyPages(html, resolved, { budgetMs = 9000 } = {}) {
  const $ = cheerio.load(html || "");
  const origin = resolved.canonical_origin;
  const base = new URL(resolved.resolved_url);
  const now = new Date().toISOString();

  // gather all internal links once
  const links = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    const text = $(el).text().trim();
    if (!href) return;
    let abs;
    try { abs = new URL(href, resolved.resolved_url); } catch { return; }
    if (!/^https?:$/.test(abs.protocol)) return;
    if (!isSameSiteHost(abs.hostname, base.hostname)) return;
    links.push({ url: abs.href, path: abs.pathname.toLowerCase().replace(/\/$/, "") || "/", text });
  });

  const found = {};
  // layer 1: match from real links
  for (const [label, spec] of Object.entries(TARGETS)) {
    if (spec.always) { found[label] = { url: origin + "/", method: "homepage_root", conf: 0.99 }; continue; }
    const bySlug = links.find((l) => spec.slugs.some((s) => l.path === s.replace(/\/$/, "")));
    const byText = links.find((l) => spec.text.some((re) => re.test(l.text)) && l.path !== "/");
    const hit = bySlug || byText;
    if (hit) found[label] = { url: hit.url, method: bySlug ? "nav_slug_match" : "nav_text_match", conf: bySlug ? 0.9 : 0.75 };
  }

  // layer 2: probe missing slugs (bounded)
  const deadline = Date.now() + budgetMs;
  for (const [label, spec] of Object.entries(TARGETS)) {
    if (found[label] || spec.always) continue;
    for (const slug of spec.slugs) {
      if (Date.now() > deadline) break;
      const probeUrl = origin + slug;
      try {
        const res = await fetchWithTimeout(probeUrl, { timeoutMs: 3500, headers: BROWSER_HEADERS, redirect: "follow" });
        if (res.ok && res.status < 400) {
          const body = (await res.text()).slice(0, 4000).toLowerCase();
          // soft-404 rejection: page exists but screams "not found"
          if (!/404|page not found|doesn'?t exist|no longer available/.test(body)) {
            found[label] = { url: probeUrl, method: "slug_probe", conf: 0.7 };
            break;
          }
        }
      } catch { /* keep probing */ }
    }
  }

  // assemble one envelope holding all page slots
  const pages = {};
  for (const label of Object.keys(TARGETS)) {
    pages[label] = found[label] ? { url: found[label].url, method: found[label].method } : null;
  }
  const hitCount = Object.values(found).length;
  const confidence = Math.min(0.95, 0.5 + hitCount * 0.09);
  const evList = Object.entries(found).map(([label, f]) => evidence(f.method, f.url, label, now));

  // Classification is considerably more precise when the homepage is vague.
  // Reuse a small, bounded set of first-party pages such as About, Product,
  // Features, Services and Pricing. These documents are internal pipeline
  // evidence only; the public key-page contract above stays unchanged.
  const classificationCandidates = [];
  const priority = /\/(about|company|product|products|features|services|solutions|pricing|plans)(\/|$)/i;
  for (const link of links) {
    if (!priority.test(link.path)) continue;
    if (classificationCandidates.some((u) => new URL(u).pathname === new URL(link.url).pathname)) continue;
    classificationCandidates.push(link.url);
    if (classificationCandidates.length >= 4) break;
  }
  for (const label of ["About", "Pricing"]) {
    const u = found[label]?.url;
    if (u && !classificationCandidates.includes(u)) classificationCandidates.push(u);
  }

  const remaining = Math.max(0, deadline - Date.now());
  const classificationDocuments = remaining > 700
    ? (await Promise.allSettled(classificationCandidates.slice(0, 4).map(async (url) => {
        const res = await fetchWithTimeout(url, { timeoutMs: Math.min(4500, Math.max(500, deadline - Date.now())), headers: BROWSER_HEADERS, redirect: "follow" });
        const contentType = res.headers.get("content-type") || "";
        if (!res.ok || !/text\/html|application\/xhtml\+xml/i.test(contentType)) return null;
        const doc = (await res.text()).slice(0, 180000);
        if (!doc || /cf-challenge|attention required|captcha/i.test(doc.slice(0, 15000))) return null;
        return { url, html: doc };
      }))).flatMap((result) => result.status === "fulfilled" && result.value ? [result.value] : [])
    : [];

  return {
    dp_key_pages: envelope(pages, hitCount >= 3 ? "verified" : "probable", confidence, evList,
      { found_count: hitCount, total_targets: Object.keys(TARGETS).length }),
    classification_documents: classificationDocuments
  };
}

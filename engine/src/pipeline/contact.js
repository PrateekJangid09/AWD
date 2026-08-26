/**
 * DP: Contact (official email + postal address)
 * =============================================
 * A dedicated micro-algorithm that finds a site's official contact email and,
 * where present, its postal/contact address. Emails are notoriously spoofable
 * and obfuscated, so this uses a precedence chain and filters aggressively:
 *
 *   Email precedence (highest-confidence first):
 *     1. JSON-LD Organization/LocalBusiness `email` or contactPoint.email
 *     2. mailto: links (the clearest human-intended contact)
 *     3. de-obfuscated / visible text emails ("name [at] domain dot com")
 *   Preference within a tier: an address ON the site's own domain
 *   (hello@theirdomain.com) outranks a gmail/proxy address, and role
 *   addresses (contact@, hello@, info@, support@, sales@) outrank personal ones.
 *
 *   Address:
 *     1. JSON-LD PostalAddress (streetAddress, locality, region, postalCode...)
 *     2. <address> element text
 *
 * It can also read the discovered Contact page (passed in as supplemental
 * HTML), since the homepage often only links to it.
 */
import * as cheerio from "cheerio";
import { envelope, evidence } from "./envelope.js";

const ROLE_LOCALPARTS = ["contact", "hello", "info", "support", "sales", "team", "hi", "help", "enquiries", "inquiries", "press", "office", "admin"];
// obvious non-contact / tracking / vendor noise to drop
const JUNK_EMAIL = /@(?:sentry|wixpress|example|email|domain|your|test|sentry\.io)\b|\.(png|jpg|jpeg|gif|svg|webp|css|js)$|^[a-f0-9]{16,}@|noreply|no-reply|donotreply/i;
const EMAIL_RE = /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi;

export function extractContact(html, resolved, { supplementalHtml = [] } = {}) {
  const now = new Date().toISOString();
  const siteDomain = (resolved.registrable_domain || "").toLowerCase();
  const docs = [html, ...(supplementalHtml || [])].filter(Boolean);

  const emails = new Map();   // email -> {via, onDomain, role}
  let address = null, addressVia = null;

  const consider = (raw, via) => {
    if (!raw) return;
    const email = String(raw).trim().toLowerCase().replace(/^mailto:/, "").split("?")[0];
    if (!EMAIL_RE.test(email)) { EMAIL_RE.lastIndex = 0; return; }
    EMAIL_RE.lastIndex = 0;
    if (JUNK_EMAIL.test(email)) return;
    const domain = email.split("@")[1] || "";
    const local = email.split("@")[0] || "";
    const onDomain = siteDomain && (domain === siteDomain || domain.endsWith("." + siteDomain));
    const role = ROLE_LOCALPARTS.includes(local);
    const prev = emails.get(email);
    // keep the strongest provenance seen for this address
    const rank = { json_ld: 3, mailto: 2, text: 1 }[via] || 0;
    if (!prev || rank > prev.rank) emails.set(email, { via, rank, onDomain, role });
  };

  for (const doc of docs) {
    const $ = cheerio.load(doc || "");

    // 1. JSON-LD email + address
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const data = JSON.parse($(el).contents().text());
        const arr = Array.isArray(data) ? data : (data["@graph"] ? data["@graph"] : [data]);
        for (const node of arr) {
          if (!node || typeof node !== "object") continue;
          if (typeof node.email === "string") consider(node.email, "json_ld");
          const cps = node.contactPoint ? (Array.isArray(node.contactPoint) ? node.contactPoint : [node.contactPoint]) : [];
          for (const cp of cps) if (cp && cp.email) consider(cp.email, "json_ld");
          if (!address && node.address) address = readPostalAddress(node.address), addressVia = "json_ld";
        }
      } catch { /* ignore malformed ld+json */ }
    });

    // 2. mailto: links
    $('a[href^="mailto:"]').each((_, el) => consider($(el).attr("href"), "mailto"));

    // 3. visible text emails (plain + lightly obfuscated)
    $("script, style, noscript").remove();
    const text = $("body").text();
    for (const m of text.match(EMAIL_RE) || []) consider(m, "text");
    for (const m of deobfuscate(text)) consider(m, "text");

    // address fallback: <address> element
    if (!address) {
      const addr = $("address").first().text().replace(/\s+/g, " ").trim();
      if (addr && addr.length > 8 && addr.length < 240) { address = addr; addressVia = "address_tag"; }
    }
  }

  // rank the emails: on-domain first, then role account, then provenance
  const ranked = [...emails.entries()]
    .map(([email, m]) => ({ email, ...m }))
    .sort((a, b) =>
      (Number(b.onDomain) - Number(a.onDomain)) ||
      (Number(b.role) - Number(a.role)) ||
      (b.rank - a.rank)
    );

  const best = ranked[0] || null;
  const others = ranked.slice(1, 5).map((r) => r.email);

  const value = {
    email: best ? best.email : null,
    email_source: best ? best.via : null,
    on_official_domain: best ? !!best.onDomain : null,
    other_emails: others,
    address: address || null,
    address_source: address ? addressVia : null
  };

  if (!best && !address) {
    return { dp_contact: envelope(null, "unmeasured", 0, [], { reason: "no email or address found on homepage or contact page" }) };
  }

  // confidence: on-domain JSON-LD/mailto role address is the gold standard
  let conf = 0.5;
  if (best) {
    conf = 0.55
      + (best.onDomain ? 0.2 : 0)
      + (best.via === "json_ld" ? 0.12 : best.via === "mailto" ? 0.08 : 0)
      + (best.role ? 0.06 : 0);
  } else if (address) {
    conf = 0.6;
  }
  conf = Math.min(0.96, conf);

  const evList = [];
  if (best) evList.push(evidence(`email_${best.via}`, resolved.resolved_url, best.email, now));
  if (address) evList.push(evidence(`address_${addressVia}`, resolved.resolved_url, String(address).slice(0, 80), now));

  return {
    dp_contact: envelope(value, conf >= 0.75 ? "verified" : conf >= 0.55 ? "probable" : "inferred", conf, evList,
      { candidates: ranked.slice(0, 5).map((r) => ({ email: r.email, on_domain: !!r.onDomain, via: r.via })) })
  };
}

/** Read a schema.org PostalAddress (object or string) into one line. */
function readPostalAddress(addr) {
  if (typeof addr === "string") return addr.trim().slice(0, 240) || null;
  if (typeof addr !== "object" || !addr) return null;
  const parts = [addr.streetAddress, addr.addressLocality, addr.addressRegion, addr.postalCode, addr.addressCountry]
    .map((p) => (typeof p === "object" && p ? p.name || "" : p))
    .filter(Boolean);
  const line = parts.join(", ").replace(/\s+/g, " ").trim();
  return line.length > 4 ? line.slice(0, 240) : null;
}

/** Recover lightly obfuscated emails: "name [at] domain [dot] com" etc. */
function deobfuscate(text) {
  const found = [];
  const t = text
    .replace(/\s*\[?\(?\s*at\s*\)?\]?\s*/gi, "@")
    .replace(/\s*\[?\(?\s*dot\s*\)?\]?\s*/gi, ".")
    .replace(/\s+@\s+/g, "@");
  for (const m of t.match(EMAIL_RE) || []) found.push(m);
  return found;
}

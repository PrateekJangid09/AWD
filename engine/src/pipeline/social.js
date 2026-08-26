/**
 * DP: LinkedIn and X (Twitter) links
 * Scans anchors + JSON-LD sameAs for official profiles, filtering out share
 * intents ("share on twitter") and generic platform homepages.
 */
import * as cheerio from "cheerio";
import { envelope, evidence } from "./envelope.js";

const RE = {
  linkedin: /^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\/(company|in|school)\/[^/?#]+/i,
  x: /^https?:\/\/(www\.)?(x\.com|twitter\.com)\/(?!share|intent|home|search|hashtag)[a-z0-9_]{1,15}(\/)?($|\?|#)/i
};

const SHARE_HINTS = /share|intent|sharer|\?url=|\?text=/i;

export function extractSocial(html, resolved) {
  const $ = cheerio.load(html || "");
  const now = new Date().toISOString();
  const candidates = new Set();

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (href) candidates.add(href);
  });
  // JSON-LD sameAs is the most authoritative source
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const d = JSON.parse($(el).contents().text());
      const arr = Array.isArray(d) ? d : (d["@graph"] || [d]);
      for (const n of arr) {
        const same = n && n.sameAs;
        if (Array.isArray(same)) same.forEach((u) => candidates.add(u));
        else if (typeof same === "string") candidates.add(same);
      }
    } catch { /* ignore */ }
  });

  const pick = (re) => {
    for (const raw of candidates) {
      if (!raw || SHARE_HINTS.test(raw)) continue;
      let u = raw;
      try { u = new URL(raw, resolved.resolved_url).href; } catch { /* keep raw */ }
      if (re.test(u)) return u.replace(/\/$/, "");
    }
    return null;
  };

  const linkedin = pick(RE.linkedin);
  const x = pick(RE.x);

  const evList = [];
  if (linkedin) evList.push(evidence("anchor_or_sameas", resolved.resolved_url, linkedin, now));
  if (x) evList.push(evidence("anchor_or_sameas", resolved.resolved_url, x, now));

  const value = { linkedin: linkedin || null, x: x || null };
  const anyFound = !!(linkedin || x);

  return {
    dp_social: anyFound
      ? envelope(value, "verified", linkedin && x ? 0.92 : 0.8, evList)
      : envelope(value, "unmeasured", 0, [], { reason: "no LinkedIn or X profile link found on page" })
  };
}

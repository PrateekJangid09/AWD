/**
 * Outbound links to the websites we study.
 *
 * Two jobs, both centralised so a bad URL in one record cannot leak into the
 * rendered page:
 *
 * 1. Sanitation. Archive ingestion captured some URLs that are not real
 *    destinations — most notably Cloudflare's /cdn-cgi/l/email-protection
 *    obfuscation endpoints, which always 404. Those must never be rendered as
 *    anchors.
 * 2. Attribution. Listed sites should be able to see AllWebsites.Design in
 *    their analytics, so outbound clicks carry a referral source. This is only
 *    applied to links a human clicks; canonical entity URLs in JSON-LD stay
 *    clean so structured data still identifies the real resource.
 */
import deadLinks from "@/content/dead-links.json";

export const REFERRAL_SOURCE = "allwebsites.design";

/** Paths captured by the crawler that are never a usable destination. */
const DEAD_PATH_PATTERNS = [/\/cdn-cgi\/l\/email-protection/i];

/**
 * Targets verified 404/410 by scripts/check-outbound-links.mjs. Third-party
 * pages disappear without telling us, so the list is data rather than code and
 * is refreshed by re-running that script.
 */
const DEAD_URLS: Set<string> = new Set(
  (deadLinks.urls ?? []).map((url: string) => url.replace(/\/+$/, "").toLowerCase()),
);

function parse(raw: string | null | undefined) {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (DEAD_PATH_PATTERNS.some((pattern) => pattern.test(url.pathname))) return null;
    if (DEAD_URLS.has(url.toString().replace(/\/+$/, "").toLowerCase())) return null;
    return url;
  } catch {
    return null;
  }
}

/** True when the URL is safe to render as an outbound anchor. */
export function isUsableExternalUrl(raw: string | null | undefined) {
  return parse(raw) !== null;
}

/**
 * The URL to put in an outbound href: sanitised, and tagged so the destination
 * can attribute the visit to us. Returns null when the URL is not renderable,
 * so callers fall back to plain text instead of a dead link.
 */
export function outboundUrl(raw: string | null | undefined): string | null {
  const url = parse(raw);
  if (!url) return null;

  // Never clobber params the destination already relies on.
  if (!url.searchParams.has("ref")) url.searchParams.set("ref", REFERRAL_SOURCE);
  if (!url.searchParams.has("utm_source")) {
    url.searchParams.set("utm_source", REFERRAL_SOURCE);
    url.searchParams.set("utm_medium", "referral");
  }
  return url.toString();
}

/** The clean canonical URL of the studied resource, for JSON-LD and display. */
export function canonicalExternalUrl(raw: string | null | undefined): string | null {
  const url = parse(raw);
  return url ? url.toString() : null;
}

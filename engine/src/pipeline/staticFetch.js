/**
 * Stage 1: static acquisition. Raw HTML + headers + cookies, no browser.
 *
 * This stage answers most of the 39 data points and most tool signatures.
 * A browser render (Stage 3) only runs when this stage returns an SPA shell
 * or misses required signals. That inversion is where the speed comes from.
 */

import { fetchWithTimeout } from "./resolve.js";

const MAX_BYTES = 3 * 1024 * 1024; // 3 MB cap; huge pages get truncated, not hung on

export async function staticFetch(url, { budgetMs = 12000 } = {}) {
  let res = await fetchWithTimeout(url, { timeoutMs: budgetMs });

  // Retry once on block signals with a Googlebot-adjacent referer-free GET;
  // many WAF rules only fire on the first anonymous hit.
  if (res.status === 403 || res.status === 429 || res.status === 503) {
    await new Promise((r) => setTimeout(r, 800));
    res = await fetchWithTimeout(url, {
      timeoutMs: Math.min(budgetMs, 8000),
      headers: { "Referer": "https://www.google.com/", "Cache-Control": "no-cache" }
    });
  }

  const headers = Object.fromEntries(res.headers.entries());
  const setCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [];

  const reader = res.body?.getReader();
  let html = "";
  let bytes = 0;
  if (reader) {
    const decoder = new TextDecoder();
    while (bytes < MAX_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      html += decoder.decode(value, { stream: true });
    }
    reader.cancel().catch(() => {});
  }

  return {
    status: res.status,
    finalUrl: res.url || url,
    headers,
    setCookies,
    html,
    bytes,
    truncated: bytes >= MAX_BYTES,
    botWall: detectBotWall(res.status, html),
    fetchedAt: new Date().toISOString()
  };
}

/** Challenge pages must be reported honestly, not parsed as if they were the site. */
export function detectBotWall(status, html = "") {
  if ([403, 429, 503].includes(status)) {
    if (/cloudflare|attention required|cf-challenge|just a moment/i.test(html)) return "cloudflare_challenge";
    if (/akamai|reference #\d/i.test(html)) return "akamai_block";
    if (/captcha|are you a robot|access denied/i.test(html)) return "generic_block";
    return "http_" + status;
  }
  if (/cf-challenge|_cf_chl_opt|turnstile/i.test(html) && html.length < 20000) return "cloudflare_challenge";
  return null;
}

/**
 * Heuristic: does the static HTML look like an empty SPA shell that will need
 * a browser render before extraction is meaningful?
 */
export function looksLikeSpaShell(html) {
  if (!html) return true;
  const textOnly = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const hasRoot = /<div[^>]+id=["'](root|app|__next|__nuxt)["']/i.test(html);
  return hasRoot && textOnly.length < 400;
}

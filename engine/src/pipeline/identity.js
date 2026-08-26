/**
 * DP: Website Name, Official Link, Short Description
 * A dedicated extractor with a clear precedence chain so the best available
 * signal wins and the confidence reflects which signal fired.
 */
import * as cheerio from "cheerio";
import { envelope, evidence, titleCase } from "./envelope.js";

export function extractIdentity(html, resolved) {
  const $ = cheerio.load(html || "");
  const now = new Date().toISOString();
  const domain = resolved.registrable_domain || "";

  /* ---- Website Name ---- */
  // precedence: og:site_name > <title> brand segment > JSON-LD name > domain
  let name = null, nameConf = 0, nameMethod = "domain_fallback", nameSnippet = domain;
  const ogSite = $('meta[property="og:site_name"]').attr("content");
  const jsonLdName = readJsonLd($, ["name", "legalName"]);
  const titleTxt = $("title").first().text().trim();

  if (ogSite && ogSite.trim()) { name = ogSite.trim(); nameConf = 0.9; nameMethod = "og:site_name"; nameSnippet = ogSite; }
  else if (jsonLdName) { name = jsonLdName; nameConf = 0.85; nameMethod = "json_ld"; nameSnippet = jsonLdName; }
  else if (titleTxt) {
    // title often "Brand - tagline" or "Page | Brand"; take the branded chunk.
    const parts = titleTxt.split(/\s[|\u2013\u2014-]\s/).map((s) => s.trim()).filter(Boolean);
    name = parts.length > 1 ? shorterBrandy(parts) : titleTxt;
    nameConf = 0.7; nameMethod = "title_tag"; nameSnippet = titleTxt;
  }
  if (!name) { name = titleCase(domain.split(".")[0] || domain); nameConf = 0.4; }

  /* ---- Short Description ---- */
  // precedence: meta description > og:description > JSON-LD description > first meaningful <p>
  let desc = null, descConf = 0, descMethod = "none", descSnippet = null;
  const metaDesc = $('meta[name="description"]').attr("content");
  const ogDesc = $('meta[property="og:description"]').attr("content");
  const ldDesc = readJsonLd($, ["description"]);
  if (metaDesc && metaDesc.trim().length > 20) { desc = metaDesc.trim(); descConf = 0.85; descMethod = "meta_description"; }
  else if (ogDesc && ogDesc.trim().length > 20) { desc = ogDesc.trim(); descConf = 0.8; descMethod = "og:description"; }
  else if (ldDesc && ldDesc.length > 20) { desc = ldDesc; descConf = 0.75; descMethod = "json_ld"; }
  else {
    const p = $("p").map((_, el) => $(el).text().trim()).get().find((t) => t.length > 40);
    if (p) { desc = p.slice(0, 300); descConf = 0.5; descMethod = "first_paragraph"; }
  }
  if (desc) { desc = desc.replace(/\s+/g, " ").trim().slice(0, 320); descSnippet = desc.slice(0, 120); }

  return {
    dp_name: name
      ? envelope(name, nameConf >= 0.85 ? "verified" : nameConf >= 0.6 ? "probable" : "inferred", nameConf,
          [evidence(nameMethod, resolved.resolved_url, nameSnippet, now)])
      : envelope(null, "unmeasured", 0, []),
    dp_official_link: envelope(
      { url: resolved.resolved_url, canonical_origin: resolved.canonical_origin, registrable_domain: domain },
      "verified", 0.98, [evidence("redirect_resolution", resolved.resolved_url, resolved.resolved_url, now)]),
    dp_description: desc
      ? envelope(desc, descConf >= 0.8 ? "verified" : descConf >= 0.6 ? "probable" : "inferred", descConf,
          [evidence(descMethod, resolved.resolved_url, descSnippet, now)])
      : envelope(null, "unmeasured", 0, [], { reason: "no description meta or lead paragraph" })
  };
}

function shorterBrandy(parts) {
  // the brand is usually the shorter, title-cased side of a title separator
  const sorted = [...parts].sort((a, b) => a.length - b.length);
  return sorted[0].length <= 40 ? sorted[0] : parts[0];
}

function readJsonLd($, keys) {
  let found = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    if (found) return;
    try {
      const data = JSON.parse($(el).contents().text());
      const arr = Array.isArray(data) ? data : (data["@graph"] ? data["@graph"] : [data]);
      for (const node of arr) {
        for (const k of keys) {
          if (node && typeof node[k] === "string" && node[k].trim()) { found = node[k].trim(); return; }
        }
      }
    } catch { /* ignore malformed ld+json */ }
  });
  return found;
}

/**
 * DP: Favicon
 * Resolves the best available site icon, in preference order:
 *   1. <link rel="icon" | "shortcut icon">     (highest-res declared wins)
 *   2. <link rel="apple-touch-icon">            (usually a clean 180x180 PNG)
 *   3. icon from the web app manifest            (<link rel="manifest">)
 *   4. og:image                                  (last resort, often too large)
 *   5. /favicon.ico                              (the universal fallback)
 *
 * It validates that the chosen URL actually returns an image before asserting
 * it, and can optionally download the icon to a local path so the gallery is
 * not dependent on the origin serving it (and to dodge hotlink/CORS issues).
 */
import * as cheerio from "cheerio";
import { envelope, evidence } from "./envelope.js";
import { fetchWithTimeout, BROWSER_HEADERS, assertSafeUrl } from "./resolve.js";
import { writeFile } from "node:fs/promises";

/** Rank declared <link> icons by their largest declared size. */
function iconArea(sizes) {
  if (!sizes) return 0;
  if (/any/i.test(sizes)) return 1e6; // SVG "any" is scalable, prefer it
  const m = String(sizes).match(/(\d+)\s*x\s*(\d+)/i);
  return m ? parseInt(m[1]) * parseInt(m[2]) : 0;
}

export async function extractFavicon(html, resolved, { budgetMs = 6000, savePath = null } = {}) {
  const $ = cheerio.load(html || "");
  const now = new Date().toISOString();
  const origin = resolved.canonical_origin;
  const base = resolved.resolved_url;
  const candidates = [];

  const abs = (href) => { try { return new URL(href, base).href; } catch { return null; } };

  // 1 + 2. declared <link> icons, ranked by size, apple-touch last within a tier
  $('link[rel]').each((_, el) => {
    const rel = ($(el).attr("rel") || "").toLowerCase();
    const href = $(el).attr("href");
    if (!href) return;
    if (/(^|\s)(icon|shortcut icon)(\s|$)/.test(rel)) {
      candidates.push({ url: abs(href), area: iconArea($(el).attr("sizes")), pref: 3, type: $(el).attr("type") || "", why: "link rel=icon" });
    } else if (/apple-touch-icon/.test(rel)) {
      candidates.push({ url: abs(href), area: iconArea($(el).attr("sizes")) || 32400, pref: 2, type: "image/png", why: "apple-touch-icon" });
    }
  });

  // 3. manifest icon (best-effort, one fetch)
  const manifestHref = $('link[rel="manifest"]').attr("href");
  if (manifestHref) {
    const murl = abs(manifestHref);
    if (murl) {
      try {
        await assertSafeUrl(murl);
        const res = await fetchWithTimeout(murl, { timeoutMs: 3000, headers: BROWSER_HEADERS });
        if (res.ok) {
          const man = JSON.parse(await res.text());
          for (const ic of man.icons || []) {
            const u = abs(ic.src);
            if (u) candidates.push({ url: u, area: iconArea(ic.sizes), pref: 2, type: ic.type || "", why: "web app manifest" });
          }
        }
      } catch { /* manifest optional */ }
    }
  }

  // 4. og:image as a weak fallback
  const og = $('meta[property="og:image"]').attr("content");
  if (og) candidates.push({ url: abs(og), area: 1, pref: 0, type: "", why: "og:image" });

  // 5. the universal /favicon.ico fallback
  candidates.push({ url: origin + "/favicon.ico", area: 1, pref: 1, type: "image/x-icon", why: "/favicon.ico fallback" });

  // pick order: higher pref first, then larger declared area
  const ordered = candidates
    .filter((c) => c.url)
    .sort((a, b) => (b.pref - a.pref) || (b.area - a.area));

  // validate candidates until one returns an actual image
  const deadline = Date.now() + budgetMs;
  const tried = new Set();
  for (const c of ordered) {
    if (Date.now() > deadline) break;
    if (tried.has(c.url)) continue;
    tried.add(c.url);
    try {
      await assertSafeUrl(c.url);
      const res = await fetchWithTimeout(c.url, { timeoutMs: 3500, headers: BROWSER_HEADERS });
      if (!res.ok) continue;
      const ct = (res.headers.get("content-type") || "").toLowerCase();
      const buf = Buffer.from(await res.arrayBuffer());
      if (!buf.length) continue;
      const looksImage = ct.startsWith("image/") || isImageMagic(buf) || c.url.endsWith(".ico");
      if (!looksImage) continue;

      let storedPath = null;
      if (savePath) {
        const ext = extFor(ct, c.url);
        storedPath = savePath.replace(/\.[a-z0-9]+$/i, "") + ext;
        await writeFile(storedPath, buf).catch(() => { storedPath = null; });
      }

      return {
        dp_favicon: envelope(
          { url: c.url, path: storedPath ? webPath(storedPath) : null, content_type: ct || null, bytes: buf.length, source: c.why },
          "verified", c.pref >= 2 ? 0.92 : 0.8,
          [evidence("favicon_resolution", c.url, c.why, now)])
      };
    } catch { /* try the next candidate */ }
  }

  return { dp_favicon: envelope(null, "unmeasured", 0, [], { reason: "no reachable favicon found", tried: [...tried].slice(0, 5) }) };
}

function isImageMagic(buf) {
  if (buf.length < 4) return false;
  const b = buf;
  // PNG, JPEG, GIF, ICO, WEBP(RIFF), SVG(<)
  if (b[0] === 0x89 && b[1] === 0x50) return true;               // PNG
  if (b[0] === 0xff && b[1] === 0xd8) return true;               // JPEG
  if (b[0] === 0x47 && b[1] === 0x49) return true;               // GIF
  if (b[0] === 0x00 && b[1] === 0x00 && (b[2] === 0x01 || b[2] === 0x02)) return true; // ICO/CUR
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46) return true; // RIFF/WEBP
  if (b[0] === 0x3c) return true;                                // '<' SVG/XML
  return false;
}
function extFor(ct, url) {
  if (/png/.test(ct)) return ".png";
  if (/jpe?g/.test(ct)) return ".jpg";
  if (/gif/.test(ct)) return ".gif";
  if (/svg/.test(ct)) return ".svg";
  if (/webp/.test(ct)) return ".webp";
  if (/x-icon|vnd\.microsoft\.icon/.test(ct) || url.endsWith(".ico")) return ".ico";
  return ".img";
}
function webPath(fsPath) {
  const file = fsPath.split(/[\\/]/).pop();
  return "/shots/" + file; // favicons are stored alongside shots under /public/shots
}

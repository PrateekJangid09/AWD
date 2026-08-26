/**
 * DP: Font(s) used
 * Detects typefaces from the strongest signals: Google Fonts / Adobe Fonts
 * links, @font-face family names, and font-family declarations (including CSS
 * custom properties). Filters generic fallbacks (sans-serif, Arial stacks).
 */
import * as cheerio from "cheerio";
import { envelope, evidence } from "./envelope.js";

const GENERIC = new Set([
  "sans-serif", "serif", "monospace", "system-ui", "-apple-system", "blinkmacsystemfont",
  "segoe ui", "roboto", "helvetica", "helvetica neue", "arial", "ui-sans-serif", "ui-serif",
  "ui-monospace", "apple-system", "sans", "inherit", "initial", "cursive", "emoji"
]);

export function extractFonts(html, resolved, { max = 4 } = {}) {
  const $ = cheerio.load(html || "");
  const now = new Date().toISOString();
  const scored = new Map();
  const bump = (name, w) => {
    const clean = tidy(name);
    if (!clean || GENERIC.has(clean.toLowerCase())) return;
    scored.set(clean, (scored.get(clean) || 0) + w);
  };
  const methods = new Set();

  // 1. Google Fonts <link> (family=Name:...) - strongest, explicit choice
  $('link[href*="fonts.googleapis.com"], link[href*="fonts.gstatic.com"]').each((_, el) => {
    const href = $(el).attr("href") || "";
    for (const m of href.matchAll(/family=([^:&]+)/gi)) { bump(decodeURIComponent(m[1].replace(/\+/g, " ")), 6); methods.add("google_fonts_link"); }
  });
  // Adobe Fonts (Typekit) project link is a signal even without names
  if ($('link[href*="use.typekit.net"], script[src*="use.typekit.net"]').length) methods.add("adobe_fonts");

  const styleText = $("style").map((_, el) => $(el).text()).get().join("\n");

  // 2. @font-face family names
  for (const m of styleText.matchAll(/@font-face\s*{[^}]*font-family\s*:\s*['"]?([^;'"}]+)/gi)) { bump(m[1], 5); methods.add("font_face"); }

  // 3. font-family declarations (take the FIRST/primary family in each stack)
  const decls = [...styleText.matchAll(/font-family\s*:\s*([^;{}]+)/gi)].map((m) => m[1]);
  $("[style]").each((_, el) => {
    const s = $(el).attr("style") || "";
    const m = s.match(/font-family\s*:\s*([^;]+)/i);
    if (m) decls.push(m[1]);
  });
  for (const stack of decls) {
    const first = stack.split(",")[0];
    bump(first, 2);
    if (first && !GENERIC.has(tidy(first).toLowerCase())) methods.add("font_family_decl");
  }

  const ranked = [...scored.entries()].sort((a, b) => b[1] - a[1]).slice(0, max).map(([name]) => name);

  if (!ranked.length) {
    const note = methods.has("adobe_fonts") ? "Adobe Fonts detected but family names load via JS" : "only generic system fonts declared statically";
    return { dp_fonts: envelope(null, "unmeasured", 0, [], { reason: note, methods: [...methods] }) };
  }

  const confidence = Math.min(0.92, 0.5 + (methods.has("google_fonts_link") || methods.has("font_face") ? 0.3 : 0.1) + Math.min(ranked.length / max, 1) * 0.1);
  return {
    dp_fonts: envelope(ranked, confidence >= 0.7 ? "verified" : "inferred", confidence,
      [evidence([...methods][0] || "font_family_decl", resolved.resolved_url, ranked.join(", "), now)],
      { methods: [...methods] })
  };
}

function tidy(name) {
  return String(name || "").replace(/['"]/g, "").replace(/\s+/g, " ").trim();
}

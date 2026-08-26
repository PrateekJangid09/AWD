/**
 * Advanced design-token extraction.
 *
 * Instead of scraping colors and fonts out of CSS *text* (which misses
 * everything in external stylesheets and cannot tell a brand color from a
 * stray gradient stop), this reads the *rendered* page: it walks every painted
 * element, reads its computed style, and weights each color and font by the
 * screen AREA it covers. Area weighting is what lets it say "this is the page
 * background", "this is the body text color", "this is the brand/button color",
 * "this is the display typeface" rather than just listing hex codes.
 *
 * PAGE_TOKENS_FN runs inside the browser (via page.evaluate). The build*
 * helpers post-process its raw output into the same envelopes every other data
 * point uses.
 */
import { envelope, evidence } from "./envelope.js";

/* Runs in the browser. Must be fully self-contained (no outer references). */
export const PAGE_TOKENS_FN = () => {
  const parseColor = (c) => {
    if (!c) return null;
    c = c.trim();
    if (c === "transparent" || c === "none") return null;
    let m = c.match(/rgba?\(([^)]+)\)/i);
    if (m) {
      const p = m[1].split(",").map((x) => parseFloat(x));
      return { r: p[0], g: p[1], b: p[2], a: p[3] === undefined ? 1 : p[3] };
    }
    return null;
  };
  const toHex = (col) =>
    "#" + [col.r, col.g, col.b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");

  const colorAgg = {}; // hex -> {area, bg, text, border, fill}
  const fontAgg = {};  // family -> {area, weights:{}, roles:{}, sizes:[]}
  const addColor = (col, area, kind) => {
    if (!col || col.a < 0.15 || !(area > 0)) return;
    const hex = toHex(col);
    (colorAgg[hex] || (colorAgg[hex] = { area: 0, bg: 0, text: 0, border: 0, fill: 0 }));
    colorAgg[hex].area += area;
    colorAgg[hex][kind] += area;
  };

  const vw = window.innerWidth || 1440;
  const all = document.querySelectorAll("body *");
  let count = 0;
  for (const el of all) {
    if (count > 5000) break;
    let rect;
    try { rect = el.getBoundingClientRect(); } catch { continue; }
    const area = Math.max(0, rect.width) * Math.max(0, rect.height);
    if (!(area > 0)) continue;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) === 0) continue;
    count++;

    addColor(parseColor(cs.backgroundColor), area, "bg");
    if (parseFloat(cs.borderTopWidth) > 0) addColor(parseColor(cs.borderTopColor), (rect.width + rect.height) * 2, "border");

    const tag = el.tagName.toLowerCase();
    if (tag === "svg" || tag === "path" || tag === "circle" || tag === "rect") {
      addColor(parseColor(cs.fill), Math.min(area, 3000), "fill");
    }

    const hasText = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (hasText) {
      const fs = parseFloat(cs.fontSize) || 16;
      const chars = el.textContent.trim().length;
      const inkArea = Math.min(area, chars * fs * 0.42); // rough painted-ink area
      addColor(parseColor(cs.color), inkArea, "text");

      const fam = (cs.fontFamily || "").split(",")[0].replace(/["']/g, "").trim();
      if (fam) {
        const f = (fontAgg[fam] || (fontAgg[fam] = { area: 0, weights: {}, roles: {}, sizes: [] }));
        f.area += inkArea;
        f.weights[cs.fontWeight] = (f.weights[cs.fontWeight] || 0) + 1;
        f.sizes.push(Math.round(fs));
        let role = "body";
        if (/^h[1-3]$/.test(tag)) role = "display";
        else if (/^h[4-6]$/.test(tag)) role = "heading";
        else if (tag === "code" || tag === "pre" || tag === "kbd" || /mono/i.test(fam)) role = "mono";
        else if (tag === "button" || tag === "a") role = "ui";
        f.roles[role] = (f.roles[role] || 0) + 1;
      }
    }
  }
  return { colors: colorAgg, fonts: fontAgg, sampled: count, viewport: vw };
};

/* ---------------- palette from tokens (area-weighted, role-tagged) --------- */
export function buildPaletteFromTokens(raw, resolved, { max = 6 } = {}) {
  const now = new Date().toISOString();
  if (!raw || !raw.colors || !Object.keys(raw.colors).length) return null;

  let entries = Object.entries(raw.colors).map(([hex, a]) => ({ hex, ...a }));
  // cluster near-duplicates, keeping the larger-area representative
  entries.sort((x, y) => y.area - x.area);
  const merged = [];
  for (const e of entries) {
    const near = merged.find((m) => dist(m.hex, e.hex) < 20);
    if (near) { near.area += e.area; near.bg += e.bg; near.text += e.text; near.border += e.border; near.fill += e.fill; }
    else merged.push({ ...e });
  }

  const totalArea = merged.reduce((s, m) => s + m.area, 0) || 1;
  // role assignment by where the color is mostly used + luminance
  const background = [...merged].sort((a, b) => b.bg - a.bg)[0];
  const ink = [...merged].sort((a, b) => b.text - a.text)[0];
  // brand: most-used non-bg/non-ink color that is chromatic, preferring
  // button/link/fill usage (bg on small elements + svg fill).
  const brandPool = merged.filter((m) => m !== background && m !== ink && chroma(m.hex) > 0.12);
  const brand = brandPool.sort((a, b) => (b.fill + b.bg + b.border) - (a.fill + a.bg + a.border) || chroma(b.hex) - chroma(a.hex))[0];

  const roleOf = (m) => {
    if (background && m.hex === background.hex) return lum(m.hex) > 0.5 ? "background" : "surface";
    if (ink && m.hex === ink.hex) return "text";
    if (brand && m.hex === brand.hex) return "primary";
    if (chroma(m.hex) > 0.15) return "accent";
    return lum(m.hex) > 0.7 ? "surface" : lum(m.hex) < 0.25 ? "ink" : "secondary";
  };

  const ordered = [];
  for (const key of [background, ink, brand]) if (key && !ordered.includes(key)) ordered.push(key);
  for (const m of merged.sort((a, b) => b.area - a.area)) if (!ordered.includes(m)) ordered.push(m);

  const palette = ordered.slice(0, max).map((m) => ({
    hex: m.hex,
    role: roleOf(m),
    coverage: Math.round((m.area / totalArea) * 100) / 100
  }));

  return envelope(palette, "verified", 0.9,
    [evidence("rendered_computed_style", resolved.resolved_url, `${raw.sampled} elements sampled; area-weighted`, now)],
    { source_dom: "rendered", background: background?.hex || null, brand: brand?.hex || null, ink: ink?.hex || null });
}

/* ---------------- fonts from tokens (role + weights) ----------------------- */
const GENERIC = new Set(["sans-serif", "serif", "monospace", "system-ui", "-apple-system", "blinkmacsystemfont", "ui-sans-serif", "ui-serif", "ui-monospace", "inherit", "initial", "sans", "cursive"]);

export function buildFontsFromTokens(raw, resolved, { max = 4 } = {}) {
  const now = new Date().toISOString();
  if (!raw || !raw.fonts || !Object.keys(raw.fonts).length) return null;

  const fonts = Object.entries(raw.fonts)
    .filter(([fam]) => fam && !GENERIC.has(fam.toLowerCase()))
    .map(([family, f]) => {
      const roleName = Object.entries(f.roles).sort((a, b) => b[1] - a[1])[0]?.[0] || "body";
      const weights = Object.keys(f.weights).map(Number).filter(Boolean).sort((a, b) => a - b);
      const sizes = f.sizes.sort((a, b) => a - b);
      return { family, area: f.area, role: roleName, weights, size_range: sizes.length ? [sizes[0], sizes[sizes.length - 1]] : null };
    })
    .sort((a, b) => b.area - a.area)
    .slice(0, max);

  if (!fonts.length) return null;

  // label display vs body by which role dominates and by size range
  const display = fonts.find((f) => f.role === "display" || f.role === "heading") || fonts[0];
  const body = fonts.find((f) => f.role === "body" && f !== display) || fonts.find((f) => f !== display) || display;

  const value = fonts.map((f) => ({
    name: f.family,
    role: f === display ? "display" : f === body ? "body" : f.role,
    weights: f.weights,
    sizes: f.size_range
  }));

  return envelope(value, "verified", 0.92,
    [evidence("rendered_computed_style", resolved.resolved_url, value.map((v) => `${v.name} (${v.role})`).join(", "), now)],
    { source_dom: "rendered", display: display?.family || null, body: body?.family || null });
}

/* ---------------- color math ---------------- */
function rgb(hex) { const n = hex.replace("#", ""); return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)]; }
function dist(a, b) { const [ar, ag, ab] = rgb(a), [br, bg, bb] = rgb(b); return Math.sqrt((ar - br) ** 2 + (ag - bg) ** 2 + (ab - bb) ** 2); }
function lum(hex) { const [r, g, b] = rgb(hex); return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; }
function chroma(hex) { const [r, g, b] = rgb(hex); const mx = Math.max(r, g, b), mn = Math.min(r, g, b); return mx === 0 ? 0 : (mx - mn) / mx; }

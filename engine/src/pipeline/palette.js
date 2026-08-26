/**
 * DP: Color palette used
 * Harvests colors from every static source available (theme-color meta, CSS
 * custom properties, <style> blocks, inline styles, SVG fills), normalizes
 * them to hex, clusters near-duplicates, and ranks by frequency. Works best
 * on the RENDERED HTML the pipeline passes in, since that includes injected
 * critical CSS.
 */
import * as cheerio from "cheerio";
import { envelope, evidence } from "./envelope.js";

const HEX = /#([0-9a-f]{3}|[0-9a-f]{6})\b/gi;
const RGB = /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/gi;

export function extractPalette(html, resolved, { max = 6 } = {}) {
  const $ = cheerio.load(html || "");
  const now = new Date().toISOString();
  const counts = new Map();

  const bump = (hex, w = 1) => {
    if (!hex) return;
    counts.set(hex, (counts.get(hex) || 0) + w);
  };

  // theme-color is an explicit brand signal, weight it heavily
  const theme = $('meta[name="theme-color"]').attr("content");
  if (theme) bump(normalize(theme), 8);

  // CSS custom properties named like brand tokens count extra
  const styleText = $("style").map((_, el) => $(el).text()).get().join("\n");
  for (const m of styleText.matchAll(/--[\w-]*(?:color|brand|primary|accent|bg|background|text)[\w-]*\s*:\s*([^;]+);/gi)) {
    const c = normalize(m[1]); if (c) bump(c, 4);
  }
  harvest(styleText, bump, 1);

  // inline styles
  $("[style]").each((_, el) => harvest($(el).attr("style") || "", bump, 1));
  // svg fills/strokes (logos, icons)
  $("svg [fill], svg[fill], [stroke]").each((_, el) => {
    bump(normalize($(el).attr("fill")), 1);
    bump(normalize($(el).attr("stroke")), 1);
  });

  // rank, then merge near-duplicates (within small RGB distance)
  const ranked = [...counts.entries()]
    .filter(([hex]) => hex && !isNoise(hex))
    .sort((a, b) => b[1] - a[1]);

  // A single-appearance vivid color is usually an icon fill or a gradient stop,
  // not a brand color. Require a little support unless it is a declared token.
  const hasTokens = ranked.some(([, w]) => w >= 4);
  const palette = [];
  for (const [hex, w] of ranked) {
    if (hasTokens && w < 2 && saturated(hex)) continue;   // drop noisy one-off vivids
    if (palette.some((p) => dist(p.hex, hex) < 30)) continue; // dedupe similar (wider)
    palette.push({ hex, weight: w, role: roleOf(hex, palette.length) });
    if (palette.length >= max) break;
  }

  if (!palette.length) {
    return { dp_palette: envelope(null, "unmeasured", 0, [], { reason: "no color declarations found in static/rendered HTML" }) };
  }

  const confidence = Math.min(0.9, 0.45 + Math.min(palette.length / max, 1) * 0.35 + (theme ? 0.1 : 0));
  return {
    dp_palette: envelope(
      palette.map((p) => ({ hex: p.hex, role: p.role })),
      confidence >= 0.7 ? "probable" : "inferred", confidence,
      [evidence("css_color_harvest", resolved.resolved_url, palette.map((p) => p.hex).join(" "), now)],
      { theme_color: theme ? normalize(theme) : null, sampled: ranked.length })
  };
}

function harvest(text, bump, w) {
  if (!text) return;
  for (const m of text.matchAll(HEX)) bump(normalize(m[0]), w);
  for (const m of text.matchAll(RGB)) bump(rgbToHex(+m[1], +m[2], +m[3]), w);
}

function normalize(v) {
  if (!v) return null;
  const s = String(v).trim().toLowerCase();
  let m = s.match(/#([0-9a-f]{3})\b/i);
  if (m) { const [r, g, b] = m[1].split(""); return `#${r}${r}${g}${g}${b}${b}`; }
  m = s.match(/#([0-9a-f]{6})\b/i);
  if (m) return `#${m[1]}`;
  m = s.match(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i);
  if (m) return rgbToHex(+m[1], +m[2], +m[3]);
  return null;
}

function rgbToHex(r, g, b) {
  const h = (n) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

function dist(a, b) {
  const [ar, ag, ab] = rgb(a), [br, bg, bb] = rgb(b);
  return Math.sqrt((ar - br) ** 2 + (ag - bg) ** 2 + (ab - bb) ** 2);
}
function rgb(hex) {
  const n = hex.replace("#", "");
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
}
function lum(hex) { const [r, g, b] = rgb(hex); return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; }

function saturated(hex) {
  const [r, g, b] = rgb(hex);
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  if (max === 0) return false;
  return (max - min) / max > 0.5 && max > 90; // vivid, not grey/pastel
}

// filter pure white/black/near-transparent noise unless they dominate strongly
function isNoise(hex) {
  return hex === "#000000" || hex === "#ffffff";
}
function roleOf(hex, idx) {
  const l = lum(hex);
  if (idx === 0) return "primary";
  if (l > 0.85) return "surface";
  if (l < 0.15) return "ink";
  return idx === 1 ? "secondary" : "accent";
}

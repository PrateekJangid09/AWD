/**
 * DP: Website style (Minimal, Brutalist, Editorial, Playful, ...)
 * A scoring classifier over observable design traits rather than keywords.
 * It fuses signals from the palette, fonts and DOM/CSS the earlier stages
 * already extracted, so it is cheap and evidence-backed. Each style is a
 * weighted profile; the winner plus close runners-up are returned.
 */
import * as cheerio from "cheerio";
import { envelope, evidence } from "./envelope.js";

/**
 * @param {object} inputs { html, palette (dp value), fonts (dp value) }
 */
export function classifyStyle(html, resolved, { palette = [], fonts = [] } = {}) {
  const $ = cheerio.load(html || "");
  const now = new Date().toISOString();
  const styleText = $("style").map((_, el) => $(el).text()).get().join("\n").toLowerCase();
  const raw = (html || "").toLowerCase();

  // ---- derive traits ----
  const colorCount = Array.isArray(palette) ? palette.length : 0;
  const fontList = (Array.isArray(fonts) ? fonts : []).map((f) => String(f).toLowerCase());
  const hasSerif = fontList.some((f) => /garamond|playfair|freight|lora|tiempos|canela|newsreader|noto serif|pt serif|merriweather|serif/.test(f));
  const hasMono = fontList.some((f) => /mono|jetbrains|roboto mono|space mono|courier|ibm plex mono/.test(f));
  const hasRounded = fontList.some((f) => /jakarta|nunito|quicksand|poppins|baloo|fredoka|comfortaa|rounded/.test(f));

  const borderHits = (styleText.match(/border\s*:\s*[^;]*(?:1px|2px|3px|4px)\s+solid/g) || []).length + (styleText.match(/border-radius\s*:\s*0(px)?\b/g) || []).length;
  const bigRadius = (styleText.match(/border-radius\s*:\s*(1[6-9]|[2-9]\d|\d{3})px|border-radius\s*:\s*9999px|border-radius\s*:\s*50%/g) || []).length;
  const shadowHits = (styleText.match(/box-shadow\s*:/g) || []).length;
  const gradientHits = (raw.match(/linear-gradient|radial-gradient/g) || []).length;
  const animHits = (styleText.match(/@keyframes|animation\s*:|transition\s*:/g) || []).length + (raw.match(/data-framer|data-aos|gsap|framer-motion|scrolltrigger/g) || []).length;
  const upperHits = (styleText.match(/text-transform\s*:\s*uppercase/g) || []).length;
  const articleCount = $("article").length;
  const wordCount = $("body").text().split(/\s+/).length;
  const emphaticColor = Array.isArray(palette) && palette.some((p) => saturated(p.hex));

  // ---- style profiles (each returns a score + reasons) ----
  const styles = {
    "Minimal": () => {
      let s = 0; const why = [];
      if (colorCount > 0 && colorCount <= 3) { s += 3; why.push("restrained palette"); }
      if (!emphaticColor) { s += 1; why.push("muted colors"); }
      if (shadowHits <= 2) { s += 1; why.push("few shadows"); }
      if (gradientHits === 0) { s += 1; why.push("no gradients"); }
      if (bigRadius <= 2 && borderHits <= 4) { s += 1; why.push("clean geometry"); }
      return { s, why };
    },
    "Brutalist": () => {
      let s = 0; const why = [];
      if (hasMono) { s += 3; why.push("monospace type"); }
      if (borderHits >= 4) { s += 2; why.push("hard 1px borders / zero radius"); }
      if (upperHits >= 2) { s += 1; why.push("uppercase treatment"); }
      if (shadowHits === 0 && gradientHits === 0) { s += 1; why.push("flat, unornamented"); }
      if (bigRadius === 0) { s += 1; why.push("sharp corners"); }
      return { s, why };
    },
    "Editorial": () => {
      let s = 0; const why = [];
      if (hasSerif) { s += 3; why.push("serif display type"); }
      if (articleCount >= 2 || /\/blog|\/magazine|\/stories|\/journal/.test(raw)) { s += 2; why.push("article-led layout"); }
      if (wordCount > 900) { s += 1; why.push("long-form copy"); }
      if (colorCount <= 4 && !emphaticColor) { s += 1; why.push("typographic, low-chroma"); }
      return { s, why };
    },
    "Playful": () => {
      let s = 0; const why = [];
      if (hasRounded) { s += 2; why.push("rounded type"); }
      if (bigRadius >= 3) { s += 2; why.push("pill / rounded shapes"); }
      if (emphaticColor && colorCount >= 3) { s += 2; why.push("bright, varied palette"); }
      if (gradientHits >= 2) { s += 1; why.push("gradients"); }
      if (animHits >= 4) { s += 1; why.push("lively motion"); }
      return { s, why };
    },
    "Bold / Maximalist": () => {
      let s = 0; const why = [];
      if (emphaticColor) { s += 2; why.push("saturated color"); }
      if (gradientHits >= 3) { s += 1; why.push("heavy gradients"); }
      if (colorCount >= 5) { s += 2; why.push("many colors"); }
      if (upperHits >= 3) { s += 1; why.push("oversized/uppercase"); }
      return { s, why };
    },
    "Motion-Driven": () => {
      let s = 0; const why = [];
      if (animHits >= 6) { s += 3; why.push("many transitions/keyframes"); }
      if (/data-framer|framer-motion|gsap|scrolltrigger|data-aos|lenis/.test(raw)) { s += 3; why.push("animation library detected"); }
      return { s, why };
    },
    "Corporate / Clean": () => {
      let s = 0; const why = [];
      if (shadowHits >= 3 && shadowHits <= 12) { s += 1; why.push("soft card shadows"); }
      if (colorCount >= 2 && colorCount <= 4 && !emphaticColor) { s += 2; why.push("brand-blue-ish restraint"); }
      if (bigRadius >= 1 && bigRadius <= 4) { s += 1; why.push("moderate rounding"); }
      if (/enterprise|solutions|trusted by|request a demo/.test(raw)) { s += 1; why.push("corporate copy"); }
      return { s, why };
    }
  };

  const ranked = Object.entries(styles)
    .map(([name, fn]) => { const r = fn(); return { name, score: r.s, why: r.why }; })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!ranked.length) {
    return { dp_style: envelope(null, "unmeasured", 0, [], { reason: "insufficient style signal in static/rendered HTML" }) };
  }

  const top = ranked[0];
  const second = ranked[1];
  const margin = second ? (top.score - second.score) / top.score : 1;
  const confidence = Math.min(0.88, 0.4 + Math.min(top.score / 7, 0.35) + margin * 0.15);
  // if two styles are close, surface both (design is rarely one-note)
  const primary = top.name;
  const secondary = second && second.score >= top.score * 0.7 ? second.name : null;

  return {
    dp_style: envelope(
      secondary ? [primary, secondary] : [primary],
      confidence >= 0.7 ? "probable" : "inferred", confidence,
      [evidence("design_trait_scoring", resolved.resolved_url, top.why.join(", "), now)],
      { ranked: ranked.slice(0, 4).map((r) => ({ style: r.name, score: r.score })) })
  };
}

function saturated(hex) {
  if (!hex) return false;
  const n = hex.replace("#", "");
  if (n.length !== 6) return false;
  const r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16);
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  if (max === 0) return false;
  const sat = (max - min) / max;
  return sat > 0.45 && max > 90; // vivid, not a grey/pastel
}

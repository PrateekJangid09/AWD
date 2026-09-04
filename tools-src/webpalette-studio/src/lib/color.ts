// Color science: sRGB / HEX / OKLab / OKLCH conversions, WCAG contrast.
// Ported from the validated engine; every function is pure.

export interface RGB { r: number; g: number; b: number; }
export interface OKLab { L: number; a: number; b: number; }
export interface OKLCH { L: number; C: number; H: number; }

export function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
export function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return ('#' + c(r) + c(g) + c(b)).toUpperCase();
}
function srgbToLinear(v: number): number {
  v /= 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}
function linToSrgb(v: number): number {
  const s = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.max(0, v), 1 / 2.4) - 0.055;
  return Math.max(0, Math.min(1, s)) * 255;
}
export function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}
/** WCAG 2.x relative-luminance contrast ratio. */
export function contrast(a: string, b: string): number {
  const l1 = luminance(a), l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
export function rgbToOklab(hex: string): OKLab {
  const { r, g, b } = hexToRgb(hex);
  const R = srgbToLinear(r), G = srgbToLinear(g), B = srgbToLinear(b);
  const l = 0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B;
  const m = 0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B;
  const s = 0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B;
  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
  return {
    L: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  };
}
export function rgbToOklch(hex: string): OKLCH {
  const o = rgbToOklab(hex);
  const C = Math.hypot(o.a, o.b);
  let H = (Math.atan2(o.b, o.a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L: o.L, C, H };
}
function oklchToLin(L: number, C: number, H: number): { r: number; g: number; b: number } {
  const h = (H * Math.PI) / 180, a = C * Math.cos(h), b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  return {
    r: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  };
}
function inGamut(c: { r: number; g: number; b: number }, e = 1e-4): boolean {
  return c.r >= -e && c.r <= 1 + e && c.g >= -e && c.g <= 1 + e && c.b >= -e && c.b <= 1 + e;
}
/** OKLCH -> HEX with hue/lightness-preserving chroma reduction when out of sRGB gamut. */
export function oklchToHex(L: number, C: number, H: number): string {
  L = Math.max(0, Math.min(1, L));
  C = Math.max(0, C);
  H = ((H % 360) + 360) % 360;
  if (L <= 0) return '#000000';
  if (L >= 1) return '#FFFFFF';
  let o = oklchToLin(L, C, H);
  if (inGamut(o)) return rgbToHex(linToSrgb(o.r), linToSrgb(o.g), linToSrgb(o.b));
  let lo = 0, hi = C, best = 0;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(oklchToLin(L, mid, H))) { best = mid; lo = mid; } else hi = mid;
  }
  o = oklchToLin(L, best, H);
  return rgbToHex(linToSrgb(o.r), linToSrgb(o.g), linToSrgb(o.b));
}
/** Perceptual distance in OKLab (CSS Color 4 deltaEOK). */
export function deltaEOK(a: string, b: string): number {
  const A = rgbToOklab(a), B = rgbToOklab(b);
  return Math.hypot(A.L - B.L, A.a - B.a, A.b - B.b);
}
export function hueDist(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}
export function clamp01(v: number): number { return Math.max(0, Math.min(1, v)); }
export function gauss(x: number, t: number, w: number): number { return Math.exp(-Math.pow((x - t) / w, 2)); }
export function circularMeanHue(items: { h: number; w: number }[]): number {
  let x = 0, y = 0;
  for (const { h, w } of items) { x += Math.cos((h * Math.PI) / 180) * w; y += Math.sin((h * Math.PI) / 180) * w; }
  if (x === 0 && y === 0) return 250;
  let a = (Math.atan2(y, x) * 180) / Math.PI;
  return a < 0 ? a + 360 : a;
}
/** Choose the readable text color (near-black or white) for a given background. */
export function bestText(bg: string): string {
  return contrast(bg, '#111318') >= contrast(bg, '#FFFFFF') ? '#111318' : '#FFFFFF';
}

export type OnSurfaceIntent = 'display' | 'body' | 'ui';
export interface OnSurfaceResolution {
  color: string;
  ratio: number;
  lightRatio: number;
  darkRatio: number;
  preferredPolarity: 'light' | 'dark' | 'auto';
  usedPreferredPolarity: boolean;
  target: number;
}

/**
 * Resolve a semantic foreground from the palette's own Light/Dark Neutral roles.
 *
 * Pure max-contrast selection can look visually backwards on saturated mid-dark
 * colors (for example #6C63FF may numerically favor near-black by a small amount).
 * Large display type should instead respect surface polarity when that choice is
 * functionally readable: light-on-dark, dark-on-light. Normal body copy keeps the
 * stricter 4.5:1 threshold; display/UI content uses the 3:1 large-text/UI floor.
 */
export function resolveOnSurface(
  background: string,
  lightNeutral: string,
  darkNeutral: string,
  intent: OnSurfaceIntent = 'body',
): OnSurfaceResolution {
  const lightRatio = contrast(background, lightNeutral);
  const darkRatio = contrast(background, darkNeutral);
  const target = intent === 'body' ? 4.5 : 3;
  const L = rgbToOklch(background).L;

  // Deliberate perceptual dead-band. Below ~0.68 the surface generally reads as
  // dark enough that light display text feels natural; above ~0.76 dark text feels
  // natural. In between, let contrast decide.
  const preferredPolarity: 'light' | 'dark' | 'auto' = L <= 0.68 ? 'light' : L >= 0.76 ? 'dark' : 'auto';
  const strongest = lightRatio >= darkRatio
    ? { color: lightNeutral, ratio: lightRatio }
    : { color: darkNeutral, ratio: darkRatio };

  if (preferredPolarity === 'auto') {
    return { ...strongest, lightRatio, darkRatio, preferredPolarity, usedPreferredPolarity: false, target };
  }

  const preferred = preferredPolarity === 'light'
    ? { color: lightNeutral, ratio: lightRatio }
    : { color: darkNeutral, ratio: darkRatio };
  const fallback = preferredPolarity === 'light'
    ? { color: darkNeutral, ratio: darkRatio }
    : { color: lightNeutral, ratio: lightRatio };

  if (preferred.ratio >= target) {
    return { ...preferred, lightRatio, darkRatio, preferredPolarity, usedPreferredPolarity: true, target };
  }
  if (fallback.ratio >= target) {
    return { ...fallback, lightRatio, darkRatio, preferredPolarity, usedPreferredPolarity: false, target };
  }
  return { ...strongest, lightRatio, darkRatio, preferredPolarity, usedPreferredPolarity: strongest.color === preferred.color, target };
}
export function normalizeHex(v: string | null | undefined): string | null {
  if (v == null) return null;
  let s = String(v).trim().toUpperCase();
  if (!s.startsWith('#')) s = '#' + s;
  if (/^#[0-9A-F]{3}$/.test(s)) s = '#' + s.slice(1).split('').map((x) => x + x).join('');
  return /^#[0-9A-F]{6}$/.test(s) ? s : null;
}

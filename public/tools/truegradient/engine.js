const clamp = (n, min = 0, max = 1) => Math.min(max, Math.max(min, n));
const mod = (n, d) => ((n % d) + d) % d;

export function normalizeHex(input) {
  if (typeof input !== 'string') return null;
  let value = input.trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(value)) value = value.split('').map(c => c + c).join('');
  return /^[0-9a-f]{6}$/i.test(value) ? `#${value.toUpperCase()}` : null;
}

export function hexToRgb(hex) {
  const h = normalizeHex(hex);
  if (!h) throw new Error(`Invalid HEX color: ${hex}`);
  const n = parseInt(h.slice(1), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

export function rgbToHex(rgb) {
  const h = v => Math.round(clamp(v) * 255).toString(16).padStart(2, '0');
  return `#${h(rgb.r)}${h(rgb.g)}${h(rgb.b)}`.toUpperCase();
}

export const srgbToLinear = v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
export const linearToSrgb = v => v <= 0.0031308 ? 12.92 * v : 1.055 * (v ** (1 / 2.4)) - 0.055;

export function rgbToOklab(rgb) {
  const r = srgbToLinear(rgb.r), g = srgbToLinear(rgb.g), b = srgbToLinear(rgb.b);
  const l = 0.4122214708*r + 0.5363325363*g + 0.0514459929*b;
  const m = 0.2119034982*r + 0.6806995451*g + 0.1073969566*b;
  const s = 0.0883024619*r + 0.2817188376*g + 0.6299787005*b;
  const L = Math.cbrt(l), M = Math.cbrt(m), S = Math.cbrt(s);
  return {
    L: 0.2104542553*L + 0.7936177850*M - 0.0040720468*S,
    a: 1.9779984951*L - 2.4285922050*M + 0.4505937099*S,
    b: 0.0259040371*L + 0.7827717662*M - 0.8086757660*S
  };
}

export function oklabToRgb(lab) {
  const L = lab.L + 0.3963377774*lab.a + 0.2158037573*lab.b;
  const M = lab.L - 0.1055613458*lab.a - 0.0638541728*lab.b;
  const S = lab.L - 0.0894841775*lab.a - 1.2914855480*lab.b;
  const l = L**3, m = M**3, s = S**3;
  return {
    r: linearToSrgb(4.0767416621*l - 3.3077115913*m + 0.2309699292*s),
    g: linearToSrgb(-1.2684380046*l + 2.6097574011*m - 0.3413193965*s),
    b: linearToSrgb(-0.0041960863*l - 0.7034186147*m + 1.7076147010*s)
  };
}

export function oklabToOklch(lab) {
  const C = Math.hypot(lab.a, lab.b);
  return { L: lab.L, C, h: C < 1e-7 ? 0 : mod(Math.atan2(lab.b, lab.a) * 180 / Math.PI, 360) };
}

export function oklchToOklab(c) {
  const h = c.h * Math.PI / 180;
  return { L: c.L, a: c.C * Math.cos(h), b: c.C * Math.sin(h) };
}

export const rgbToOklch = rgb => oklabToOklch(rgbToOklab(rgb));
export const oklchToRgb = lch => oklabToRgb(oklchToOklab(lch));

export function deltaEOK(a, b) {
  const A = 'C' in a ? oklchToOklab(a) : a;
  const B = 'C' in b ? oklchToOklab(b) : b;
  return Math.hypot(A.L - B.L, A.a - B.a, A.b - B.b);
}

export function isInSrgbGamut(rgb) {
  const e = 1e-7;
  return rgb.r >= -e && rgb.r <= 1 + e && rgb.g >= -e && rgb.g <= 1 + e && rgb.b >= -e && rgb.b <= 1 + e;
}

export const clipRgb = rgb => ({ r: clamp(rgb.r), g: clamp(rgb.g), b: clamp(rgb.b) });

// CSS Color 4 style binary-search gamut mapping with local MINDE.
// The destination here is sRGB. JND for deltaEOK is 0.02, epsilon 0.0001.
export function gamutMapOklchToSrgb(origin, { jnd = 0.02, epsilon = 0.0001 } = {}) {
  if (origin.L >= 1) return { rgb: {r:1,g:1,b:1}, mapped: true, deltaE: 0, mappedLch: {L:1,C:0,h:origin.h} };
  if (origin.L <= 0) return { rgb: {r:0,g:0,b:0}, mapped: true, deltaE: 0, mappedLch: {L:0,C:0,h:origin.h} };

  const raw = oklchToRgb(origin);
  if (isInSrgbGamut(raw)) return { rgb: clipRgb(raw), mapped: false, deltaE: 0, mappedLch: origin };

  let current = {...origin};
  let clipped = clipRgb(raw);
  let E = deltaEOK(oklchToOklab(current), rgbToOklab(clipped));
  if (E < jnd) {
    return { rgb: clipped, mapped: true, deltaE: E, mappedLch: rgbToOklch(clipped) };
  }

  let min = 0;
  let max = Math.max(0, origin.C);
  let minInGamut = true;
  let iterations = 0;

  while (max - min > epsilon && iterations++ < 40) {
    const chroma = (min + max) / 2;
    current = {...origin, C: chroma};
    const currentRgb = oklchToRgb(current);

    if (minInGamut && isInSrgbGamut(currentRgb)) {
      min = chroma;
      continue;
    }

    clipped = clipRgb(currentRgb);
    E = deltaEOK(oklchToOklab(current), rgbToOklab(clipped));

    if (E < jnd) {
      if (jnd - E < epsilon) break;
      minInGamut = false;
      min = chroma;
    } else {
      max = chroma;
    }
  }

  return { rgb: clipped, mapped: true, deltaE: E, mappedLch: rgbToOklch(clipped) };
}

function hueDelta(h1, h2, method) {
  const inc = mod(h2 - h1, 360);
  const dec = inc === 0 ? 0 : inc - 360;
  if (method === 'increasing') return inc;
  if (method === 'decreasing') return dec;
  if (method === 'longer') return Math.abs(inc) >= Math.abs(dec) ? inc : dec;
  return Math.abs(inc) <= Math.abs(dec) ? inc : dec;
}

export function interpolateSrgb(a, b, t) {
  return { r: a.r + (b.r-a.r)*t, g: a.g + (b.g-a.g)*t, b: a.b + (b.b-a.b)*t };
}

export function interpolateOklch(a, b, t, method = 'shorter') {
  let h1 = a.h, h2 = b.h;
  if (a.C < 1e-7 && b.C >= 1e-7) h1 = h2;
  if (b.C < 1e-7 && a.C >= 1e-7) h2 = h1;
  return {
    L: a.L + (b.L-a.L)*t,
    C: a.C + (b.C-a.C)*t,
    h: mod(h1 + hueDelta(h1,h2,method)*t, 360)
  };
}

export function normalizeStops(stops) {
  const clean = stops
    .map(s => ({color: normalizeHex(s.color), position: Number(s.position)}))
    .filter(s => s.color && Number.isFinite(s.position))
    .map(s => ({...s, position: clamp(s.position, 0, 100)}))
    .sort((a,b) => a.position-b.position);
  return clean.length >= 2 ? clean : null;
}

function segmentAt(stops, t) {
  const pct = t * 100;
  if (pct <= stops[0].position) return {a:stops[0], b:stops[0], u:0};
  if (pct >= stops.at(-1).position) return {a:stops.at(-1), b:stops.at(-1), u:0};
  for (let i=0;i<stops.length-1;i++) {
    const a=stops[i], b=stops[i+1];
    if (pct >= a.position && pct <= b.position) {
      const span = Math.max(1e-9, b.position-a.position);
      return {a,b,u:(pct-a.position)/span};
    }
  }
  return {a:stops[0], b:stops.at(-1), u:t};
}

export function sampleAt(stops, t, mode='oklch', hueMethod='shorter') {
  const s = normalizeStops(stops);
  if (!s) throw new Error('At least two valid color stops are required.');
  const position = clamp(Number(t), 0, 1);
  const seg = segmentAt(s, position);

  if (seg.a === seg.b) {
    const rgb = hexToRgb(seg.a.color);
    return {t:position, rgb, hex:rgbToHex(rgb), oklch:rgbToOklch(rgb), gamutMapped:false, mapDeltaE:0};
  }

  if (mode === 'srgb') {
    const rgb = interpolateSrgb(hexToRgb(seg.a.color), hexToRgb(seg.b.color), seg.u);
    return {t:position, rgb, hex:rgbToHex(rgb), oklch:rgbToOklch(rgb), gamutMapped:false, mapDeltaE:0};
  }

  const lch = interpolateOklch(
    rgbToOklch(hexToRgb(seg.a.color)),
    rgbToOklch(hexToRgb(seg.b.color)),
    seg.u,
    hueMethod
  );
  const mapped = gamutMapOklchToSrgb(lch);
  return {
    t:position,
    rgb:mapped.rgb,
    hex:rgbToHex(mapped.rgb),
    oklch:lch,
    gamutMapped:mapped.mapped,
    mapDeltaE:mapped.deltaE,
    mappedLch:mapped.mappedLch
  };
}

export function sampleGradient(stops, mode='oklch', samples=33, hueMethod='shorter') {
  const count = Math.max(2, samples);
  return Array.from({length:count}, (_, i) => sampleAt(stops, i/(count-1), mode, hueMethod));
}

export function midpoint(stops, mode='oklch', hueMethod='shorter') {
  return sampleAt(stops, .5, mode, hueMethod);
}

export function nativeGradientCss(stops, angle=90, mode='oklch', hueMethod='shorter') {
  const s = normalizeStops(stops);
  if (!s) return '';
  const interpolation = mode === 'oklch' ? `in oklch ${hueMethod} hue` : 'in srgb';
  return `linear-gradient(${angle}deg ${interpolation}, ${s.map(x=>`${x.color} ${trimNum(x.position)}%`).join(', ')})`;
}

export function fallbackGradientCss(stops, angle=90, samples=33, hueMethod='shorter') {
  const points = sampleGradient(stops, 'oklch', samples, hueMethod);
  return `linear-gradient(${angle}deg, ${points.map(p=>`${p.hex} ${trimNum(p.t*100)}%`).join(', ')})`;
}

export function formatOklch(c, precision=4) {
  return `oklch(${(c.L*100).toFixed(2)}% ${c.C.toFixed(precision)} ${c.h.toFixed(2)})`;
}

export function rgbText(rgb) {
  return `rgb(${Math.round(clamp(rgb.r)*255)} ${Math.round(clamp(rgb.g)*255)} ${Math.round(clamp(rgb.b)*255)})`;
}

export function oklchChannels(hex) {
  const c = rgbToOklch(hexToRgb(hex));
  return {L:c.L*100, C:c.C, h:c.h};
}

export function perceptualDifference(stops, hueMethod='shorter') {
  const s = midpoint(stops,'srgb',hueMethod);
  const o = midpoint(stops,'oklch',hueMethod);
  return deltaEOK(rgbToOklab(s.rgb), rgbToOklab(o.rgb));
}

export function chromaLift(stops, hueMethod='shorter') {
  const s = midpoint(stops,'srgb',hueMethod).oklch.C;
  const o = rgbToOklch(midpoint(stops,'oklch',hueMethod).rgb).C;
  return {srgb:s, oklch:o, delta:o-s};
}

function trimNum(n) {
  const x = Math.round(n*100)/100;
  return Number.isInteger(x) ? String(x) : String(x);
}

export function parseGradientInput(text) {
  if (typeof text !== 'string' || !text.trim()) {
    return {error:'not-enough-colors', message:'Add at least two valid HEX colors.'};
  }

  const src = text.trim();
  const gradientMatch = src.match(/^linear-gradient\((.*)\)$/is);
  if (!gradientMatch) {
    return {error:'unsupported-syntax', message:'TrueGradient currently imports HEX-based linear-gradient() values.'};
  }

  const inner = gradientMatch[1].trim();
  if (/\b(?:rgb|rgba|hsl|hsla|oklch|oklab|lab|lch|color|var|calc)\s*\(/i.test(inner) || /#[0-9a-f]{4}(?![0-9a-f])|#[0-9a-f]{8}(?![0-9a-f])/i.test(inner)) {
    return {error:'unsupported-syntax', message:'TrueGradient currently imports HEX-based linear-gradient() values.'};
  }

  const parts = inner.split(',').map(part => part.trim()).filter(Boolean);
  if (parts.length < 2) {
    return {error:'not-enough-colors', message:'Add at least two valid HEX colors.'};
  }

  let angle = 90;
  const angleMatch = parts[0].match(/^(-?\d+(?:\.\d+)?)deg$/i);
  if (angleMatch) {
    angle = mod(Number(angleMatch[1]), 360);
    parts.shift();
  } else if (/^to\s+/i.test(parts[0])) {
    return {error:'unsupported-syntax', message:'Directional gradient syntax is not supported yet. Use a numeric angle such as 90deg.'};
  }

  const tokens = [];
  const stopPattern = /^(#[0-9a-f]{3}|#[0-9a-f]{6})(?:\s+(-?\d+(?:\.\d+)?)%)?$/i;
  for (const part of parts) {
    const match = part.match(stopPattern);
    if (!match) {
      return {error:'unsupported-syntax', message:'TrueGradient currently imports HEX-based linear-gradient() values.'};
    }
    const color = normalizeHex(match[1]);
    if (!color) continue;
    const position = match[2] == null ? null : Number(match[2]);
    tokens.push({color, position});
  }

  if (tokens.length < 2) {
    return {error:'not-enough-colors', message:'Add at least two valid HEX colors.'};
  }

  if (tokens[0].position == null) tokens[0].position = 0;
  if (tokens.at(-1).position == null) tokens.at(-1).position = 100;

  let i = 0;
  while (i < tokens.length) {
    if (tokens[i].position != null) { i++; continue; }
    const start = i - 1;
    let end = i;
    while (end < tokens.length && tokens[end].position == null) end++;
    const a = tokens[start].position;
    const b = tokens[end].position;
    const span = end - start;
    for (let k = 1; k < span; k++) tokens[start+k].position = a + (b-a)*(k/span);
    i = end + 1;
  }

  const warning = tokens.length > 6
    ? 'This editor supports up to 6 stops. Only the first 6 were loaded.'
    : '';

  return {angle, stops:tokens.slice(0, 6), warning};
}

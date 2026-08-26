import { contrast, rgbToOklch, deltaEOK, clamp01, gauss, hueDist } from './color';
import { Role, Swatch, HealthReport } from './types';

export interface FunctionalPairing {
  id: 'body' | 'primaryText' | 'secondaryText' | 'accentText' | 'primaryUI' | 'accentUI';
  a?: Role;
  b?: Role;
  bg?: Role;
  target: number;
  kind: 'text' | 'ui';
  pass: boolean;
  ratio: number;
  foreground?: Role;
}

export function roleFit(hex: string, role: Role, index = 0): number {
  const o = rgbToOklch(hex);
  const vivid = clamp01(o.C / 0.20);
  const mid = gauss(o.L, 0.61, 0.25);
  const neutral = gauss(o.C, 0.010, 0.050);
  if (role === 'light') {
    const bright = clamp01((o.L - 0.74) / 0.23);
    return clamp01(0.70 * bright + 0.30 * neutral - 0.45 * clamp01((o.C - 0.055) / 0.10));
  }
  if (role === 'dark') {
    const deep = clamp01((0.56 - o.L) / 0.30);
    return clamp01(0.70 * deep + 0.30 * neutral - 0.45 * clamp01((o.C - 0.060) / 0.11));
  }
  if (role === 'primary') return clamp01(0.48 * vivid + 0.32 * mid + 0.12 * (index === 0 ? 1 : 0.6) + 0.08 * clamp01((o.L - 0.16) / 0.68));
  if (role === 'secondary') return clamp01(0.40 * vivid + 0.34 * mid + 0.14 * (index === 1 ? 1 : 0.7) + 0.12 * clamp01((o.L - 0.15) / 0.70));
  return clamp01(0.46 * vivid + 0.22 * mid + 0.22 * clamp01(Math.max(contrast(hex, '#111318'), contrast(hex, '#FFFFFF')) / 7) + 0.10 * (index >= 2 ? 1 : 0.65));
}

/** Six unique, real website relationships. We never count A→B and B→A twice. */
export function pairings(m: Partial<Record<Role, string>>) {
  const specs: Omit<FunctionalPairing, 'pass' | 'ratio' | 'foreground'>[] = [
    { id: 'body', a: 'dark', b: 'light', target: 4.5, kind: 'text' },
    { id: 'primaryText', bg: 'primary', target: 4.5, kind: 'text' },
    { id: 'secondaryText', bg: 'secondary', target: 4.5, kind: 'text' },
    { id: 'accentText', bg: 'accent', target: 4.5, kind: 'text' },
    { id: 'primaryUI', a: 'primary', b: 'light', target: 3, kind: 'ui' },
    { id: 'accentUI', a: 'accent', b: 'light', target: 3, kind: 'ui' },
  ];
  const det: FunctionalPairing[] = specs.map((x) => {
    if (x.bg) {
      const bg = m[x.bg];
      const candidates = (['dark', 'light'] as Role[]).filter((r) => Boolean(m[r]));
      if (!bg || !candidates.length) return { ...x, pass: false, ratio: 0 };
      let foreground = candidates[0];
      let ratio = contrast(m[foreground]!, bg);
      for (const r of candidates.slice(1)) {
        const next = contrast(m[r]!, bg);
        if (next > ratio) { ratio = next; foreground = r; }
      }
      return { ...x, pass: ratio >= x.target, ratio, foreground };
    }
    if (!x.a || !x.b || !m[x.a] || !m[x.b]) return { ...x, pass: false, ratio: 0 };
    const ratio = contrast(m[x.a]!, m[x.b]!);
    return { ...x, pass: ratio >= x.target, ratio, foreground: x.a };
  });
  const passed = det.filter((d) => d.pass).length;
  const progress = det.reduce((sum, d) => sum + Math.min(1, d.ratio / d.target), 0) / det.length;
  return { passed, total: det.length, coverage: passed / det.length, progress, det };
}

/** Accessible unordered color pairs. This is deliberately different from functional coverage. */
export function accessiblePairCount(items: Swatch[], threshold = 4.5): number {
  let count = 0;
  for (let i = 0; i < items.length; i++)
    for (let j = i + 1; j < items.length; j++)
      if (contrast(items[i].hex, items[j].hex) >= threshold) count++;
  return count;
}

export function separationQuality(items: Swatch[]): number {
  if (items.length < 2) return 0;
  const distances: number[] = [];
  for (let i = 0; i < items.length; i++)
    for (let j = i + 1; j < items.length; j++) distances.push(deltaEOK(items[i].hex, items[j].hex));
  const sorted = [...distances].sort((a, b) => a - b);
  const q20 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.2))];
  const avg = distances.reduce((a, b) => a + b, 0) / distances.length;
  return clamp01(0.55 * clamp01((q20 - 0.025) / 0.105) + 0.45 * clamp01((avg - 0.075) / 0.17));
}

export function tonalQuality(items: Swatch[]): number {
  if (!items.length) return 0;
  const ls = items.map((c) => rgbToOklch(c.hex).L);
  return clamp01((Math.max(...ls) - Math.min(...ls) - 0.30) / 0.42);
}

export function accentQuality(items: Swatch[]): number {
  const accent = items.find((c) => c.role === 'accent');
  if (!accent) return 0;
  const o = rgbToOklch(accent.hex);
  const brands = items.filter((c) => c.role === 'primary' || c.role === 'secondary');
  const minD = brands.length ? Math.min(...brands.map((c) => deltaEOK(accent.hex, c.hex))) : 0.12;
  const nearestHue = brands.length ? Math.min(...brands.map((c) => hueDist(o.H, rgbToOklch(c.hex).H))) : 180;
  const light = items.find((c) => c.role === 'light');
  const uiContrast = light ? contrast(accent.hex, light.hex) : 0;
  const bestText = Math.max(contrast(accent.hex, '#111318'), contrast(accent.hex, '#FFFFFF'));
  const structural = Math.max(
    clamp01((minD - 0.030) / 0.135),
    clamp01((nearestHue - 20) / 105) * 0.90,
    nearestHue < 18 ? clamp01((minD - 0.055) / 0.10) : 0,
  );
  const chromaCleanliness = clamp01((o.C - 0.085) / 0.105);
  const warmMudBand = o.H >= 62 && o.H <= 138
    ? clamp01((0.66 - o.L) / 0.24) * clamp01((0.17 - o.C) / 0.09)
    : 0;
  const generatedMudPenalty = accent.source ? 0 : 0.42 * warmMudBand;
  return clamp01(
    0.27 * chromaCleanliness +
    0.31 * structural +
    0.22 * clamp01((bestText - 3) / 4) +
    0.20 * clamp01((uiContrast - 2) / 2.5) -
    generatedMudPenalty
  );
}

export function healthReport(items: Swatch[]): HealthReport {
  const m: Partial<Record<Role, string>> = {};
  items.forEach((c) => (m[c.role] = c.hex));
  const light = items.find((c) => c.role === 'light');
  const dark = items.find((c) => c.role === 'dark');
  const accent = items.find((c) => c.role === 'accent');
  const lightFit = light ? roleFit(light.hex, 'light') : 0;
  const darkFit = dark ? roleFit(dark.hex, 'dark') : 0;
  const p = pairings(m);
  const pairCount = accessiblePairCount(items, 4.5);
  const acc = accentQuality(items);
  const separation = separationQuality(items);
  const tonalRange = tonalQuality(items);
  const accentUI = accent && light ? contrast(accent.hex, light.hex) : 0;
  const isOriginalUserAccent = Boolean(accent?.source) && accent?.origin !== 'suggestion';
  const accentPass = Boolean(accent) && (isOriginalUserAccent ? acc >= 0.48 : acc >= 0.60 && accentUI >= 3);

  return {
    complete: ['primary', 'secondary', 'light', 'dark', 'accent'].every((r) => items.some((c) => c.role === r)),
    light: Boolean(light) && lightFit >= 0.66,
    dark: Boolean(dark) && darkFit >= 0.66,
    coverage: p.passed >= 4,
    pairings: pairCount >= 4,
    accent: accentPass,
    tonal: tonalRange >= 0.58 && separation >= 0.52,
    coveragePct: p.coverage,
    pairingsPassed: pairCount,
    pairingsTotal: items.length < 2 ? 0 : (items.length * (items.length - 1)) / 2,
    accentQuality: acc,
    separation,
    tonalRange,
    lightFit,
    darkFit,
  };
}

export function isHealthy(items: Swatch[]): boolean {
  const c = healthReport(items);
  return c.complete && c.light && c.dark && c.coverage && c.pairings && c.accent && c.tonal;
}

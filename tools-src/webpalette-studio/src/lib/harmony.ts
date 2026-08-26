// WebPalette Studio engine V15 — explainable relationship-aware palette solver.
//
// Contract:
// 1. User colors are immutable taste decisions.
// 2. Relationship is understood before new hues are considered.
// 3. Missing website roles are generated with the smallest useful intervention.
// 4. Complete palettes are ranked as systems, not isolated swatches.
// 5. Every returned color carries an explainable derivation.

import {
  OKLCH, rgbToOklch, oklchToHex, deltaEOK, hueDist, contrast,
  clamp01, circularMeanHue, gauss,
} from './color';
import {
  Role, ROLE_ORDER, Roles, Swatch, HarmonyOption, RelationshipKey,
  ColorDerivation, DerivationTransform,
} from './types';
import {
  roleFit, pairings, accessiblePairCount, accentQuality, separationQuality, tonalQuality,
} from './scoring';

interface SourceAnalysisItem {
  hex: string;
  index: number;
  o: OKLCH;
  cls: 'light' | 'dark' | 'neutral-mid' | 'chromatic';
}

export interface SourceAnalysis {
  src: SourceAnalysisItem[];
  chrom: SourceAnalysisItem[];
  relationship: RelationshipKey;
  label: string;
  maxD: number;
  minD: number;
  concentration: number;
  undertoneH: number;
  avgC: number;
  avgL: number;
  primaryCandidate: SourceAnalysisItem | null;
}

export interface PaletteContext {
  roles: Roles;
  analysis: SourceAnalysis;
  medC: number;
  medL: number;
  undertoneH: number;
  undertoneC: number;
  primary: OKLCH;
}

export interface ObjectiveBreakdown {
  contrastProgress: number;
  functionalPasses: number;
  accessiblePairs: number;
  completeness: number;
  neutralFitness: number;
  accentUtility: number;
  tonalHierarchy: number;
  separation: number;
  relationshipPreservation: number;
  hueEconomy: number;
  total: number;
}

function median(a: number[]): number {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function adaptiveNeutrality(o: OKLCH): number {
  const edge = Math.abs(o.L - 0.5) * 2;
  return 0.026 + 0.032 * edge;
}
export function classify(hex: string): SourceAnalysisItem['cls'] {
  const o = rgbToOklch(hex), n = adaptiveNeutrality(o);
  if (o.L >= 0.87 && o.C <= n) return 'light';
  if (o.L <= 0.42 && o.C <= n + 0.014) return 'dark';
  if (o.C <= 0.025) return 'neutral-mid';
  return 'chromatic';
}
function relationshipLabel(k: RelationshipKey): string {
  return ({
    neutral: 'Neutral-led', single: 'Single hue', monochrome: 'Monochromatic', analogous: 'Analogous',
    related: 'Related hues', split: 'Split / wide', complementary: 'Near-complementary',
    triadic: 'Triadic', multi: 'Multi-hue',
  } as Record<RelationshipKey, string>)[k];
}
function hueConcentration(colors: OKLCH[]): number {
  if (!colors.length) return 0;
  let x = 0, y = 0, w = 0;
  for (const o of colors) {
    const ww = Math.max(0.03, o.C);
    x += Math.cos((o.H * Math.PI) / 180) * ww;
    y += Math.sin((o.H * Math.PI) / 180) * ww;
    w += ww;
  }
  return w ? Math.hypot(x, y) / w : 0;
}

export function analyzeSources(sourceHexes: string[]): SourceAnalysis {
  const src = sourceHexes.map((hex, index) => ({ hex, index, o: rgbToOklch(hex), cls: classify(hex) }));
  const chrom = src.filter((x) => x.cls === 'chromatic');
  const hues = chrom.map((x) => x.o.H).sort((a, b) => a - b);
  let relationship: RelationshipKey = 'neutral', maxD = 0, minD = 180;
  for (let i = 0; i < hues.length; i++) for (let j = i + 1; j < hues.length; j++) {
    const d = hueDist(hues[i], hues[j]); maxD = Math.max(maxD, d); minD = Math.min(minD, d);
  }
  if (chrom.length === 1) relationship = 'single';
  else if (chrom.length === 2) {
    if (maxD < 16) relationship = 'monochrome';
    else if (maxD <= 52) relationship = 'analogous';
    else if (maxD <= 105) relationship = 'related';
    else if (maxD < 150) relationship = 'split';
    else relationship = 'complementary';
  } else if (chrom.length >= 3) {
    const gaps: number[] = [];
    for (let i = 0; i < hues.length; i++) {
      const next = hues[(i + 1) % hues.length] + (i === hues.length - 1 ? 360 : 0);
      gaps.push(next - hues[i]);
    }
    const triad = hues.length === 3 && gaps.every((d) => d >= 82 && d <= 158);
    if (triad) relationship = 'triadic';
    else if (maxD < 66) relationship = 'analogous';
    else if (maxD >= 150 && chrom.length === 3) relationship = 'split';
    else relationship = 'multi';
  }

  const primaryCandidate = chrom[0] || src[0] || null; // selection order is explicit intent
  const concentration = hueConcentration(chrom.map((x) => x.o));
  let undertoneH = primaryCandidate?.o.H ?? 255;
  if (chrom.length && concentration > 0.36) {
    undertoneH = circularMeanHue(chrom.map((x) => ({ h: x.o.H, w: 0.15 + x.o.C })));
  }
  const avgC = chrom.length ? chrom.reduce((a, x) => a + x.o.C, 0) / chrom.length : 0;
  const avgL = src.length ? src.reduce((a, x) => a + x.o.L, 0) / src.length : 0.6;
  return { src, chrom, relationship, label: relationshipLabel(relationship), maxD, minD, concentration, undertoneH, avgC, avgL, primaryCandidate };
}

/** Source-role inference: structurally-valid neutrals first, then user selection order as brand intent. */
export function inferSourceRoles(sourceHexes: string[], lockedRoles: Partial<Record<Role, string>> = {}): { roles: Roles; analysis: SourceAnalysis } {
  const analysis = analyzeSources(sourceHexes);
  const roles: Roles = { primary: null, secondary: null, light: null, dark: null, accent: null };
  const used = new Set<number>();

  // Accepted suggestion choices can be role-locked. A locked role is a hard user
  // constraint: Complete palette may solve around it, but may never replace or reassign it.
  for (const role of ROLE_ORDER) {
    const lockedHex = lockedRoles[role];
    if (!lockedHex) continue;
    const hit = analysis.src.find((x) => !used.has(x.index) && x.hex.toUpperCase() === lockedHex.toUpperCase());
    if (!hit) continue;
    roles[role] = { hex: hit.hex, source: true, sourceIndex: hit.index };
    used.add(hit.index);
  }

  const lightCandidates = analysis.src.filter((x) => !used.has(x.index) && x.cls === 'light' && roleFit(x.hex, 'light') >= 0.66)
    .sort((a, b) => roleFit(b.hex, 'light') - roleFit(a.hex, 'light') || a.index - b.index);
  const darkCandidates = analysis.src.filter((x) => !used.has(x.index) && x.cls === 'dark' && roleFit(x.hex, 'dark') >= 0.66)
    .sort((a, b) => roleFit(b.hex, 'dark') - roleFit(a.hex, 'dark') || a.index - b.index);
  if (!roles.light && lightCandidates[0]) { roles.light = { hex: lightCandidates[0].hex, source: true, sourceIndex: lightCandidates[0].index }; used.add(lightCandidates[0].index); }
  if (!roles.dark && darkCandidates[0] && !used.has(darkCandidates[0].index)) { roles.dark = { hex: darkCandidates[0].hex, source: true, sourceIndex: darkCandidates[0].index }; used.add(darkCandidates[0].index); }

  const brandish = analysis.src.filter((x) => !used.has(x.index));
  const brandRoles = ['primary', 'secondary', 'accent'] as Role[];
  for (const x of brandish) {
    const role = brandRoles.find((r) => !roles[r]);
    if (!role) break;
    roles[role] = { hex: x.hex, source: true, sourceIndex: x.index };
    used.add(x.index);
  }

  for (const x of analysis.src.filter((x) => !used.has(x.index))) {
    if (!roles.light && x.o.L > 0.72) roles.light = { hex: x.hex, source: true, sourceIndex: x.index };
    else if (!roles.dark && x.o.L < 0.40) roles.dark = { hex: x.hex, source: true, sourceIndex: x.index };
    else {
      const r = (['secondary', 'accent', 'primary', 'light', 'dark'] as Role[]).find((role) => !roles[role]);
      if (r) roles[r] = { hex: x.hex, source: true, sourceIndex: x.index };
    }
    used.add(x.index);
  }
  return { roles, analysis };
}

export function context(sources: string[], lockedRoles: Partial<Record<Role, string>> = {}): PaletteContext {
  const { roles, analysis } = inferSourceRoles(sources, lockedRoles);
  const pool = analysis.chrom.length ? analysis.chrom.map((x) => x.o) : analysis.src.map((x) => x.o);
  const medC = median(pool.map((o) => o.C)) || 0.14;
  const medL = median(pool.map((o) => o.L)) || 0.6;
  const primary = roles.primary ? rgbToOklch(roles.primary.hex) : { L: medL, C: medC, H: analysis.undertoneH };
  return { roles, analysis, medC, medL, undertoneH: analysis.undertoneH, undertoneC: analysis.avgC, primary };
}

function fidelity(hex: string, ctx: PaletteContext): number {
  const o = rgbToOklch(hex);
  const dC = Math.abs(o.C - ctx.medC) / 0.22;
  const dL = Math.abs(o.L - ctx.medL) / 0.6;
  return Math.round(clamp01(1 - (dC * 0.6 + dL * 0.4)) * 100);
}

interface Candidate {
  hex: string;
  reason: string;
  model: string;
  basedOn: string[];
  transform?: DerivationTransform;
  intervention: number; // 0 = conservative, 1 = new visual direction
}
function candidate(hex: string, model: string, reason: string, basedOn: string[] = [], transform?: DerivationTransform, intervention = 0): Candidate {
  return { hex, model, reason, basedOn, transform, intervention };
}
function dedupeCandidates(xs: Candidate[]): Candidate[] {
  const seen = new Set<string>();
  return xs.filter((x) => { if (seen.has(x.hex)) return false; seen.add(x.hex); return true; });
}
function neutralUndertone(analysis: SourceAnalysis, roles: Roles): number {
  const primary = roles.primary ? rgbToOklch(roles.primary.hex) : analysis.primaryCandidate?.o;
  // Opposing hues can cancel mathematically. In that case anchor neutrals to primary intent.
  return analysis.concentration > 0.36 ? analysis.undertoneH : (primary?.H ?? analysis.undertoneH);
}
function transformFrom(baseHex: string, opts: { dh?: number; dL?: number; cScale?: number; C?: number; L?: number }): string {
  const o = rgbToOklch(baseHex);
  return oklchToHex(opts.L ?? clamp01(o.L + (opts.dL ?? 0)), opts.C ?? Math.max(0.015, o.C * (opts.cScale ?? 1)), o.H + (opts.dh ?? 0));
}
function transformMeta(base: string, hex: string): DerivationTransform {
  const a = rgbToOklch(base), b = rgbToOklch(hex);
  let signedHue = ((b.H - a.H + 540) % 360) - 180;
  if (Math.abs(signedHue) < 0.05) signedHue = 0;
  return {
    deltaHue: Number(signedHue.toFixed(1)),
    deltaLightness: Number((b.L - a.L).toFixed(3)),
    chromaScale: a.C > 0.001 ? Number((b.C / a.C).toFixed(2)) : undefined,
    targetLightness: Number(b.L.toFixed(3)),
    targetChroma: Number(b.C.toFixed(3)),
  };
}

function genLightPool(analysis: SourceAnalysis, roles: Roles): Candidate[] {
  const H = neutralUndertone(analysis, roles), baseC = Math.max(0.004, Math.min(0.014, analysis.avgC * 0.075));
  const bases = analysis.chrom.map((x) => x.hex);
  const out: Candidate[] = [];
  for (const L of [0.982, 0.970, 0.958, 0.990]) for (const C of [baseC, 0.005, 0.010]) {
    const hex = oklchToHex(L, C, H);
    out.push(candidate(hex, 'Matched surface', 'Near-white surface with a restrained undertone borrowed from the source palette.', bases, { targetLightness: L, targetChroma: C, undertoneHue: H }, 0.02));
  }
  return dedupeCandidates(out).slice(0, 10);
}
function genDarkPool(analysis: SourceAnalysis, roles: Roles): Candidate[] {
  const H = neutralUndertone(analysis, roles), baseC = Math.max(0.005, Math.min(0.018, analysis.avgC * 0.10));
  const bases = analysis.chrom.map((x) => x.hex);
  const out: Candidate[] = [];
  for (const L of [0.04, 0.06, 0.08, 0.10, 0.13, 0.15, 0.17, 0.19, 0.22, 0.25, 0.28]) for (const C of [baseC, 0.007, 0.014]) {
    const hex = oklchToHex(L, C, H);
    out.push(candidate(hex, 'Matched ink', 'Near-black ink anchor with the same restrained palette undertone.', bases, { targetLightness: L, targetChroma: C, undertoneHue: H }, 0.02));
  }
  return dedupeCandidates(out).slice(0, 12);
}
function genPrimaryPool(analysis: SourceAnalysis): Candidate[] {
  const H = analysis.primaryCandidate?.o.H ?? analysis.undertoneH ?? 255;
  const C = Math.max(0.075, Math.min(0.15, analysis.avgC || 0.10));
  return [0.58, 0.64, 0.52].map((L) => candidate(
    oklchToHex(L, C, H), 'Undertone anchor',
    'A brand anchor is synthesized only because no supplied color can act as a chromatic primary.',
    analysis.src.map((x) => x.hex), { targetLightness: L, targetChroma: C, undertoneHue: H }, 0.12,
  ));
}
function genSecondaryPool(analysis: SourceAnalysis, roles: Roles): Candidate[] {
  const base = roles.primary?.hex;
  if (!base) return genPrimaryPool(analysis);
  const o = rgbToOklch(base), out: Candidate[] = [];
  const tonal = analysis.relationship === 'monochrome' || analysis.relationship === 'single';

  // First: low-intervention tonal partners. These keep a single-hue palette recognizably itself.
  for (const dL of [-0.18, 0.16, -0.12, 0.11]) {
    const hex = transformFrom(base, { dL, cScale: 0.82 });
    out.push(candidate(hex, 'Tonal partner', 'Same hue family with a deliberate lightness step for supporting hierarchy.', [base], transformMeta(base, hex), 0.03));
  }

  // Second: analogous partners. Useful for a true single source, but still close to brand intent.
  const rotations = tonal ? [24, -24, 30, -30] : [18, -18, 28, -28, 36, -36];
  for (const r of rotations) for (const dL of [0, -0.06, 0.06]) {
    const hex = oklchToHex(clamp01(o.L + dL), Math.max(0.065, Math.min(0.19, o.C * 0.90)), o.H + r);
    out.push(candidate(hex, 'Analogous support', `Supporting hue shifted ${Math.abs(r)}° while keeping tone and chroma close to the primary.`, [base], transformMeta(base, hex), 0.12 + Math.abs(r) / 240));
  }
  return dedupeCandidates(out).slice(0, 18);
}
function generatedAccentMudPenalty(hex: string): number {
  const o = rgbToOklch(hex);
  // Mid/dark yellow-green colors with restrained chroma are where generated accents
  // most often read as olive, khaki or brown rather than a deliberate CTA color.
  const warmYellowGreen = o.H >= 62 && o.H <= 138;
  if (!warmYellowGreen) return 0;
  const midDark = clamp01((0.66 - o.L) / 0.24);
  const lowChroma = clamp01((0.17 - o.C) / 0.09);
  return clamp01(midDark * lowChroma);
}

function tonalAccentCandidates(base: string, label: string): Candidate[] {
  const o = rgbToOklch(base), out: Candidate[] = [];
  const isWarmYellow = o.H >= 62 && o.H <= 112;
  // Warm yellows turn muddy surprisingly quickly when darkened. For those hues we
  // bias tonal candidates toward brighter, cleaner action values instead of brown/olive.
  const targetLs = isWarmYellow
    ? [0.66, 0.61, 0.57]
    : o.L >= 0.60
      ? [Math.max(0.46, o.L - 0.18), Math.max(0.52, o.L - 0.12), 0.58, 0.64]
      : [Math.min(0.76, o.L + 0.22), Math.min(0.72, o.L + 0.16), 0.60, 0.52, 0.44];
  const hueSteps = isWarmYellow ? [-14, -22, -30, -38] : [0, 6, -6, 12, -12];
  for (const L of targetLs) for (const dh of hueSteps) {
    const C = Math.max(isWarmYellow ? 0.17 : 0.105, Math.min(0.235, o.C * 1.10 + 0.012));
    const hex = oklchToHex(clamp01(L), C, o.H + dh);
    if (generatedAccentMudPenalty(hex) > 0.58) continue;
    out.push(candidate(hex, label, 'A brand-close action color that changes tone and chroma before introducing a new hue family.', [base], transformMeta(base, hex), 0.04 + Math.abs(dh) / 260));
  }
  return out;
}

function contrastAccentCandidates(base: string, strength: 'balanced' | 'bold'): Candidate[] {
  const o = rgbToOklch(base), out: Candidate[] = [];
  const rotations = strength === 'balanced'
    ? [42, -42, 58, -58, 96, -96]
    : [118, -118, 137.5, -137.5, 160, -160, 180];
  const targetLs = strength === 'balanced' ? [0.58, 0.64, 0.52] : [0.56, 0.62, 0.48];
  for (const r of rotations) for (const L of targetLs) {
    const C = Math.max(0.145, Math.min(0.245, Math.max(o.C * 1.04, 0.16)));
    const hex = oklchToHex(L, C, o.H + r);
    if (generatedAccentMudPenalty(hex) > 0.70) continue;
    out.push(candidate(
      hex,
      strength === 'balanced' ? 'Balanced contrast' : 'Bold contrast',
      strength === 'balanced'
        ? 'Moves far enough from the brand hues to create a clean action signal while staying visually related.'
        : 'Uses a stronger hue separation when a brand-close accent would look muddy or fail to create enough emphasis.',
      [base],
      transformMeta(base, hex),
      strength === 'balanced' ? 0.26 + Math.abs(r) / 720 : 0.46 + Math.abs(r) / 900,
    ));
  }
  return out;
}

function genAccentPool(analysis: SourceAnalysis, roles: Roles): Candidate[] {
  const primary = roles.primary?.hex, secondary = roles.secondary?.hex || primary;
  if (!primary) return [];
  const out: Candidate[] = [];

  // Accent generation now deliberately explores three lanes: brand-close, balanced
  // contrast and bold contrast. Tone-before-hue remains the first preference, but
  // it is no longer allowed to trap warm palettes in olive/brown action colors.
  const bases = [...new Set([secondary, primary].filter(Boolean) as string[])];
  bases.forEach((base) => {
    out.push(...tonalAccentCandidates(base, 'Brand-close action'));
    out.push(...contrastAccentCandidates(base, 'balanced'));
    out.push(...contrastAccentCandidates(base, 'bold'));
  });

  return dedupeCandidates(out).slice(0, 72);
}

function candidatesFor(role: Role, analysis: SourceAnalysis, roles: Roles): Candidate[] {
  if (role === 'light') return genLightPool(analysis, roles);
  if (role === 'dark') return genDarkPool(analysis, roles);
  if (role === 'primary') return genPrimaryPool(analysis);
  if (role === 'secondary') return genSecondaryPool(analysis, roles);
  return genAccentPool(analysis, roles);
}

function asItems(roles: Roles): Swatch[] {
  return ROLE_ORDER.filter((r) => roles[r]).map((r) => ({
    role: r, hex: roles[r]!.hex, source: roles[r]!.source, sourceOrder: roles[r]!.sourceIndex,
    name: '', group: '',
  }));
}
function cloneRoles(roles: Roles): Roles {
  return Object.fromEntries(ROLE_ORDER.map((r) => [r, roles[r] ? { ...roles[r]! } : null])) as Roles;
}
function nearestSourceStats(hex: string, analysis: SourceAnalysis) {
  if (!analysis.src.length) return { de: 0, hue: 0 };
  const o = rgbToOklch(hex);
  let de = Infinity, hue = Infinity;
  for (const s of analysis.src) {
    de = Math.min(de, deltaEOK(hex, s.hex));
    if (s.cls === 'chromatic') hue = Math.min(hue, hueDist(o.H, s.o.H));
  }
  return { de: Number(de.toFixed(3)), hue: Number((Number.isFinite(hue) ? hue : 0).toFixed(1)) };
}
function generatedHueNovelty(roles: Roles, analysis: SourceAnalysis): number {
  const srcH = analysis.chrom.map((x) => x.o.H);
  if (!srcH.length) return 0;
  let sum = 0, n = 0;
  for (const r of ['primary', 'secondary', 'accent'] as Role[]) {
    const x = roles[r]; if (!x || x.source) continue;
    const h = rgbToOklch(x.hex).H;
    const nearest = Math.min(...srcH.map((sourceH) => hueDist(h, sourceH)));
    // A generated Accent is allowed to introduce a new hue when that creates a cleaner
    // action signal. Primary and Secondary remain much more conservative.
    const weight = r === 'accent' ? 0.32 : 0.90;
    sum += nearest * weight; n += weight;
  }
  return n ? sum / n : 0;
}
function relationshipScore(roles: Roles, analysis: SourceAnalysis): number {
  const p = roles.primary && rgbToOklch(roles.primary.hex);
  const s = roles.secondary && rgbToOklch(roles.secondary.hex);
  const a = roles.accent && rgbToOklch(roles.accent.hex);
  if (!p) return 0.5;
  let secondaryScore = 0.6, accentScore = 0.6;
  if (s) {
    const d = hueDist(p.H, s.H);
    if (['single', 'monochrome', 'analogous'].includes(analysis.relationship)) secondaryScore = Math.max(gauss(d, 0, 18), gauss(d, 28, 24));
    else secondaryScore = 0.65 + 0.35 * clamp01(deltaEOK(roles.primary!.hex, roles.secondary!.hex) / 0.18);
  }
  if (a) {
    const sourceH = analysis.chrom.map((x) => x.o.H);
    const nearest = sourceH.length ? Math.min(...sourceH.map((h) => hueDist(a.H, h))) : hueDist(a.H, p.H);
    // Accent may stay close, sit in a balanced contrast band, or deliberately move
    // farther away. We reward all three useful lanes instead of assuming nearest = best.
    accentScore = Math.max(
      0.86 * gauss(nearest, 0, 18),
      0.96 * gauss(nearest, 48, 30),
      gauss(nearest, 118, 46),
      0.90 * gauss(nearest, 174, 25),
    );
  }
  return clamp01(0.48 * secondaryScore + 0.52 * accentScore);
}
function objectiveBreakdown(roles: Roles, analysis: SourceAnalysis, candidateIntervention = 0): ObjectiveBreakdown {
  const items = asItems(roles), m: Partial<Record<Role, string>> = {};
  items.forEach((x) => (m[x.role] = x.hex));
  const p = pairings(m);
  const light = roles.light ? roleFit(roles.light.hex, 'light') : 0;
  const dark = roles.dark ? roleFit(roles.dark.hex, 'dark') : 0;
  const acc = roles.accent ? accentQuality(items) : 0.35;
  const tonal = tonalQuality(items), sep = separationQuality(items), rel = relationshipScore(roles, analysis);
  const complete = ROLE_ORDER.filter((r) => roles[r]).length / 5;
  const novelty = generatedHueNovelty(roles, analysis);
  const hueEconomy = clamp01(1 - novelty / 58) * (1 - 0.45 * candidateIntervention);
  const neutralFitness = ([roles.light ? light : null, roles.dark ? dark : null].filter((x): x is number => x != null).reduce((a, b) => a + b, 0) / ([roles.light, roles.dark].filter(Boolean).length || 1));
  const pairCount = accessiblePairCount(items, 4.5);
  const accentUI = roles.accent && roles.light ? contrast(roles.accent.hex, roles.light.hex) : 0;
  const generatedAccentGate = roles.accent ? (acc >= 0.62 && accentUI >= 3) : false;
  const parts = {
    contrastProgress: p.progress,
    functionalPasses: p.passed / p.total,
    accessiblePairs: clamp01(pairCount / 4),
    completeness: complete,
    neutralFitness,
    accentUtility: acc,
    tonalHierarchy: tonal,
    separation: sep,
    relationshipPreservation: rel,
    hueEconomy,
  };
  const total =
    25 * parts.contrastProgress +
    8 * parts.functionalPasses +
    13 * parts.accessiblePairs +
    10 * parts.completeness +
    10 * parts.neutralFitness +
    19 * parts.accentUtility +
    8 * parts.tonalHierarchy +
    6 * parts.separation +
    9 * parts.relationshipPreservation +
    5 * parts.hueEconomy +
    (pairCount >= 4 ? 8 : 0) +
    (generatedAccentGate ? 7 : 0) +
    (p.passed >= 4 ? 4 : 0);
  return { ...parts, total };
}
function paletteObjective(roles: Roles, analysis: SourceAnalysis, candidateIntervention = 0): number {
  return objectiveBreakdown(roles, analysis, candidateIntervention).total;
}

interface BeamMeta { candidate: Candidate; candidateScore?: number; }
interface BeamState { roles: Roles; score: number; meta: Partial<Record<Role, BeamMeta>>; }

export interface BuiltPalette {
  items: Swatch[];
  meta: Partial<Record<Role, ColorDerivation>> & { relationship?: string };
  ctx: PaletteContext;
  objective: number;
  breakdown: ObjectiveBreakdown;
}

function sourceRoleWhy(role: Role, analysis: SourceAnalysis, sourceIndex?: number): string {
  const item = sourceIndex != null ? analysis.src[sourceIndex] : undefined;
  if (role === 'light') return 'Recognized as a structural light neutral because its OKLCH lightness is high and chroma is sufficiently low.';
  if (role === 'dark') return 'Recognized as a structural dark neutral because its OKLCH lightness is low and chroma is sufficiently restrained.';
  if (role === 'primary') return 'Protected as the primary brand anchor because it is the earliest non-neutral source in your selection order.';
  if (role === 'secondary') return 'Protected as supporting brand color because it is the next non-neutral source in your selection order.';
  if (role === 'accent') return 'Protected as your supplied accent decision rather than being overwritten by the solver.';
  return item ? 'Protected user selection.' : 'Protected source.';
}
function roleWhy(role: Role): string {
  return ({
    primary: 'Creates the main brand surface and establishes the visual anchor.',
    secondary: 'Creates supporting hierarchy without competing with the primary.',
    light: 'Provides page/card surfaces and a predictable background for dark text.',
    dark: 'Provides body text, dark surfaces and the strongest contrast anchor.',
    accent: 'Creates action emphasis for CTAs, controls and highlights.',
  } as Record<Role, string>)[role];
}
function derivationFor(role: Role, roles: Roles, analysis: SourceAnalysis, meta: BeamMeta | undefined, score: number, alternatives: Array<{ hex: string; model: string; score: number }> = []): ColorDerivation {
  const rc = roles[role]!;
  const stats = nearestSourceStats(rc.hex, analysis);
  const light = roles.light?.hex;
  const evidence = {
    roleFit: Number(roleFit(rc.hex, role).toFixed(3)),
    bestTextContrast: Number(Math.max(contrast(rc.hex, '#111318'), contrast(rc.hex, '#FFFFFF')).toFixed(2)),
    uiContrast: light && role !== 'light' ? Number(contrast(rc.hex, light).toFixed(2)) : undefined,
    nearestSourceDeltaE: stats.de,
    nearestSourceHue: stats.hue,
    candidateScore: Number(score.toFixed(2)),
  };
  if (rc.source) return {
    kind: 'source', strategy: 'Protected source', summary: 'Kept exactly as selected — no hue, chroma or lightness mutation.',
    roleWhy: sourceRoleWhy(role, analysis, rc.sourceIndex), basedOn: [rc.hex], evidence,
  };
  const c = meta?.candidate;
  return {
    kind: 'generated', strategy: c?.model || 'Generated role', summary: c?.reason || 'Generated to complete the missing functional role.',
    roleWhy: roleWhy(role), basedOn: c?.basedOn || analysis.src.map((x) => x.hex), transform: c?.transform, evidence,
    alternatives: alternatives.slice(0, 3),
  };
}

export function buildPalette(sources: string[], lockedRoles: Partial<Record<Role, string>> = {}): BuiltPalette {
  const ctx = context(sources, lockedRoles);
  const seed = cloneRoles(ctx.roles);
  let beam: BeamState[] = [{ roles: seed, score: paletteObjective(seed, ctx.analysis), meta: {} }];
  const order = (['primary', 'light', 'dark', 'secondary', 'accent'] as Role[]).filter((r) => !seed[r]);
  for (const role of order) {
    const next: BeamState[] = [];
    for (const state of beam) {
      const pool = candidatesFor(role, ctx.analysis, state.roles);
      for (const c of pool) {
        const roles = cloneRoles(state.roles);
        roles[role] = { hex: c.hex, source: false };
        const score = paletteObjective(roles, ctx.analysis, c.intervention);
        next.push({ roles, score, meta: { ...state.meta, [role]: { candidate: c, candidateScore: score } } });
      }
    }
    next.sort((a, b) => b.score - a.score);
    beam = next.slice(0, 42);
    if (!beam.length) break;
  }
  const best = (beam.length ? beam : [{ roles: seed, score: paletteObjective(seed, ctx.analysis), meta: {} }]).sort((a, b) => b.score - a.score)[0];
  const breakdown = objectiveBreakdown(best.roles, ctx.analysis);

  // Re-score top alternatives in the context of the final system for explainability.
  const derivations = {} as Partial<Record<Role, ColorDerivation>>;
  for (const role of ROLE_ORDER) {
    if (!best.roles[role]) continue;
    const alts = !best.roles[role]!.source
      ? candidatesFor(role, ctx.analysis, best.roles)
          .filter((c) => c.hex !== best.roles[role]!.hex)
          .map((c) => {
            const r = cloneRoles(best.roles); r[role] = { hex: c.hex, source: false };
            return { hex: c.hex, model: c.model, score: paletteObjective(r, ctx.analysis, c.intervention) };
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
      : [];
    derivations[role] = derivationFor(role, best.roles, ctx.analysis, best.meta[role], best.score, alts);
  }

  const items = asItems(best.roles).map((item) => ({ ...item, derivation: derivations[item.role] }));
  return {
    items,
    meta: ({ ...derivations, relationship: ctx.analysis.label } as BuiltPalette['meta']),
    ctx,
    objective: best.score,
    breakdown,
  };
}

/** Ranked suggestions are evaluated inside a completed palette, not in isolation. */
function scoreForcedCandidate(role: Role, c: Candidate, ctx: PaletteContext): number {
  const seed = cloneRoles(ctx.roles);
  seed[role] = { hex: c.hex, source: false };
  let beam: BeamState[] = [{ roles: seed, score: paletteObjective(seed, ctx.analysis, c.intervention), meta: {} }];
  const order = (['primary', 'light', 'dark', 'secondary', 'accent'] as Role[]).filter((r) => !seed[r]);
  for (const missing of order) {
    const next: BeamState[] = [];
    for (const state of beam) {
      for (const candidateItem of candidatesFor(missing, ctx.analysis, state.roles)) {
        const roles = cloneRoles(state.roles);
        roles[missing] = { hex: candidateItem.hex, source: false };
        next.push({ roles, score: paletteObjective(roles, ctx.analysis, candidateItem.intervention), meta: {} });
      }
    }
    next.sort((a, b) => b.score - a.score);
    beam = next.slice(0, 22);
    if (!beam.length) break;
  }
  return Math.max(...beam.map((x) => x.score), paletteObjective(seed, ctx.analysis, c.intervention));
}

export function optionsFor(role: Role, ctx: PaletteContext): HarmonyOption[] {
  const raw = candidatesFor(role, ctx.analysis, ctx.roles);
  const scored = raw.map((c) => ({ c, score: scoreForcedCandidate(role, c, ctx) })).sort((a, b) => b.score - a.score);
  const toOption = ({ c, score }: { c: Candidate; score: number }): HarmonyOption => ({
    hex: c.hex, model: c.model, reason: c.reason, fidelity: fidelity(c.hex, ctx), role, score, basedOn: c.basedOn, transform: c.transform,
  });

  if (role === 'accent') {
    const lane = (model: string) => model.includes('Balanced') ? 'balanced' : model.includes('Bold') ? 'bold' : 'close';
    const picked: HarmonyOption[] = [];
    const pickedLanes = new Set<string>();
    // Start with the objectively strongest option, then deliberately add the best
    // candidates from the other strategy lanes. This exposes more of the color wheel
    // without asking the user to understand harmony math.
    if (scored[0]) { picked.push(toOption(scored[0])); pickedLanes.add(lane(scored[0].c.model)); }
    for (const targetLane of ['close', 'balanced', 'bold']) {
      if (pickedLanes.has(targetLane)) continue;
      const hit = scored.find(({ c }) => lane(c.model) === targetLane && !picked.some((p) => deltaEOK(p.hex, c.hex) < 0.045) && !picked.some((p) => hueDist(rgbToOklch(p.hex).H, rgbToOklch(c.hex).H) < 22));
      if (hit) { picked.push(toOption(hit)); pickedLanes.add(targetLane); }
      if (picked.length >= 3) break;
    }
    for (const hit of scored) {
      if (picked.length >= 3) break;
      if (picked.some((p) => deltaEOK(p.hex, hit.c.hex) < 0.04)) continue;
      if (picked.some((p) => hueDist(rgbToOklch(p.hex).H, rgbToOklch(hit.c.hex).H) < 20)) continue;
      picked.push(toOption(hit));
    }
    return picked.slice(0, 3);
  }

  const picked: HarmonyOption[] = [];
  for (const hit of scored) {
    if (picked.some((p) => deltaEOK(p.hex, hit.c.hex) < 0.025)) continue;
    picked.push(toOption(hit));
    if (picked.length >= 3) break;
  }
  return picked;
}

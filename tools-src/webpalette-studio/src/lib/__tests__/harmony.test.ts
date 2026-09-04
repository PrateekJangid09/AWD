import { describe, it, expect } from 'vitest';
import { buildPalette, context, optionsFor, analyzeSources } from '../harmony';
import { isHealthy } from '../scoring';
import { rgbToOklch, deltaEOK, hueDist } from '../color';
import { COLOR_LIBRARY } from '../colorLibrary';
import { ROLE_ORDER } from '../types';

const lib = COLOR_LIBRARY.map((c) => c.hex);

describe('relationship-aware engine — structural guarantees', () => {
  it('reaches a healthy five-role system for every single library color', () => {
    let fails = 0;
    for (const hex of lib) if (!isHealthy(buildPalette([hex]).items)) fails++;
    expect(fails).toBe(0);
  });

  it('reaches health 100 for canonical examples', () => {
    for (const src of [['#FFFD74', '#75BBFD'], ['#CFFF04', '#632DE9'], ['#0047AB', '#F97306', '#02AB2E']]) {
      expect(isHealthy(buildPalette(src).items)).toBe(true);
    }
  });

  it('preserves user source colors unchanged', () => {
    const src = ['#FFFD74', '#75BBFD'];
    const { items } = buildPalette(src);
    for (const s of src) expect(items.some((i) => i.hex === s && i.source)).toBe(true);
  });

  it('does not lie when protected 3-color sources make a perfect score impossible', () => {
    // The contract is source preservation first. We guarantee completion, not arbitrary
    // mutation of the user's colors just to force a 100 score.
    const samples = [
      ['#7E1E9C', '#CEB301', '#029386'],
      ['#CFFF04', '#632DE9', '#FF028D'],
      ['#0047AB', '#F97306', '#02AB2E'],
    ];
    for (const src of samples) {
      const { items } = buildPalette(src);
      expect(items).toHaveLength(5);
      expect(new Set(items.map((i) => i.role)).size).toBe(5);
      for (const s of src) expect(items.some((i) => i.hex === s && i.source)).toBe(true);
    }
  });
});

describe('relationship-aware engine — color intelligence', () => {
  it('recognizes near-complementary sources', () => {
    expect(analyzeSources(['#CFFF04', '#632DE9']).relationship).toBe('complementary');
  });

  it('offers brand-close, balanced and bold accent directions', () => {
    const src = ['#CFFF04', '#632DE9'];
    const a = analyzeSources(src);
    const opts = optionsFor('accent', context(src));
    expect(a.relationship).toBe('complementary');
    expect(opts).toHaveLength(3);
    expect(opts.some((o) => /Brand-close/i.test(o.model))).toBe(true);
    expect(opts.some((o) => /Balanced/i.test(o.model))).toBe(true);
    expect(opts.some((o) => /Bold/i.test(o.model))).toBe(true);
  });

  it('offers >= 2 options for every missing role', () => {
    for (const src of [['#0047AB'], ['#FFFD74', '#75BBFD'], ['#029386', '#CEB301']]) {
      const ctx = context(src);
      for (const r of ROLE_ORDER) {
        if (ctx.roles[r]) continue;
        expect(optionsFor(r, ctx).length).toBeGreaterThanOrEqual(2);
      }
    }
  });



  it('lets a single-hue system explore beyond a narrow tonal wedge', () => {
    const src = ['#6C63FF', '#FFF6F1'];
    const opts = optionsFor('accent', context(src));
    const sourceHue = rgbToOklch('#6C63FF').H;
    const hueDistances = opts.map((o) => hueDist(rgbToOklch(o.hex).H, sourceHue));
    expect(opts).toHaveLength(3);
    expect(Math.min(...hueDistances)).toBeLessThan(20);
    expect(Math.max(...hueDistances)).toBeGreaterThan(45);
  });


  it('honors a user-locked suggested role exactly on subsequent fixes', () => {
    const base = ['#6C63FF'];
    const suggested = optionsFor('accent', context(base))[0];
    expect(suggested).toBeTruthy();
    const lockedHex = suggested.hex;
    const built = buildPalette([...base, lockedHex], { accent: lockedHex });
    const accent = built.items.find((i) => i.role === 'accent');
    expect(accent?.hex).toBe(lockedHex);
    expect(accent?.source).toBe(true);
    expect(built.items).toHaveLength(5);
    expect(new Set(built.items.map((i) => i.role)).size).toBe(5);
  });

  it('returns derivation evidence for every role after repair', () => {
    const built = buildPalette(['#6C63FF', '#FFF6F1']);
    expect(built.items).toHaveLength(5);
    for (const item of built.items) {
      expect(item.derivation).toBeTruthy();
      expect(item.derivation?.summary.length).toBeGreaterThan(10);
      expect(item.derivation?.evidence.roleFit).toBeGreaterThanOrEqual(0);
    }
  });

  it('does not generate olive/brown accents from golden-yellow secondary colors', () => {
    const primaries = ['#0F172A', '#1E3A8A', '#3389F9', '#6C63FF', '#A23B72', '#0F766E'];
    const yellows = ['#D4AF37', '#FFD700', '#F4C430', '#EAB308'];
    const isMuddyWarmAccent = (hex: string) => {
      const o = rgbToOklch(hex);
      return o.H >= 62 && o.H <= 138 && o.L < 0.66 && o.C < 0.17;
    };
    for (const yellow of yellows) for (const primary of primaries) {
      const built = buildPalette([primary, yellow]);
      const accent = built.items.find((i) => i.role === 'accent')!;
      expect(isMuddyWarmAccent(accent.hex)).toBe(false);
    }
  });

  it('keeps suggested options perceptually distinct', () => {
    const opts = optionsFor('accent', context(['#0047AB']));
    for (let i = 0; i < opts.length; i++) for (let j = i + 1; j < opts.length; j++) {
      expect(deltaEOK(opts[i].hex, opts[j].hex)).toBeGreaterThan(0.02);
    }
  });
});

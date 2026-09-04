import { describe, it, expect } from 'vitest';
import { hexToRgb, rgbToHex, contrast, oklchToHex, rgbToOklch, normalizeHex, bestText, resolveOnSurface } from '../color';

describe('color science', () => {
  it('round-trips hex/rgb', () => {
    expect(rgbToHex(...Object.values(hexToRgb('#3C6E71')) as [number, number, number])).toBe('#3C6E71');
  });
  it('contrast is symmetric and known', () => {
    expect(contrast('#000000', '#FFFFFF')).toBeCloseTo(21, 0);
    expect(contrast('#FFFFFF', '#000000')).toBeCloseTo(21, 0);
  });
  it('oklch->hex stays in gamut', () => {
    for (let h = 0; h < 360; h += 30) {
      const hex = oklchToHex(0.6, 0.3, h); // high chroma forces gamut mapping
      expect(/^#[0-9A-F]{6}$/.test(hex)).toBe(true);
    }
  });
  it('bestText picks readable color', () => {
    expect(contrast('#FFFD74', bestText('#FFFD74'))).toBeGreaterThan(4.5);
    expect(contrast('#25282D', bestText('#25282D'))).toBeGreaterThan(4.5);
  });
  it('normalizeHex handles shorthand and missing hash', () => {
    expect(normalizeHex('fff')).toBe('#FFFFFF');
    expect(normalizeHex('#abc')).toBe('#AABBCC');
    expect(normalizeHex('nope')).toBeNull();
  });
  it('rgbToOklch lightness ordering', () => {
    expect(rgbToOklch('#FFFFFF').L).toBeGreaterThan(rgbToOklch('#000000').L);
  });
  it('semantic on-surface resolver respects visual polarity for display text', () => {
    const purple = resolveOnSurface('#6C63FF', '#F2FFE0', '#030305', 'display');
    expect(purple.color).toBe('#F2FFE0');
    expect(purple.ratio).toBeGreaterThanOrEqual(3);

    const pale = resolveOnSurface('#F2FFE0', '#F2FFE0', '#030305', 'display');
    expect(pale.color).toBe('#030305');
  });

  it('normal body text remains accessibility-first even when display polarity differs', () => {
    const display = resolveOnSurface('#6C63FF', '#F2FFE0', '#030305', 'display');
    const body = resolveOnSurface('#6C63FF', '#F2FFE0', '#030305', 'body');
    expect(display.color).toBe('#F2FFE0');
    expect(body.color).toBe('#030305');
    expect(body.ratio).toBeGreaterThanOrEqual(4.5);
  });

});

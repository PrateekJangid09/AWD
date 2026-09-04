import { rgbToOklab, OKLab, normalizeHex } from './color';
import { COLOR_LIBRARY, NamedColor } from './colorLibrary';

const GROUP_PRIORITY: Record<string, number> = { 'Designer Curated': 0, 'Common Name': 1, 'CSS Standard': 2 };

interface IndexedColor extends NamedColor { lit: string; norm: string; ok: OKLab; }
const INDEX: IndexedColor[] = COLOR_LIBRARY.map((c) => ({
  ...c,
  lit: c.name.toLowerCase(),
  norm: c.name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(),
  ok: rgbToOklab(c.hex),
}));

export function exactNamed(hex: string): NamedColor | null {
  const h = normalizeHex(hex);
  if (!h) return null;
  const hits = INDEX.filter((c) => c.hex.toUpperCase() === h);
  hits.sort((a, b) => (GROUP_PRIORITY[a.group] ?? 9) - (GROUP_PRIORITY[b.group] ?? 9));
  return hits[0] ?? null;
}
export function nearestNamed(hex: string): NamedColor & { distance: number } {
  const A = rgbToOklab(hex);
  let best = INDEX[0], bd = Infinity;
  for (const c of INDEX) {
    const d = Math.hypot(A.L - c.ok.L, A.a - c.ok.a, A.b - c.ok.b);
    if (d < bd) { bd = d; best = c; }
  }
  return { name: best.name, hex: best.hex, group: best.group, distance: bd };
}
export function displayName(hex: string, preferred?: { name: string; group: string } | null) {
  if (preferred) return { name: preferred.name, group: preferred.group, exact: true };
  const ex = exactNamed(hex);
  if (ex) return { name: ex.name, group: ex.group, exact: true };
  const n = nearestNamed(hex);
  return { name: n.name, group: n.group, exact: false };
}
export function searchNamed(q: string, limit = 9): NamedColor[] {
  const query = String(q || '').trim().toLowerCase();
  if (!query) return [];
  const norm = query.replace(/[^a-z0-9]+/g, ' ').trim();
  return INDEX.map((c) => {
    let r = 99;
    if (c.lit === query) r = 0;
    else if (c.norm === norm) r = 1;
    else if (c.lit.startsWith(query)) r = 2;
    else if (c.norm.startsWith(norm)) r = 3;
    else if (c.lit.includes(query)) r = 4;
    else if (c.norm.includes(norm)) r = 5;
    return { c, r };
  })
    .filter((x) => x.r < 99)
    .sort((a, b) =>
      a.r - b.r ||
      (GROUP_PRIORITY[a.c.group] ?? 9) - (GROUP_PRIORITY[b.c.group] ?? 9) ||
      a.c.name.localeCompare(b.c.name),
    )
    .slice(0, limit)
    .map((x) => ({ name: x.c.name, hex: x.c.hex, group: x.c.group }));
}

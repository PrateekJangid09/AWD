import { useEffect, useMemo, useState } from 'react';
import { Swatch, ROLE_ORDER, ROLE_LABEL, Role } from '../lib/types';
import { rgbToOklch } from '../lib/color';
import { analyzeSources } from '../lib/harmony';
import { PaletteContextPreview } from './PaletteContextPreview';

interface Props { items: Swatch[]; beforeItems?: Swatch[]; onClose: () => void; onCopyCss: () => void; }

function unique(items: Swatch[]) {
  const seen = new Set<string>();
  return items.filter((c) => { if (seen.has(c.hex)) return false; seen.add(c.hex); return true; });
}

function currentPalette(items: Swatch[]) {
  const complete = items.length === 5 && ROLE_ORDER.every((r) => items.some((c) => c.role === r));
  if (complete) {
    const mapped = {} as Record<Role, string>;
    items.forEach((c) => (mapped[c.role] = c.hex));
    return { mode: 'complete' as const, items: ROLE_ORDER.map((r) => items.find((c) => c.role === r)!), mapped };
  }

  // Honest current-state preview: no invisible buildPalette() call and no generated colors.
  const actual = unique(items);
  const lightest = [...actual].sort((a, b) => rgbToOklch(b.hex).L - rgbToOklch(a.hex).L)[0];
  const darkest = [...actual].sort((a, b) => rgbToOklch(a.hex).L - rgbToOklch(b.hex).L)[0];
  const byRole = (r: Role) => actual.find((c) => c.role === r);
  const primary = byRole('primary') ?? actual[0];
  const secondary = byRole('secondary') ?? actual[1] ?? actual[0];
  const accent = byRole('accent') ?? actual[2] ?? secondary;
  const light = byRole('light') ?? lightest;
  const dark = byRole('dark') ?? darkest;
  const mapped: Record<Role, string> = { primary: primary.hex, secondary: secondary.hex, accent: accent.hex, light: light.hex, dark: dark.hex };
  return { mode: 'partial' as const, items: actual, mapped };
}

export function WebsitePreview({ items, beforeItems, onClose, onCopyCss }: Props) {
  const hasComparison = Boolean(beforeItems?.length && items.length === 5 && ROLE_ORDER.every((r) => items.some((c) => c.role === r)));
  const [view, setView] = useState<'before' | 'after'>(hasComparison ? 'after' : 'before');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  useEffect(() => { setView(hasComparison ? 'after' : 'before'); }, [hasComparison]);

  const activeItems = view === 'before' && beforeItems?.length ? beforeItems : items;
  const palette = useMemo(() => currentPalette(activeItems), [activeItems]);
  const source = activeItems.filter((c) => c.source).sort((a,b)=>(a.sourceOrder??9999)-(b.sourceOrder??9999));
  const relation = analyzeSources((source.length ? source : activeItems).map((c) => c.hex)).label;
  const generated = items.filter((c) => !c.source).length;

  return (
    <div className="web" role="dialog" aria-modal="true" aria-label="Website palette preview">
      <div className="web-bar glass">
        <div className="web-left">
          <button className="btn ghost" onClick={onClose}>← Back</button>
          <div className="web-strip" aria-label="Colors used in this preview">
            {palette.items.map((c, i) => <span className="web-chip" key={`${c.hex}-${i}`}><i style={{ background: c.hex }} /><b>{palette.mode === 'complete' ? ROLE_LABEL[c.role] : `Color ${i+1}`}<small>{c.hex}</small></b></span>)}
          </div>
        </div>
        <div className="web-actions">
          {hasComparison && <div className="compare-toggle" role="group" aria-label="Before and after"><button className={view === 'before' ? 'on' : ''} onClick={() => setView('before')}>Before</button><button className={view === 'after' ? 'on' : ''} onClick={() => setView('after')}>After</button></div>}
          <span className={'preview-truth '+palette.mode}>
            {view === 'before' || palette.mode === 'partial'
              ? <><b>Current palette</b><small>No hidden colors · {relation}</small></>
              : <><b>Completed palette</b><small>{generated} supporting color{generated === 1 ? '' : 's'} generated</small></>}
          </span>
          <div className="device" role="group" aria-label="Preview device"><button aria-label="Desktop preview" className={device === 'desktop' ? 'on' : ''} onClick={() => setDevice('desktop')}>▱</button><button aria-label="Mobile preview" className={device === 'mobile' ? 'on' : ''} onClick={() => setDevice('mobile')}>▯</button></div>
          <button className="btn" onClick={onCopyCss}>Copy CSS</button>
        </div>
      </div>
      <div className="comparison-note"><strong>Same website. Different system.</strong><span>The layout, typography, content and spacing stay fixed. Only color-role mapping changes.</span></div>
      <div className="web-stage"><div className={'web-frame palette-context-frame ' + (device === 'mobile' ? 'mobile' : '')}><PaletteContextPreview palette={palette} /></div></div>
    </div>
  );
}

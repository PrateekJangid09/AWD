import { useEffect, useMemo, useRef, useState } from 'react';
import { ColorWheel, hsvToRgb, rgbToHsv, HSV } from './ColorWheel';
import { hexToRgb, rgbToHex, rgbToOklch, oklchToHex, normalizeHex, bestText } from '../lib/color';
import { displayName, searchNamed, exactNamed } from '../lib/names';
import { NamedColor } from '../lib/colorLibrary';

interface Props {
  open: boolean;
  editing: boolean;
  initialHex: string;
  recent: string[];
  onClose: () => void;
  onCommit: (hex: string, preferred: { name: string; group: string } | null) => void;
}

export function ColorStudio({ open, editing, initialHex, recent, onClose, onCommit }: Props) {
  const [hex, setHex] = useState(initialHex);
  const [hsv, setHsv] = useState<HSV>(() => { const { r, g, b } = hexToRgb(initialHex); return rgbToHsv(r, g, b); });
  const [preferred, setPreferred] = useState<{ name: string; group: string } | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NamedColor[]>([]);
  const [active, setActive] = useState(-1);
  const nativeRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const supportsEyeDropper = typeof window !== 'undefined' && 'EyeDropper' in window;

  // sync when (re)opened
  useEffect(() => {
    if (!open) return;
    const h = normalizeHex(initialHex) ?? '#6C63FF';
    setHex(h);
    const { r, g, b } = hexToRgb(h);
    setHsv(rgbToHsv(r, g, b));
    setPreferred(exactNamed(h) ? { name: exactNamed(h)!.name, group: exactNamed(h)!.group } : null);
    setQuery(''); setResults([]); setActive(-1);
    window.setTimeout(() => searchRef.current?.focus(), 20);
  }, [open, initialHex]);

  const applyHex = (h: string, keepPreferred = false) => {
    const n = normalizeHex(h); if (!n) return;
    setHex(n);
    const { r, g, b } = hexToRgb(n);
    setHsv(rgbToHsv(r, g, b));
    if (!keepPreferred) setPreferred(null);
  };
  const applyHsv = (h: number, s: number, v = hsv.v) => {
    const rgb = hsvToRgb(h, s, v);
    setHsv({ h, s, v });
    setHex(rgbToHex(rgb.r, rgb.g, rgb.b));
    setPreferred(null);
  };

  const { r, g, b } = hexToRgb(hex);
  const ok = rgbToOklch(hex);
  const dn = preferred ? { name: preferred.name, group: preferred.group, exact: true } : displayName(hex);
  const valHi = useMemo(() => { const p = hsvToRgb(hsv.h, 100, 100); return rgbToHex(p.r, p.g, p.b); }, [hsv.h]);

  const runSearch = (q: string) => {
    setQuery(q);
    const list = q.trim() ? searchNamed(q, 9) : [];
    setResults(list); setActive(-1);
  };
  const choose = (c: NamedColor) => {
    setPreferred({ name: c.name, group: c.group });
    setQuery(c.name);
    applyHex(c.hex, true);
    setResults([]);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const eyedrop = async () => {
    const EyeDropper = (window as unknown as { EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper;
    if (!EyeDropper) { nativeRef.current?.click(); return; }
    try { const { sRGBHex } = await new EyeDropper().open(); applyHex(sRGBHex); } catch { /* cancelled */ }
  };

  return (
    <>
      <div className={'backdrop' + (open ? ' open' : '')} onClick={onClose} />
      <aside className={'studio' + (open ? ' open' : '')} aria-hidden={!open} role="dialog" aria-modal="true" aria-label={editing ? 'Edit color' : 'Choose color'}>
        <div className="studio-head">
          <div><span className="section-kicker">COLOR STUDIO</span><b>{editing ? 'Edit color' : 'Choose color'}</b></div>
          <button className="close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="studio-body">
          <div className="preview-swatch" style={{ background: hex }}>
            <span className="pn" style={{ color: bestText(hex) === '#FFFFFF' ? '#111' : '#111' }}>
              {dn.name}{dn.exact ? '' : ' · closest'}
            </span>
          </div>

          <div className="name-lookup">
            <input
              ref={searchRef} className="name-inp" autoComplete="off" spellCheck={false}
              role="combobox" aria-autocomplete="list" aria-expanded={results.length > 0} aria-controls="color-name-results" aria-activedescendant={active >= 0 ? `color-result-${active}` : undefined}
              placeholder="Find a color by name — e.g. Sky Blue, Sage"
              value={query}
              onChange={(e) => runSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === ' ') return; // allow spaces
                if (e.key === 'Escape') { setResults([]); return; }
                if (e.key === 'Enter') { e.preventDefault(); const c = results[active >= 0 ? active : 0]; if (c) choose(c); return; }
                if (!results.length) return;
                if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(results.length - 1, a + 1)); }
                else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
              }}
            />
            <span className="ic">⌕</span>
            {results.length > 0 && (
              <div className="name-res" id="color-name-results" role="listbox">
                {results.map((c, i) => (
                  <button id={`color-result-${i}`} role="option" aria-selected={i === active} key={c.hex + c.name} className={'nr' + (i === active ? ' active' : '')} onClick={() => choose(c)}>
                    <i style={{ background: c.hex }} />
                    <span className="nm"><strong>{c.name}</strong><span>{c.hex}</span></span>
                    <span className="grp">{c.group}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="wheel-wrap">
            <ColorWheel hsv={hsv} onPick={(h, s) => applyHsv(h, s)} />
            <div className="wheel-side">
              <div className="rng">
                <label>Brightness <span>{Math.round(hsv.v)}%</span></label>
                <input
                  type="range" min={0} max={100} value={Math.round(hsv.v)}
                  style={{ background: `linear-gradient(90deg,#000,${valHi})` }}
                  onChange={(e) => applyHsv(hsv.h, hsv.s, +e.target.value)}
                />
              </div>
              <div className="tools">
                {supportsEyeDropper && <button onClick={eyedrop}>◎ Pick from screen</button>}
                <button onClick={() => nativeRef.current?.click()}>▦ Browser picker</button>
                <input ref={nativeRef} type="color" style={{ display: 'none' }} onChange={(e) => applyHex(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="fmt">
            <div className="row"><label htmlFor="color-hex">HEX</label>
              <input id="color-hex" aria-label="HEX color" value={hex} spellCheck={false} onChange={(e) => setHex(e.target.value)}
                onBlur={(e) => applyHex(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') applyHex((e.target as HTMLInputElement).value); }} />
            </div>
            <div className="row"><label>RGB</label>
              <div className="triple">
                {(['r', 'g', 'b'] as const).map((k, i) => (
                  <input key={k} aria-label={`RGB ${k.toUpperCase()}`} inputMode="numeric" value={[r, g, b][i]}
                    onChange={(e) => {
                      const vals = [r, g, b]; vals[i] = Math.max(0, Math.min(255, +e.target.value || 0));
                      applyHex(rgbToHex(vals[0], vals[1], vals[2]));
                    }} />
                ))}
              </div>
            </div>
            <div className="row"><label>OKLCH</label>
              <div className="triple">
                <input aria-label="OKLCH lightness" value={ok.L.toFixed(3)} onChange={(e) => applyHex(oklchToHex(+e.target.value || 0, ok.C, ok.H))} />
                <input aria-label="OKLCH chroma" value={ok.C.toFixed(3)} onChange={(e) => applyHex(oklchToHex(ok.L, +e.target.value || 0, ok.H))} />
                <input aria-label="OKLCH hue" value={Math.round(ok.H)} onChange={(e) => applyHex(oklchToHex(ok.L, ok.C, +e.target.value || 0))} />
              </div>
            </div>
          </div>

          <div className="recent">
            <div className="rt"><strong>Recent</strong></div>
            <div className="recent-colors">
              {recent.length === 0 && <span style={{ fontSize: 10, color: 'var(--faint)' }}>No recent colors yet</span>}
              {recent.map((h) => (
                <button key={h} className="rc" aria-label={`Use recent color ${h}`}  style={{ background: h }} title={h}
                  onClick={() => { const ex = exactNamed(h); setPreferred(ex ? { name: ex.name, group: ex.group } : null); applyHex(h, !!ex); }} />
              ))}
            </div>
          </div>
        </div>
        <div className="studio-foot">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn dark" onClick={() => onCommit(hex, preferred)}>{editing ? 'Save color' : 'Use color'}</button>
        </div>
      </aside>
    </>
  );
}

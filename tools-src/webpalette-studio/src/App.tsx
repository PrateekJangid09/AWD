import { useState, useMemo, useCallback, CSSProperties } from 'react';
import { usePalette } from './hooks/usePalette';
import { PaletteRow } from './components/PaletteRow';
import { HealthPanel } from './components/HealthPanel';
import { ContrastMatrix } from './components/ContrastMatrix';
import { AnalysisTab } from './components/AnalysisTab';
import { ColorStudio } from './components/ColorStudio';
import { WebsitePreview } from './components/WebsitePreview';
import { ProductContent } from './components/ProductContent';
import { Toast } from './components/Toast';
import { bestText } from './lib/color';
import { Role, Swatch } from './lib/types';

type Tab = 'analysis' | 'contrast' | 'preview';

const clonePalette = (items: Swatch[]) => items.map((item) => ({ ...item, derivation: item.derivation ? { ...item.derivation } : undefined }));

export default function App() {
  const p = usePalette();
  const [tab, setTab] = useState<Tab>('analysis');
  const [studio, setStudio] = useState<{ open: boolean; index: number; hex: string; editing: boolean }>({ open: false, index: 0, hex: '#6C63FF', editing: false });
  const [recent, setRecent] = useState<string[]>(() => {
    try {
      const current = window.localStorage.getItem('wps_recent');
      const legacy = window.localStorage.getItem('pf_recent');
      return JSON.parse(current || legacy || '[]');
    } catch { return []; }
  });
  const [webOpen, setWebOpen] = useState(false);
  const [beforePalette, setBeforePalette] = useState<Swatch[] | null>(null);
  const [toast, setToast] = useState('');

  const notify = useCallback((m: string) => { setToast(m); window.setTimeout(() => setToast(''), 1800); }, []);
  const remember = useCallback((hex: string) => {
    setRecent((prev) => {
      const next = [hex, ...prev.filter((x) => x !== hex)].slice(0, 10);
      try { window.localStorage.setItem('wps_recent', JSON.stringify(next)); } catch { /* storage blocked */ }
      return next;
    });
  }, []);

  const firstEmpty = () => { const i = p.slots.findIndex((x) => !x); return i < 0 ? 0 : i; };
  const openAdd = (index?: number) => setStudio({ open: true, index: index ?? firstEmpty(), hex: recent[0] || '#6C63FF', editing: false });
  const openEdit = (index: number, hex: string) => setStudio({ open: true, index, hex, editing: true });
  const explainRole = (role: Role) => {
    setTab('analysis');
    window.setTimeout(() => document.getElementById(`decision-${role}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 30);
  };

  const cssVars = useMemo(() => {
    const m: Partial<Record<Role, string>> = {};
    p.filled.forEach((c) => (m[c.role] = c.hex));
    const v: Record<string, string> = {};
    if (m.primary) { v['--primary'] = m.primary; v['--on-primary'] = bestText(m.primary); }
    if (m.secondary) { v['--secondary'] = m.secondary; v['--on-secondary'] = bestText(m.secondary); }
    if (m.accent) { v['--accent'] = m.accent; v['--on-accent'] = bestText(m.accent); }
    if (m.light) { v['--ln'] = m.light; v['--on-ln'] = bestText(m.light); }
    if (m.dark) { v['--dn'] = m.dark; v['--on-dark'] = bestText(m.dark); }
    return v as CSSProperties;
  }, [p.filled]);

  const paletteCss = useMemo(() => {
    const m: Partial<Record<Role, string>> = {};
    p.filled.forEach((c) => (m[c.role] = c.hex));
    const lines = [':root {'];
    const map: [string, Role][] = [
      ['--color-primary', 'primary'],
      ['--color-secondary', 'secondary'],
      ['--color-accent', 'accent'],
      ['--color-surface', 'light'],
      ['--color-ink', 'dark'],
    ];
    map.forEach(([k, r]) => { if (m[r]) lines.push(`  ${k}: ${m[r]};`); });
    map.forEach(([k, r]) => { if (m[r]) lines.push(`  ${k}-on: ${bestText(m[r]!)};`); });
    lines.push('}');
    return lines.join('\n');
  }, [p.filled]);

  const copyCss = async () => {
    if (!p.filled.length) { notify('Add colors first.'); return; }
    try {
      await navigator.clipboard.writeText(paletteCss);
      notify('CSS copied.');
    } catch {
      notify('Copy unavailable. Select the code manually.');
      document.getElementById('css-export')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const has = p.filled.length > 0;
  const canPreview = p.previewReady;
  const protectedCount = p.sourceSwatches.length;
  const chosenCount = p.filled.filter((c) => c.origin === 'suggestion').length;
  const yourColorCount = p.filled.filter((c) => c.source && c.origin !== 'suggestion').length;
  const generatedCount = p.filled.filter((c) => !c.source).length;
  const rolesOpen = Math.max(0, 5 - p.filled.length);

  const captureBefore = useCallback(() => {
    if (!p.isComplete && p.filled.length > 0) setBeforePalette(clonePalette(p.filled));
  }, [p.filled, p.isComplete]);

  const openPreview = () => {
    if (!canPreview) { openAdd(); notify('Add another color, or complete the palette from one color.'); return; }
    captureBefore();
    setWebOpen(true);
  };

  const completePalette = () => {
    if (!p.filled.length) { openAdd(); return; }
    const protectedBefore = protectedCount;
    const missingBefore = Math.max(0, 5 - p.filled.length);
    captureBefore();
    p.fix();
    setTab('preview');
    notify(`Palette completed around ${protectedBefore} protected color${protectedBefore === 1 ? '' : 's'}${missingBefore ? ` · ${missingBefore} supporting role${missingBefore === 1 ? '' : 's'} solved` : ''}.`);
  };

  const resetAll = () => {
    p.reset();
    setBeforePalette(null);
    setTab('analysis');
    notify('Workspace reset.');
  };

  return (
    <div style={cssVars}>
      <header className="topbar glass">
        <div className="brand">
          <img className="brand-logo" src={import.meta.env.BASE_URL + "aw-mark.png"} alt="AllWebsites.design" />
          <span className="brand-copy"><strong>WebPalette Studio</strong><small>Website Color System Builder</small></span>
        </div>
        <div className="top-actions">
          <a className="btn ghost" href="/archive">Archive</a>
          <a className="btn ghost" href="/tools">← All tools</a>
          <button className="btn ghost" onClick={resetAll}>Reset</button>
          <button className="btn" onClick={copyCss}>Copy CSS</button>
          <button className="btn dark" disabled={!canPreview} title={canPreview ? 'Preview the current website color system' : 'Add two colors, or complete a palette from one color'} onClick={openPreview}>Preview website</button>
        </div>
      </header>

      <main className="wrap">
        <section className="hero" aria-labelledby="hero-title">
          <span className="hero-eyebrow">WEBSITE COLOR SYSTEM BUILDER · BY ALLWEBSITES.DESIGN</span>
          <h1 id="hero-title">Turn your brand colors into a complete website palette.</h1>
          <p>Start with the colors you already chose. WebPalette Studio keeps those values intact, assigns them real website roles, shows what the system is missing, and generates only the colors needed to complete it.</p>
          <div className="hero-actions">
            <button className="btn dark hero-primary" onClick={() => openAdd()}>Start with your colors</button>
            <button className="btn ghost hero-secondary" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>See how it works</button>
          </div>
          <div className="proof-line" aria-label="Product facts"><span>Protected colors</span><span>5 website roles</span><span>Contrast-aware</span><span>No signup</span></div>
        </section>

        <section className="workspace" aria-label="WebPalette Studio workspace">
          <div className="card glass">
            {!has ? (
              <div className="empty-state">
                <div>
                  <span className="section-kicker">START WITH WHAT YOU HAVE</span>
                  <h2>Bring the colors you already have.</h2>
                  <p>Start with a brand color, logo color or an existing palette. Search by name, paste HEX, use the color wheel, pick from your screen, or enter RGB / OKLCH.</p>
                  <small>Your chosen HEX values stay protected when the palette is completed.</small>
                </div>
                <button className="btn dark" onClick={() => openAdd()}>Add your first color</button>
              </div>
            ) : (
              <>
                <div className="panel-head">
                  <div>
                    <span className="section-kicker">WEBSITE COLOR SYSTEM</span>
                    <h2>Your website palette</h2>
                    <div className="sub">{p.filled.length} of 5 roles · {protectedCount} protected color{protectedCount === 1 ? '' : 's'}{p.ctx ? ` · ${p.ctx.analysis.label} relationship` : ''}</div>
                  </div>
                  <div className="palette-tools">
                    <button
                      className="swap-role-btn"
                      disabled={!p.canSwapPrimarySecondary}
                      title={p.canSwapPrimarySecondary ? 'Swap the semantic jobs without changing either color' : 'Add both a Primary and Secondary color first'}
                      onClick={() => { p.swapPrimarySecondary(); notify('Primary and Secondary swapped. Both roles are now protected.'); }}
                    ><strong>Swap roles</strong><small>Primary ⇄ Secondary</small></button>
                    <div className="seg" aria-label="Palette sorting"><button onClick={p.sortByRole}>Role order</button><button onClick={p.sortLightDark}>Light → Dark</button></div>
                  </div>
                </div>

                <PaletteRow slots={p.slots} onAdd={openAdd} onEdit={openEdit} onRemove={p.removeColor} onReorder={p.reorder} onExplain={explainRole} />

                <div className="system-line" aria-label="Decision status">
                  <span><b>{yourColorCount}</b> Your color{yourColorCount === 1 ? '' : 's'}</span>
                  {chosenCount > 0 && <span className="selected-pill"><b>{chosenCount}</b> Chosen</span>}
                  <span><b>{generatedCount}</b> Generated</span>
                  <span className={p.isComplete ? 'ready' : ''}><b>{p.filled.length}/5</b> Roles ready</span>
                </div>

                {p.filled.length === 1 && !p.isComplete && (
                  <div className="journey-cue">
                    <div><strong>1 brand color</strong><span>4 website roles still open</span><p>We can build a full website palette from one color, but adding another existing brand color gives the system more of your original direction.</p></div>
                    <div><button className="btn" onClick={() => openAdd()}>Add another color</button><button className="btn dark" onClick={completePalette}>Complete from one color</button></div>
                  </div>
                )}

                {p.filled.length >= 2 && !p.isComplete && (
                  <div className="journey-cue compact">
                    <div><strong>{p.filled.length} protected colors</strong><span>{rolesOpen} roles open</span><p>Preview the current reality first, then complete the missing jobs.</p></div>
                    <div><button className="btn" onClick={openPreview}>Preview current palette</button><button className="btn dark" onClick={completePalette}>Complete palette</button></div>
                  </div>
                )}

                <div className="tabs">
                  <div className="tab-bar" role="tablist" aria-label="Palette details">
                    <button role="tab" aria-selected={tab === 'analysis'} className={tab === 'analysis' ? 'on' : ''} onClick={() => setTab('analysis')}>Analysis</button>
                    <button role="tab" aria-selected={tab === 'contrast'} className={tab === 'contrast' ? 'on' : ''} onClick={() => setTab('contrast')}>Contrast</button>
                    <button role="tab" aria-selected={tab === 'preview'} className={tab === 'preview' ? 'on' : ''} onClick={() => setTab('preview')}>Preview</button>
                  </div>
                  {tab === 'analysis' && <AnalysisTab items={p.filled} analysis={p.ctx?.analysis} />}
                  {tab === 'contrast' && <ContrastMatrix items={p.filled} />}
                  {tab === 'preview' && (
                    <div className="preview-launch">
                      <div>
                        <span>WEBSITE PREVIEW</span>
                        <h3>{!canPreview ? 'Add another color to preview the current system.' : p.isComplete ? 'See the same website with a complete system.' : 'See what the palette really does.'}</h3>
                        <p>{!canPreview ? 'A complete palette built from one source is also previewable.' : p.isComplete ? 'The composition stays the same. Only the color-role mapping changes.' : `This preview uses only the ${p.filled.length} colors currently in your palette. Missing roles are not secretly generated.`}</p>
                      </div>
                      <button className="btn dark" disabled={!canPreview} onClick={openPreview}>{p.isComplete ? 'Preview completed palette' : 'Preview current palette'}</button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <HealthPanel
            items={p.filled}
            relationship={p.ctx?.analysis.label}
            suggestionsPending={p.suggestionsPending}
            optionsForRole={p.optionsForRole}
            onAddOption={(role, option) => { p.addOption(role, option); notify(`${option.model} chosen. ${role === 'light' ? 'Light Neutral' : role === 'dark' ? 'Dark Neutral' : 'Accent'} is now role locked.`); }}
            onFix={completePalette}
          />
        </section>

        {has && (
          <section className="export-panel glass" id="css-export">
            <div className="export-copy"><span className="section-kicker">CSS EXPORT</span><h2>Take the system with you.</h2><p>Copy semantic variables by job, not by appearance. The code stays visible even if clipboard access is unavailable.</p><button className="btn dark" onClick={copyCss}>Copy CSS variables</button></div>
            <pre tabIndex={0}><code>{paletteCss}</code></pre>
          </section>
        )}

        <ProductContent onStart={() => openAdd()} />
      </main>

      <ColorStudio open={studio.open} editing={studio.editing} initialHex={studio.hex} recent={recent} onClose={() => setStudio((s) => ({ ...s, open: false }))} onCommit={(hex, preferred) => { p.setColor(studio.index, hex, preferred); remember(hex); setStudio((s) => ({ ...s, open: false })); notify(`${preferred?.name || 'Color'} added as a protected decision.`); }} />
      {webOpen && <WebsitePreview items={p.filled} beforeItems={beforePalette || undefined} onClose={() => setWebOpen(false)} onCopyCss={copyCss} />}
      <Toast message={toast} />
    </div>
  );
}

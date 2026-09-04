import { CSSProperties } from 'react';
import { Swatch, Role, ROLE_LABEL } from '../lib/types';
import { contrast, hexToRgb, rgbToHex, resolveOnSurface } from '../lib/color';

interface PreviewPalette {
  mode: 'partial' | 'complete';
  items: Swatch[];
  mapped: Record<Role, string>;
}

function mix(a: string, b: string, wa: number) {
  const A = hexToRgb(a), B = hexToRgb(b), wb = 1 - wa;
  return rgbToHex(A.r * wa + B.r * wb, A.g * wa + B.g * wb, A.b * wa + B.b * wb);
}
function bestFrom(bg: string, colors: string[]) {
  const pool = colors.filter((h) => h !== bg);
  const list = pool.length ? pool : colors;
  let best = list[0] || bg, bestRatio = -1;
  for (const h of list) { const r = contrast(bg, h); if (r > bestRatio) { best = h; bestRatio = r; } }
  return best;
}

export function PaletteContextPreview({ palette }: { palette: PreviewPalette }) {
  const { mode, items, mapped: m } = palette;
  const actual = items.map((x) => x.hex);
  const canvas = m.light, foreground = m.dark;

  // Complete palettes have semantic Light/Dark Neutral roles, so use the
  // context-aware resolver. Partial previews must remain honest and can only use
  // colors actually present in the unfinished palette.
  const primaryDisplay = mode === 'complete' ? resolveOnSurface(m.primary, m.light, m.dark, 'display') : null;
  const primaryBody = mode === 'complete' ? resolveOnSurface(m.primary, m.light, m.dark, 'body') : null;
  const secondaryBody = mode === 'complete' ? resolveOnSurface(m.secondary, m.light, m.dark, 'body') : null;
  const accentBody = mode === 'complete' ? resolveOnSurface(m.accent, m.light, m.dark, 'body') : null;
  const darkBody = mode === 'complete' ? resolveOnSurface(m.dark, m.light, m.dark, 'body') : null;

  const style = {
    '--pc-primary': m.primary,
    '--pc-secondary': m.secondary,
    '--pc-accent': m.accent,
    '--pc-dark': m.dark,
    '--pc-canvas': canvas,
    '--pc-foreground': foreground,
    '--pc-primary-text': primaryDisplay?.color ?? bestFrom(m.primary, actual),
    '--pc-primary-body-text': primaryBody?.color ?? bestFrom(m.primary, actual),
    '--pc-secondary-text': secondaryBody?.color ?? bestFrom(m.secondary, actual),
    '--pc-accent-text': accentBody?.color ?? bestFrom(m.accent, actual),
    '--pc-dark-text': darkBody?.color ?? bestFrom(m.dark, actual),
    '--pc-primary-soft': mix(m.primary, canvas, 0.12),
    '--pc-secondary-soft': mix(m.secondary, canvas, 0.12),
    '--pc-accent-soft': mix(m.accent, canvas, 0.14),
  } as CSSProperties;

  return (
    <div className="pc-site" style={style}>
      <nav className="pc-nav">
        <div className="pc-logo"><div className="pc-logo-shapes"><i /><i /><i /><i /></div><span>BLOCK / FORM</span></div>
        <div className="pc-nav-note">Independent digital systems studio</div>
        <div className="pc-links"><span>Work</span><span>Process</span><span>Contact</span></div>
      </nav>

      <section className="pc-hero">
        <div className="pc-hero-grid">
          <div>
            <span className="pc-eyebrow">{mode === 'partial' ? `${items.length}-color reality check` : 'Five-role completed system'}</span>
            <h2>Make the color system do the heavy lifting.</h2>
            <p>{mode === 'partial' ? `This page is intentionally forced to use only the ${items.length} colors currently in your palette. Missing roles are not secretly generated.` : 'The same composition now uses the complete Primary, Secondary, Light Neutral, Dark Neutral and Accent system.'}</p>
            <div className="pc-actions"><button className="pc-btn light">View selected work</button><button className="pc-btn dark">How we work</button></div>
          </div>
          <div className="pc-hero-art">
            <div className="pc-hero-card">
              <small>System snapshot</small><h3>One palette.<br />Many roles.</h3>
              <div className="pc-metrics">
                <div><strong>12</strong><span>Page modules</span></div>
                <div><strong>{String(items.length).padStart(2, '0')}</strong><span>{mode === 'partial' ? 'Colors currently used' : 'Color roles'}</span></div>
                <div><strong>08</strong><span>Launch assets</span></div>
                <div><strong>01</strong><span>Visual language</span></div>
              </div>
            </div>
            <div className="pc-float-circle" /><div className="pc-float-square" />
          </div>
        </div>
      </section>

      <section className="pc-role-strip" style={{ gridTemplateColumns: `repeat(${items.length},1fr)` }}>
        {items.map((c, i) => <div className="pc-role" key={`${c.hex}-${i}`}><small>{mode === 'complete' ? ROLE_LABEL[c.role] : `Selected color ${i + 1}`}</small><strong>{c.hex}</strong><i style={{ background: c.hex }} /></div>)}
      </section>

      <section className="pc-trust"><div className="pc-trust-head">Selected collaborators</div><div className="pc-trust-row"><div>NORTHLINE</div><div>OBJECT 04</div><div>FIELDNOTE</div><div>ARC / LAB</div><div>FORM CO.</div></div></section>

      <section className="pc-section pc-features">
        <span className="pc-section-tag">Capabilities</span><h3>Strong systems create faster visual decisions.</h3>
        <p className="pc-section-lead">A small set of clear visual rules makes the website feel intentional even as the palette changes dramatically.</p>
        <div className="pc-feature-grid">
          {[['01','Brand systems','Color roles, typography, geometric motifs and reusable composition rules for digital-first brands.'],['02','Product systems','Interface hierarchy and component patterns built around clarity, rhythm and fast recognition.'],['03','Launch systems','Campaign-ready visual kits for landing pages, social, decks, case studies and product launches.']].map((x,i)=><article className="pc-feature" key={x[0]}><div className={`pc-icon i${i+1}`}>{x[0]}</div><h4>{x[1]}</h4><p>{x[2]}</p><div className="pc-geo" /></article>)}
        </div>
      </section>

      <section className="pc-section pc-benefits"><span className="pc-section-tag">Why it works</span><h3>Color is not decoration. Color is structure.</h3><p className="pc-section-lead">{mode === 'partial' ? `Only ${items.length} colors must currently handle every surface, action and text relationship. Repetition and weak hierarchy are intentionally visible.` : 'The completed roles now control large blocks, calls to action, supporting cards and readable neutral structure.'}</p><div className="pc-benefit-grid">{['Primary controls attention and the strongest visual moments.','Secondary separates major content groups without adding clutter.','Accent handles highlights, labels and moments that need different energy.','The dark neutral grounds the system and keeps the page readable.'].map((x,i)=><div className="pc-benefit" key={x}><strong>0{i+1}</strong><span>{x}</span></div>)}</div></section>

      <section className="pc-section pc-process"><span className="pc-section-tag">How it works</span><h3>{mode === 'partial' ? `What happens when ${items.length} colors have to do every job.` : 'From five colors to a complete interface.'}</h3><p className="pc-section-lead">The layout never changes, so you can compare the incomplete and completed palette honestly.</p><div className="pc-process-grid">{[['01','Select','Choose the colors you already love.'],['02','Preview','See the current palette without hidden fixes.'],['03','Complete','Generate only the missing functional roles.'],['04','Compare','Return to the same page and judge the improvement.']].map(x=><div className="pc-step" key={x[0]}><strong>{x[0]}</strong><h4>{x[1]}</h4><p>{x[2]}</p></div>)}</div></section>

      <section className="pc-stats"><div><strong>{String(items.length).padStart(2,'0')}</strong><span>{mode === 'partial' ? 'Current colors' : 'Core color roles'}</span></div><div><strong>09</strong><span>Preview sections</span></div><div><strong>01</strong><span>Consistent layout</span></div><div><strong>00</strong><span>Hidden fixes</span></div></section>

      <section className="pc-section pc-pricing"><span className="pc-section-tag">Pricing</span><h3>Simple plans. No decorative complexity.</h3><p className="pc-section-lead">The featured plan uses the primary color on a large content block, which quickly exposes weak text contrast or missing hierarchy.</p><div className="pc-pricing-grid">{[['Starter','$0'],['Studio','$24'],['Team','$59']].map((x,i)=><article className={'pc-price '+(i===1?'featured':'')} key={x[0]}><small>{x[0]}</small><div className="pc-price-value">{x[1]}</div><p>{i===0?'For evaluating a few visual directions.':i===1?'For designers comparing systems regularly.':'For teams standardizing color decisions.'}</p><ul><li>Live palette preview</li><li>Role mapping</li><li>Contrast guidance</li></ul><button>{i===0?'Start free':'Choose '+x[0].toLowerCase()}</button></article>)}</div></section>

      <section className="pc-section pc-faq"><span className="pc-section-tag">FAQ</span><h3>A few practical questions.</h3><div className="pc-faq-list">{['Does every palette change the entire website?','Can I preview before fixing the palette?','Can I inspect contrast by real UI usage?'].map(x=><div className="pc-faq-item" key={x}><strong>{x}</strong><span>+</span></div>)}</div></section>

      <section className="pc-cta"><div><h3>{mode === 'partial' ? 'This is your palette before completion.' : 'Now compare it with the palette you started with.'}</h3><p>{mode === 'partial' ? 'If the interface feels repetitive or hard to read, that is the point: you are seeing the current limitations honestly.' : 'The visual improvement should be obvious on the exact same composition — otherwise the completion has not earned its result.'}</p><button>{mode === 'partial' ? 'Return and complete palette' : 'Palette completed'}</button></div></section>
      <footer className="pc-footer"><div><strong>BLOCK / FORM</strong><p>A fixed-layout color context mockup built to show how palette roles perform across a full website rather than isolated swatches.</p></div><div className="pc-footer-cols"><div><b>Product</b><span>Palettes</span><span>Preview</span></div><div><b>Studio</b><span>About</span><span>Journal</span></div><div><b>Legal</b><span>Privacy</span><span>Terms</span></div></div></footer>
    </div>
  );
}

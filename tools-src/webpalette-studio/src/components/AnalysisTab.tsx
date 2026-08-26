import { Swatch, ROLE_ORDER, ROLE_LABEL, ROLE_PURPOSE } from '../lib/types';
import { SourceAnalysis } from '../lib/harmony';
import { rgbToOklch, contrast } from '../lib/color';
import { roleFit } from '../lib/scoring';

const RELATION_COPY: Record<string, { title: string; body: string }> = {
  neutral: { title: 'Neutral-led source set', body: 'Your inputs are mostly neutral. The system adds only the chromatic structure the interface is missing.' },
  single: { title: 'One brand hue is doing the talking', body: 'WebPalette Studio builds hierarchy with tone first. A new hue family is a fallback, not the default.' },
  monochrome: { title: 'A deliberately monochromatic system', body: 'The hue family stays intact while separation comes mainly from lightness, chroma and neutral anchors.' },
  analogous: { title: 'Closely related hues', body: 'Your brand colors sit close together on the hue circle, so supporting colors stay conservative before introducing distant hues.' },
  related: { title: 'Related but visibly separated hues', body: 'The palette already has useful hue variety. Completion prioritizes tonal extensions and neutrals over another saturated direction.' },
  split: { title: 'Wide hue structure already exists', body: 'Existing hue families are reused while neutrals do most of the structural work.' },
  complementary: { title: 'Strong opposing hues already exist', body: 'The palette already carries strong hue contrast, so supporting roles are derived from the colors you selected.' },
  triadic: { title: 'Three-way hue structure already exists', body: 'The source already carries substantial hue diversity, so the solver avoids expanding the wheel further.' },
  multi: { title: 'Multi-hue palette', body: 'Hue diversity is already sufficient. Completion focuses on role clarity, contrast and neutral structure.' },
};

function sourceWhy(c: Swatch) {
  if (c.origin === 'role-swap') return `You explicitly moved this color into the ${ROLE_LABEL[c.role]} role. Its HEX did not change and the semantic role is protected.`;
  if (c.origin === 'suggestion') return `You chose this suggested ${ROLE_LABEL[c.role].toLowerCase()}. Future palette completion keeps both ${c.hex} and this semantic role.`;
  if (c.role === 'light') return 'Recognized as a usable light neutral from its high lightness and restrained chroma.';
  if (c.role === 'dark') return 'Recognized as a usable dark neutral from its low lightness and restrained chroma.';
  if (c.role === 'primary') return 'Protected as the main brand anchor from your original color decisions.';
  if (c.role === 'secondary') return 'Protected as a supporting brand color in the current hierarchy.';
  return 'Protected as a user-supplied emphasis color. Palette completion does not overwrite it.';
}
function fmt(n: number | undefined, digits = 2) { return n == null || !Number.isFinite(n) ? '—' : n.toFixed(digits); }

export function AnalysisTab({ items, analysis }: { items: Swatch[]; analysis?: SourceAnalysis | null }) {
  if (!analysis) return null;
  const sources = items.filter((c) => c.source).length;
  const accepted = items.filter((c) => c.origin === 'suggestion').length;
  const generated = items.filter((c) => !c.source).length;
  const rel = RELATION_COPY[analysis.relationship] || RELATION_COPY.multi;

  return (
    <div className="analysis-view">
      <section className="analysis-hero-card">
        <div>
          <span className="analysis-kicker">COLOR RELATIONSHIP</span>
          <h3>{rel.title}</h3>
          <p>{rel.body}</p>
        </div>
        <div className="analysis-facts">
          <div><strong>{analysis.label}</strong><span>Relationship</span></div>
          <div><strong>{sources}</strong><span>Your colors</span></div>
          <div><strong>{accepted}</strong><span>Chosen suggestions</span></div>
          <div><strong>{generated}</strong><span>Generated roles</span></div>
        </div>
      </section>

      <div className="decision-head"><div><h3>Why each color is here.</h3><p>See what came from you, what was generated, which job each color performs, and why.</p></div></div>
      <div className="decision-list">
        {ROLE_ORDER.map((role) => {
          const c = items.find((x) => x.role === role);
          if (!c) return <div className="decision-row missing" key={role}><div className="decision-swatch" /><div className="decision-main"><div className="decision-title"><b>{ROLE_LABEL[role]}</b><span>Missing</span></div><p>{ROLE_PURPOSE[role]} has not been solved yet.</p></div></div>;
          const o = rgbToOklch(c.hex);
          const d = c.derivation;
          const bestTextRatio = Math.max(contrast(c.hex, '#111318'), contrast(c.hex, '#FFFFFF'));
          const light = items.find((x) => x.role === 'light');
          const ui = light && role !== 'light' ? contrast(c.hex, light.hex) : undefined;
          const summary = c.source ? sourceWhy(c) : (d?.summary || 'Generated to complete this role.');
          const showGeneratedEvidence = c.origin === 'suggestion' || c.origin === 'role-swap' || !c.source;
          const badge = c.origin === 'suggestion' ? 'Chosen suggestion' : c.origin === 'role-swap' ? 'Role locked' : c.source ? 'Your color' : 'Generated';
          return (
            <article className="decision-row" id={`decision-${role}`} key={role}>
              <div className="decision-swatch" style={{ background: c.hex }} />
              <div className="decision-main">
                <div className="decision-title">
                  <div><b>{ROLE_LABEL[role]}</b><strong>{c.name}</strong><code>{c.hex}</code></div>
                  <span className={c.origin === 'suggestion' ? 'selected' : c.origin === 'role-swap' ? 'swapped' : c.source ? 'source' : 'generated'}>{badge}</span>
                </div>
                <p>{summary}</p>
                <div className="decision-rolewhy"><b>Used for:</b> {ROLE_PURPOSE[role]}</div>
                {showGeneratedEvidence && d?.roleWhy && <div className="decision-rolewhy"><b>Why:</b> {d.roleWhy}</div>}
                <details className="technical-details">
                  <summary>Technical details</summary>
                  <div className="evidence-chips">
                    <span>OKLCH L {fmt(o.L, 3)}</span><span>C {fmt(o.C, 3)}</span><span>H {Math.round(o.H)}°</span>
                    <span>Role fit {Math.round((d?.evidence.roleFit ?? roleFit(c.hex, role)) * 100)}%</span>
                    <span>Best text {fmt(d?.evidence.bestTextContrast ?? bestTextRatio, 1)}:1</span>
                    {ui != null && <span>vs Light {fmt(d?.evidence.uiContrast ?? ui, 1)}:1</span>}
                    {showGeneratedEvidence && d?.evidence.nearestSourceHue != null && <span>Nearest source ΔH {fmt(d.evidence.nearestSourceHue, 1)}°</span>}
                    {showGeneratedEvidence && d?.evidence.nearestSourceDeltaE != null && <span>ΔEOK {fmt(d.evidence.nearestSourceDeltaE, 3)}</span>}
                  </div>
                  {showGeneratedEvidence && d?.transform && (
                    <div className="transform-line">
                      <b>Transform</b>
                      {d.basedOn.length > 0 && <span>from {d.basedOn.join(' + ')}</span>}
                      {d.transform.deltaHue != null && <span>ΔH {d.transform.deltaHue > 0 ? '+' : ''}{d.transform.deltaHue}°</span>}
                      {d.transform.deltaLightness != null && <span>ΔL {d.transform.deltaLightness > 0 ? '+' : ''}{d.transform.deltaLightness}</span>}
                      {d.transform.chromaScale != null && <span>Chroma ×{d.transform.chromaScale}</span>}
                      {d.transform.undertoneHue != null && <span>Undertone {Math.round(d.transform.undertoneHue)}°</span>}
                    </div>
                  )}
                  {showGeneratedEvidence && d?.alternatives && d.alternatives.length > 0 && (
                    <div className="decision-alts"><div>{d.alternatives.map((a) => <span key={a.hex}><i style={{ background: a.hex }} />{a.model}<code>{a.hex}</code><small>{a.score.toFixed(1)}</small></span>)}</div></div>
                  )}
                </details>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

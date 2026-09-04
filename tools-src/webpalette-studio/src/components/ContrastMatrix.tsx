import { Swatch, ROLE_ORDER, ROLE_LABEL, Role } from '../lib/types';
import { contrast } from '../lib/color';
import { pairings } from '../lib/scoring';

const COPY: Record<string, { title: string; why: string }> = {
  body: { title: 'Body text on surface', why: 'Long-form copy on the main light surface.' },
  primaryText: { title: 'Text on Primary', why: 'Headings, labels or copy placed on the primary brand surface.' },
  secondaryText: { title: 'Text on Secondary', why: 'Copy placed on sections, cards or bands using Secondary.' },
  accentText: { title: 'Text on Accent', why: 'Button labels and short text placed directly on Accent.' },
  primaryUI: { title: 'Primary on surface', why: 'Primary-colored icons, borders and controls against the main surface.' },
  accentUI: { title: 'Accent on surface', why: 'Accent-colored controls, icons or indicators against the main surface.' },
};

function grade(ratio: number, target: number): [string, string] {
  if (!ratio) return ['Not testable', 'na'];
  return ratio >= target ? ['Pass', 'pass'] : ['Needs work', 'needs-work'];
}
function matrixBadge(ratio: number): [string, string] {
  if (ratio >= 7) return ['AAA', 'badge-aaa'];
  if (ratio >= 4.5) return ['AA', 'badge-aa'];
  if (ratio >= 3) return ['UI', 'badge-ui'];
  return ['Low', 'badge-fail'];
}

export function ContrastMatrix({ items }: { items: Swatch[] }) {
  const m: Partial<Record<Role, string>> = {};
  items.forEach((c) => (m[c.role] = c.hex));
  const p = pairings(m);
  const cells = ROLE_ORDER.filter((r) => items.some((c) => c.role === r)).map((r) => items.find((c) => c.role === r)!);

  return (
    <div className="contrast-guide">
      <div className="contrast-summary">
        <div><span className="section-kicker">WEBSITE CONTRAST</span><h3>Check the relationships that matter on a website.</h3></div>
        <div className="contrast-count"><strong>{p.passed}/{p.total}</strong><span>functional checks pass</span></div>
      </div>

      <div className="functional-list">
        {p.det.map((d) => {
          const c = COPY[d.id];
          const fg = d.foreground ?? d.a;
          const bg = d.bg ?? d.b;
          const [label, cls] = grade(d.ratio, d.target);
          return (
            <div className="contrast-use" key={d.id}>
              <div className="cu-title"><strong>{c.title}</strong><span>{c.why}</span></div>
              <div className="cu-pair">
                {fg && m[fg] && <><i style={{ background: m[fg] }} /><span>{ROLE_LABEL[fg]}</span></>}
                {fg && bg && <em>on</em>}
                {bg && m[bg] && <><i style={{ background: m[bg] }} /><span>{ROLE_LABEL[bg]}</span></>}
                {(!fg || !bg || !m[fg] || !m[bg]) && <span className="missing-pair">Missing required role</span>}
              </div>
              <div className="cu-ratio">{d.ratio ? `${d.ratio.toFixed(1)}:1` : '—'}<small>Target {d.target}:1</small></div>
              <div className={`cu-badge ${cls}`}>{label}</div>
            </div>
          );
        })}
      </div>

      <div className="contrast-note"><b>Contrast-aware, not a site-wide compliance guarantee.</b> These checks cover practical palette relationships. Normal body text generally targets 4.5:1; applicable UI and large-text contexts use 3:1. Full WCAG conformance depends on the finished interface and how colors are used.</div>

      <details className="advanced-matrix">
        <summary>View all pairwise ratios <span>Technical matrix</span></summary>
        <div className="matrix-key"><span><b>AAA</b> 7:1+</span><span><b>AA</b> 4.5:1+</span><span><b>UI</b> 3:1+</span></div>
        <div className="matrix-scroll">
          <table className="matrix">
            <thead><tr><th />{cells.map((c) => <th key={c.role}><div className="mx-h"><i style={{ background: c.hex }} />{ROLE_LABEL[c.role].split(' ')[0]}</div></th>)}</tr></thead>
            <tbody>
              {cells.map((rowC) => (
                <tr key={rowC.role}>
                  <th style={{ textAlign: 'left' }}><div className="mx-h row"><i style={{ background: rowC.hex }} />{ROLE_LABEL[rowC.role].split(' ')[0]}</div></th>
                  {cells.map((colC) => {
                    if (rowC === colC) return <td key={colC.role}><div className="cell badge-self">—</div></td>;
                    const ratio = contrast(rowC.hex, colC.hex), [b, cls] = matrixBadge(ratio);
                    return <td key={colC.role}><div className={'cell ' + cls}>{b}<small>{ratio.toFixed(1)}</small></div></td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

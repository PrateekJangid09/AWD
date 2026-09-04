import { useEffect, useRef, useState } from 'react';
import { Swatch, Role, ROLE_LABEL, ROLE_ORDER, HarmonyOption } from '../lib/types';
import { healthReport, isHealthy } from '../lib/scoring';
import { rgbToOklch, clamp01 } from '../lib/color';

interface Props {
  items: Swatch[];
  optionsForRole: (role: Role) => HarmonyOption[];
  onAddOption: (role: Role, option: HarmonyOption) => void;
  onFix: () => void;
  relationship?: string;
  suggestionsPending?: boolean;
}

function readinessScore(items: Swatch[]) {
  if (!items.length) return 0;
  const c = healthReport(items);
  const W: Record<string, number> = { complete: 10, light: 15, dark: 15, coverage: 20, pairings: 10, accent: 15, tonal: 15 };
  const prog: Record<string, number> = {
    complete: clamp01(items.length / 5),
    light: c.light ? 1 : clamp01(c.lightFit / 0.66),
    dark: c.dark ? 1 : clamp01(c.darkFit / 0.66),
    coverage: clamp01(c.coveragePct / (4 / 6)),
    pairings: clamp01(c.pairingsPassed / 4),
    accent: c.accent ? 1 : clamp01(c.accentQuality / 0.60),
    tonal: c.tonal ? 1 : Math.min(clamp01(c.tonalRange / 0.58), clamp01(c.separation / 0.52)),
  };
  const raw = Object.keys(W).reduce((sum, key) => sum + W[key] * prog[key], 0);
  return isHealthy(items) ? 100 : Math.min(99, Math.round(raw));
}

function rewardState(score: number, complete: boolean) {
  if (complete && score === 100) return { title: 'Ready to ship', detail: 'All functional checks pass.', tone: '#14784D' };
  if (score >= 90) return { title: 'Excellent structure', detail: 'The system is close to production-ready.', tone: '#14784D' };
  if (score >= 75) return { title: 'Strong foundation', detail: 'Most website jobs are working well.', tone: '#866214' };
  if (score >= 55) return { title: 'Taking shape', detail: 'The core system is forming.', tone: '#9A6317' };
  return { title: 'Building the system', detail: 'Add structure around your brand colors.', tone: '#8A5147' };
}

export function HealthPanel({ items, optionsForRole, onAddOption, onFix, relationship, suggestionsPending = false }: Props) {
  const score = readinessScore(items);
  const allPass = items.length > 0 && isHealthy(items);
  const previousScore = useRef(score);
  const [gain, setGain] = useState(0);

  useEffect(() => {
    const previous = previousScore.current;
    previousScore.current = score;
    if (score <= previous || previous === 0) return;
    setGain(score - previous);
    const timer = window.setTimeout(() => setGain(0), 1800);
    return () => window.clearTimeout(timer);
  }, [score]);

  if (!items.length) {
    return (
      <aside className="health glass premium-health" aria-label="Website readiness">
        <div className="reward-score empty-reward">
          <div className="reward-ring" style={{ background: 'conic-gradient(#D5D1C8 0%, #ECE9E2 0)' }}>
            <div className="reward-ring-core"><strong>–</strong><span>out of 100</span></div>
          </div>
          <div className="reward-copy">
            <span className="section-kicker">WEBSITE READINESS</span>
            <h2>Add a color</h2>
            <p>Your readiness score grows as the five website jobs become usable.</p>
          </div>
        </div>
        <div className="readiness-empty premium-empty">
          <span>Primary</span><span>Secondary</span><span>Light Neutral</span><span>Dark Neutral</span><span>Accent</span>
        </div>
        <button className="fixbtn premium-complete" disabled>Complete palette</button>
      </aside>
    );
  }

  const c = healthReport(items);
  const state = rewardState(score, allPass);
  const roleCount = ROLE_ORDER.filter((role) => items.some((item) => item.role === role)).length;
  const missingRoles = ROLE_ORDER.filter((role) => !items.some((item) => item.role === role));
  const ls = items.map((item) => rgbToOklch(item.hex).L);
  const tonalSpan = ls.length > 1 ? Math.round((Math.max(...ls) - Math.min(...ls)) * 100) : 0;
  const functionalReady = c.light && c.dark && c.accent;
  const checks = [
    { title: 'Role coverage', ok: c.complete, value: c.complete ? 'All 5 website jobs covered' : `${5 - roleCount} role${5 - roleCount === 1 ? '' : 's'} still open` },
    { title: 'Text readability', ok: c.pairings, value: `${c.pairingsPassed} usable text pairings` },
    { title: 'Tonal range', ok: c.tonal, value: c.tonal ? `Useful light/dark span · ${tonalSpan}` : `Needs more light/dark separation · ${tonalSpan}` },
    { title: 'Website utility', ok: functionalReady, value: functionalReady ? 'Surface, ink and action roles available' : 'A surface, ink or action role still needs work' },
  ];

  const suggestionRoles = (['light', 'dark', 'accent'] as Role[]).filter((role) => {
    if (!items.some((item) => item.role === role)) return true;
    if (role === 'light') return !c.light;
    if (role === 'dark') return !c.dark;
    return !c.accent;
  });

  return (
    <aside className={'health glass premium-health' + (allPass ? ' system-ready' : '')} aria-label="Website readiness">
      <div className="reward-score">
        <div className="reward-ring-wrap">
          <div className="reward-ring" style={{ background: `conic-gradient(${state.tone} ${score}%, #E8E5DE 0)` }}>
            <div className="reward-ring-core"><strong>{score}</strong><span>out of 100</span></div>
          </div>
          {gain > 0 && <span className="score-gain" aria-live="polite">+{gain}</span>}
        </div>
        <div className="reward-copy">
          <span className="section-kicker">WEBSITE READINESS</span>
          <h2>{state.title}</h2>
          <p>{state.detail}</p>
          <div className="reward-meta">
            <span>{roleCount}/5 roles</span>
            <span>{c.pairingsPassed} readable pairs</span>
            {relationship && <span>{relationship}</span>}
          </div>
        </div>
      </div>

      <div className="readiness-checks premium-checks">
        {checks.map((check) => (
          <div className={'readiness-check' + (check.ok ? ' ok' : '')} key={check.title}>
            <span className="readiness-icon" aria-hidden="true">{check.ok ? '✓' : '○'}</span>
            <div><strong>{check.title}</strong><small>{check.value}</small></div>
          </div>
        ))}
      </div>

      {missingRoles.length > 0 && (
        <div className="missing-roles"><span>Missing roles</span><div>{missingRoles.map((role) => <b key={role}>{ROLE_LABEL[role]}</b>)}</div></div>
      )}

      {suggestionRoles.length > 0 && (
        <div className="suggestions-block">
          <div className="suggestions-title"><span className="section-kicker">PALETTE-AWARE OPTIONS</span><h3>Choose the direction, not just a shade.</h3></div>
          {suggestionRoles.map((role) => {
            const opts = optionsForRole(role).slice(0, role === 'accent' ? 3 : 2);
            return (
              <div className={'role-suggestions' + (role === 'accent' ? ' accent-directions' : '')} key={role}>
                <div className="role-suggestion-head">
                  <strong>{ROLE_LABEL[role]}</strong>
                  {role === 'accent' && <small>Brand-close · Balanced · Bold</small>}
                </div>
                {suggestionsPending && opts.length === 0 && <span className="suggestion-pending">Ranking full-palette options…</span>}
                {opts.map((option) => (
                  <button key={option.model + option.hex} className="suggest-card" onClick={() => onAddOption(role, option)}>
                    <i style={{ background: option.hex }} />
                    <span><b>{option.hex}</b><small>{option.model}</small><em>{option.reason}</em></span>
                    <strong>Use</strong>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}

      <div className="complete-box premium-complete-box">
        <strong>{allPass && roleCount === 5 ? 'The system is ready.' : 'Complete the missing structure.'}</strong>
        <p>Your protected colors stay. The solver can move farther around the hue wheel when a close accent would look muddy or weak.</p>
        <button className="fixbtn premium-complete" onClick={onFix} disabled={allPass && roleCount === 5}>
          {allPass && roleCount === 5 ? 'System ready ✓' : 'Complete palette'}
        </button>
      </div>
    </aside>
  );
}

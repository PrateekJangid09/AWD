import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { Swatch, Role, ROLE_ORDER, ROLE_LABEL, HarmonyOption, ColorDerivation, SwatchOrigin } from '../lib/types';
import { normalizeHex, rgbToOklch } from '../lib/color';
import { displayName, exactNamed, nearestNamed } from '../lib/names';
import { buildPalette, context, optionsFor } from '../lib/harmony';
import { roleFit } from '../lib/scoring';

export type Slots = (Swatch | null)[];
const EMPTY: Slots = [null, null, null, null, null];
const SUGGESTION_ROLES: Role[] = ['light', 'dark', 'accent'];


function emitPerformanceMetric(metric: 'completePalette' | 'suggestions', durationMs: number, detail: Record<string, number> = {}) {
  if (typeof window === 'undefined' || typeof CustomEvent === 'undefined') return;
  window.dispatchEvent(new CustomEvent('webpalette:performance', {
    detail: { metric, durationMs: Number(durationMs.toFixed(2)), ...detail },
  }));
}

function decorate(
  hex: string,
  role: Role,
  source: boolean,
  preferred?: { name: string; group: string } | null,
  sourceOrder?: number,
  derivation?: ColorDerivation,
  origin: SwatchOrigin = source ? 'user' : 'solver',
  roleLocked = false,
): Swatch {
  const ex = exactNamed(hex);
  const nm = preferred ?? (ex ? { name: ex.name, group: ex.group } : nearestNamed(hex));
  return { hex, role, source, name: nm.name, group: (nm as { group: string }).group, sourceOrder, derivation, origin, roleLocked };
}

export function usePalette() {
  const [slots, setSlots] = useState<Slots>(EMPTY);
  const [suggestions, setSuggestions] = useState<Partial<Record<Role, HarmonyOption[]>>>({});
  const [suggestionsPending, setSuggestionsPending] = useState(false);
  const nextSourceOrder = useRef(0);
  const suggestionRequestId = useRef(0);

  // Keep all derived palette state referentially stable. In V15.3 these arrays and
  // the context object were rebuilt on every render, which amplified downstream work.
  const filled = useMemo(() => slots.filter(Boolean) as Swatch[], [slots]);
  const sourceSwatches = useMemo(() => filled
    .filter((c) => c.source)
    .slice()
    .sort((a, b) => (a.sourceOrder ?? 9999) - (b.sourceOrder ?? 9999)), [filled]);
  const sources = useMemo(() => (sourceSwatches.length ? sourceSwatches : filled).map((c) => c.hex), [sourceSwatches, filled]);
  const lockedRoles = useMemo(() => sourceSwatches.reduce((acc, c) => {
    if (c.roleLocked) acc[c.role] = c.hex;
    return acc;
  }, {} as Partial<Record<Role, string>>), [sourceSwatches]);
  const sourceSignature = useMemo(() => sources.join('|'), [sources]);
  const lockSignature = useMemo(() => ROLE_ORDER.map((r) => `${r}:${lockedRoles[r] ?? ''}`).join('|'), [lockedRoles]);
  const ctx = useMemo(() => sources.length ? context(sources, lockedRoles) : null, [sourceSignature, lockSignature]);

  const isComplete = filled.length === 5 && ROLE_ORDER.every((r) => filled.some((c) => c.role === r));
  // Preview is about CURRENT REALITY. Two current colors are enough; a completed five-role
  // palette is always previewable even when it was built from only one surviving source.
  const previewReady = filled.length >= 2 || isComplete;

  /** Re-infer only protected source roles. Generated colors are outputs, never evidence. */
  const inferRoles = useCallback((next: Slots): Slots => {
    const items = next.filter(Boolean) as Swatch[];
    const src = items.filter((c) => c.source).slice().sort((a, b) => (a.sourceOrder ?? 9999) - (b.sourceOrder ?? 9999));
    if (!src.length) return next;
    const locks = src.reduce((acc, c) => {
      if (c.roleLocked) acc[c.role] = c.hex;
      return acc;
    }, {} as Partial<Record<Role, string>>);
    const nextCtx = context(src.map((c) => c.hex), locks);
    const roleByOrder = new Map<number, Role>();
    (Object.keys(nextCtx.roles) as Role[]).forEach((role) => {
      const v = nextCtx.roles[role];
      if (v?.source && v.sourceIndex != null) roleByOrder.set(v.sourceIndex, role);
    });
    src.forEach((c, sourceIndex) => {
      const role = roleByOrder.get(sourceIndex);
      if (role) c.role = role;
      // Manually-entered colors can have role inference refreshed. Accepted
      // suggestions keep their derivation because that is the audit trail for
      // the exact candidate the user chose.
      if (c.origin !== 'suggestion') c.derivation = undefined;
    });
    return next;
  }, []);

  const setColor = useCallback((index: number, hex: string, preferred?: { name: string; group: string } | null) => {
    const h = normalizeHex(hex);
    if (!h) return;
    setSlots((prev) => {
      const next = [...prev];
      const old = next[index];
      const order = old?.source ? old.sourceOrder : nextSourceOrder.current++;
      const role = old?.role ?? ROLE_ORDER[index] ?? 'accent';
      // Editing an existing role is an explicit user decision about that role.
      // Adding into an empty slot remains role-inferable until the user accepts/fixes it.
      const roleLocked = Boolean(old);
      next[index] = decorate(h, role, true, preferred, order, undefined, 'user', roleLocked);
      return inferRoles(next);
    });
  }, [inferRoles]);

  const removeColor = useCallback((index: number) => {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = null;
      return inferRoles(next);
    });
  }, [inferRoles]);

  const reset = useCallback(() => {
    nextSourceOrder.current = 0;
    setSuggestions({});
    setSuggestionsPending(false);
    setSlots(EMPTY);
  }, []);

  const reorder = useCallback((from: number, to: number) => {
    setSlots((prev) => {
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      while (arr.length < 5) arr.push(null);
      return arr.slice(0, 5);
    });
  }, []);

  const sortLightDark = useCallback(() => {
    setSlots((prev) => {
      const f = (prev.filter(Boolean) as Swatch[]).sort((a, b) => rgbToOklch(b.hex).L - rgbToOklch(a.hex).L);
      return [...f, ...Array(5 - f.length).fill(null)] as Slots;
    });
  }, []);

  const sortByRole = useCallback(() => {
    setSlots((prev) => {
      const f = (prev.filter(Boolean) as Swatch[]).sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role));
      return [...f, ...Array(5 - f.length).fill(null)] as Slots;
    });
  }, []);

  const canSwapPrimarySecondary = useMemo(() =>
    filled.some((c) => c.role === 'primary') && filled.some((c) => c.role === 'secondary'),
  [filled]);

  /**
   * Swap Primary <-> Secondary without changing either HEX value.
   * This is an explicit semantic design decision, so both affected swatches become
   * protected + role-locked. A later Complete palette run must solve around the swap.
   */
  const swapPrimarySecondary = useCallback(() => {
    setSlots((prev) => {
      const next = prev.map((c) => (c ? { ...c } : null)) as Slots;
      const primaryIndex = next.findIndex((c) => c?.role === 'primary');
      const secondaryIndex = next.findIndex((c) => c?.role === 'secondary');
      if (primaryIndex < 0 || secondaryIndex < 0) return prev;

      const lockIntoRole = (swatch: Swatch, role: Role): Swatch => {
        const roleWhy = `You explicitly swapped this color into the ${ROLE_LABEL[role]} role. Its exact HEX and semantic role are now locked, so Complete palette must optimize the remaining roles around this decision.`;
        const derivation: ColorDerivation = swatch.derivation
          ? { ...swatch.derivation, roleWhy }
          : {
              kind: 'source',
              strategy: 'Manual role swap',
              summary: `Role changed by you; ${swatch.hex} itself was not modified.`,
              roleWhy,
              basedOn: [swatch.hex],
              evidence: { roleFit: Number(roleFit(swatch.hex, role).toFixed(3)) },
            };
        return {
          ...swatch,
          role,
          source: true,
          roleLocked: true,
          sourceOrder: swatch.sourceOrder ?? nextSourceOrder.current++,
          origin: 'role-swap',
          derivation,
        };
      };

      next[primaryIndex] = lockIntoRole(next[primaryIndex] as Swatch, 'secondary');
      next[secondaryIndex] = lockIntoRole(next[secondaryIndex] as Swatch, 'primary');
      return next;
    });
  }, []);

  const fix = useCallback(() => {
    if (!sources.length) return;
    const started = performance.now();
    const built = buildPalette(sources, lockedRoles);
    emitPerformanceMetric('completePalette', performance.now() - started, { sourceCount: sources.length, lockedRoleCount: Object.keys(lockedRoles).length });
    const byOrder = new Map<number, Swatch>();
    sourceSwatches.forEach((c, i) => byOrder.set(i, c));
    const mapped: Swatch[] = built.items.map((it) => {
      if (it.source && it.sourceOrder != null) {
        const source = byOrder.get(it.sourceOrder);
        if (source) return { ...source, role: it.role, derivation: source.derivation ?? it.derivation };
      }
      return decorate(it.hex, it.role, false, null, undefined, it.derivation, 'solver', false);
    });
    mapped.sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role));
    const next: Slots = [...mapped];
    while (next.length < 5) next.push(null);
    setSlots(next.slice(0, 5));
  }, [sourceSignature, lockSignature, sources, lockedRoles, sourceSwatches]);

  const addOption = useCallback((role: Role, option: HarmonyOption) => {
    setSlots((prev) => {
      const next = [...prev];
      let i = next.findIndex((c) => c && c.role === role && !c.source);
      if (i < 0) i = next.findIndex((c) => !c);
      if (i < 0) i = next.findIndex((c) => c && !c.source);
      if (i < 0) return prev;
      const derivation: ColorDerivation = {
        kind: 'generated', strategy: option.model, summary: option.reason,
        roleWhy: `You accepted this ranked ${role} candidate. It is now a protected role decision: future Complete palette runs must solve around it instead of replacing it.`,
        basedOn: option.basedOn || sources,
        transform: option.transform,
        evidence: { roleFit: Number(roleFit(option.hex, role).toFixed(3)), candidateScore: option.score ? Number(option.score.toFixed(2)) : undefined },
      };
      // Clicking a suggestion is a user decision. Protect BOTH the exact color and
      // the role so Complete palette cannot silently remove it.
      next[i] = decorate(option.hex, role, true, null, nextSourceOrder.current++, derivation, 'suggestion', true);
      return inferRoles(next);
    });
  }, [sourceSignature, sources, inferRoles]);

  // V15.4 performance contract: ranking harmony suggestions is expensive because each
  // candidate is evaluated inside a completed palette. Never do that synchronously
  // during React render. Vite bundles this module worker separately, keeping Primary /
  // Secondary selection responsive while suggestions are ranked in parallel.
  useEffect(() => {
    const id = ++suggestionRequestId.current;
    setSuggestions({});
    if (!sources.length) { setSuggestionsPending(false); return; }
    setSuggestionsPending(true);
    const suggestionStarted = performance.now();
    let disposed = false;

    const commit = (result: Partial<Record<Role, HarmonyOption[]>>) => {
      if (disposed || id !== suggestionRequestId.current) return;
      setSuggestions(result);
      setSuggestionsPending(false);
      emitPerformanceMetric('suggestions', performance.now() - suggestionStarted, { sourceCount: sources.length, lockedRoleCount: Object.keys(lockedRoles).length });
    };

    if (typeof Worker !== 'undefined') {
      const worker = new Worker(new URL('../workers/harmonySuggestions.worker.ts', import.meta.url), { type: 'module' });
      worker.onmessage = (event: MessageEvent<{ id: number; suggestions: Partial<Record<Role, HarmonyOption[]>> }>) => {
        if (event.data.id === id) commit(event.data.suggestions);
        worker.terminate();
      };
      worker.onerror = () => {
        worker.terminate();
        // A worker failure should never lock the UI. Fall back after the current paint.
        window.setTimeout(() => {
          if (disposed) return;
          const fallbackCtx = context(sources, lockedRoles);
          const result: Partial<Record<Role, HarmonyOption[]>> = {};
          SUGGESTION_ROLES.forEach((role) => { result[role] = optionsFor(role, fallbackCtx); });
          commit(result);
        }, 0);
      };
      worker.postMessage({ id, sources, lockedRoles, roles: SUGGESTION_ROLES });
      return () => { disposed = true; worker.terminate(); };
    }

    // Test environments / older browsers without Worker support: defer until after
    // the paint instead of blocking the input event itself.
    const timer = window.setTimeout(() => {
      if (disposed) return;
      const fallbackCtx = context(sources, lockedRoles);
      const result: Partial<Record<Role, HarmonyOption[]>> = {};
      SUGGESTION_ROLES.forEach((role) => { result[role] = optionsFor(role, fallbackCtx); });
      commit(result);
    }, 0);
    return () => { disposed = true; window.clearTimeout(timer); };
  }, [sourceSignature, lockSignature]);

  const optionsForRole = useCallback((role: Role) => suggestions[role] ?? [], [suggestions]);

  return {
    slots, filled, sourceSwatches, sources, lockedRoles, ctx, isComplete, previewReady,
    suggestionsPending,
    setColor, removeColor, reset, reorder,
    sortLightDark, sortByRole, swapPrimarySecondary, canSwapPrimarySecondary, fix, addOption, optionsForRole,
  };
}

export { displayName };

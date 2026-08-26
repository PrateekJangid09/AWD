# WebPalette Studio

**Website Color System Builder by AllWebsites.design**

WebPalette Studio turns one to five existing brand colors into a complete five-role website color system while protecting the colors the user deliberately chose.

The current deterministic engine is v15.5 and includes relationship-aware role inference, OKLab / OKLCH reasoning, whole-system scoring, beam-search completion, explainable generated colors and protected semantic decisions.

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

Tests:

```bash
npm test
```

## Product model

The public system uses five fixed roles:

- Primary
- Secondary
- Light Neutral
- Dark Neutral
- Accent

User-facing decision states are:

- **Your color** — a manually chosen protected HEX value
- **Chosen** — a generated suggestion explicitly accepted by the user
- **Role locked** — an explicit semantic role decision, including Primary / Secondary swaps
- **Generated** — a replaceable supporting color created by the solver

## Core workflow

1. Add one to five existing brand colors.
2. See their inferred website roles.
3. Preview the incomplete palette honestly, without hidden repair colors.
4. Complete the missing roles around protected decisions.
5. Compare Before / After on the same website composition.
6. Inspect Analysis and website contrast relationships.
7. Copy semantic CSS variables.

## Engine entry points

- `src/lib/harmony.ts` — relationship analysis, candidate generation, beam search, derivation traces
- `src/lib/scoring.ts` — functional contrast and website-readiness scoring
- `src/lib/color.ts` — sRGB / OKLab / OKLCH color science
- `src/hooks/usePalette.ts` — React state bridge and protected-decision behavior

### Complete a palette

```ts
import { buildPalette } from './src/lib/harmony'

const result = buildPalette(['#6C63FF', '#FFF6F1'])
console.log(result.items)
```

Each generated swatch includes `derivation` evidence explaining why it exists.

### Analyze without completion

```ts
import { analyzeSources } from './src/lib/harmony'

const analysis = analyzeSources(['#CFFF04', '#632DE9'])
console.log(analysis.label)
```

## Interaction contract

- Manually entered colors are protected.
- Accepted suggestions become protected, role-locked decisions.
- Primary / Secondary swaps change the semantic jobs without changing either HEX value.
- **Complete palette** must solve around protected exact colors and protected roles.
- Automatically generated support colors remain replaceable.
- The incomplete preview never silently invokes the completion engine.

## Public MVP direction

The UI uses a soft neutral canvas, restrained glassmorphism and Satoshi typography. AllWebsites.design orange is reserved for small brand details so the user's own palette remains the dominant visible color.

The product is positioned as a **Website Color System Builder**, not a generic palette generator.

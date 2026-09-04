# Palette Fixer V15 — Explainable Relationship Solver

## Product contract

A source color is a taste decision, not raw material for the engine to overwrite.

The solver therefore tries to complete the missing website roles with the **smallest useful intervention** while preserving the source relationship and making the result functional.

## Pipeline

1. Normalize source colors.
2. Convert to OKLCH / OKLab.
3. Detect structurally valid light and dark neutrals.
4. Preserve user selection order as brand intent.
5. Classify the source relationship: Neutral-led, Single hue, Monochromatic, Analogous, Related, Split/Wide, Near-complementary, Triadic or Multi-hue.
6. Choose a relationship-specific generation strategy.
7. Generate role-specific candidate pools.
8. Beam-search complete five-role systems.
9. Score whole palettes, not isolated swatches.
10. Return the strongest non-destructive system **plus a derivation trace for every color**.

## V15 rule: tone before new hue

For Single / Monochromatic / Analogous systems, V15 tries tonal and near-hue solutions first.

A new hue family is considered a higher-intervention fallback. Precision 137.5°, split and complementary transforms still exist, but they no longer win merely because they are far away on the color wheel.

For Split / Near-complementary / Triadic / Multi-hue systems, hue economy is even stricter: the source already contains enough hue diversity, so accents are normally derived from existing brand families.

## Candidate objective

The solver combines:

- functional contrast progress
- number of real website relationships passing
- accessible unordered palette pairs
- role completeness
- light/dark neutral fitness
- accent utility
- tonal hierarchy
- perceptual separation
- relationship preservation
- hue economy / intervention cost

Threshold bonuses are used for hard functional gates such as 4+ accessible pairs and a usable generated accent. This prevents a mathematically elegant but practically incomplete palette from winning.

## Explainability payload

Every returned swatch can include:

- source vs generated origin
- generation strategy
- plain-English reason
- functional role reason
- source color(s) it was derived from
- ΔHue / ΔLightness / chroma scale where applicable
- OKLCH role-fit score
- best text contrast
- contrast against the Light Neutral
- nearest-source ΔEOK and hue distance
- top alternatives considered

This payload powers the Analysis tab and the “Why?” action on every color.

## Preview contract

Preview never calls the solver to hide an unfinished palette.

- 2 / 3 / 4 current colors = preview exactly those current colors
- repaired 5-role palette = preview the actual completed system
- a five-role palette repaired from **one surviving source color is always previewable**

This explicitly fixes the remove-source → Fix Palette → Preview regression.


## Accepted suggestion contract

A suggestion stops being "just an engine candidate" the moment the user clicks it.

Palette Fixer tracks three origins:

- **SOURCE** — manually entered/picked by the user; protected.
- **SELECTED** — originally proposed by the engine, explicitly accepted by the user; protected **and role-locked**.
- **GENERATED** — created automatically by Fix Palette; replaceable on the next solve.

A subsequent `Fix Palette` call receives SELECTED colors as hard role constraints. The solver must preserve both the exact HEX and semantic role, then optimize only the remaining roles around them.

This prevents the destructive UX where a user chooses one of the ranked Dark Neutral / Accent suggestions and the next repair silently deletes that decision.


## Manual semantic role swap

Primary and Secondary can be swapped without changing either HEX value. A swap is treated as an explicit user design decision:

- Primary becomes Secondary and Secondary becomes Primary.
- Exact colors remain unchanged.
- Both swapped roles become protected and role-locked.
- `Fix Palette` must solve the remaining roles around the swap rather than reverting it.
- Sorting the UI never affects this semantic decision.

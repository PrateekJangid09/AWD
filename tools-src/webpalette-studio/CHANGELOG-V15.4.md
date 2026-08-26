# Palette Fixer V15.4

## Semantic on-surface foreground logic

- Added `resolveOnSurface()` to choose foregrounds from the palette's own Light Neutral / Dark Neutral roles.
- Large display text uses perceptual surface polarity (light-on-dark, dark-on-light) when the preferred foreground reaches a 3:1 floor.
- Normal supporting text remains accessibility-first at 4.5:1.
- The BLOCK / FORM hero now uses the display resolver for the hero heading and an accessibility-first resolver for supporting copy.
- Secondary, accent and dark full-color surfaces use the same semantic resolver in completed palettes.

## Primary / Secondary selection performance

- Harmony suggestion ranking no longer runs synchronously during React render.
- Added a Vite module Web Worker for expensive ranked suggestions.
- Memoized palette sources, locks and analysis context to eliminate repeated derivation work.
- Health UI shows a lightweight “Ranking palette-aware suggestions…” state while the worker finishes.
- Fix Palette still runs deterministically on explicit click; only passive suggestion ranking moved off the main UI thread.

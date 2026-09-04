# Palette Fixer V15.5

## Primary / Secondary semantic swap

- Added a `Primary ⇄ Secondary` control beside palette tools.
- The swap changes semantic roles only; neither HEX value is modified.
- A manual swap is treated as an explicit protected design decision.
- Both affected colors become role-locked so a later `Fix Palette` run cannot silently revert the swap.
- Analysis now labels swapped colors as `Role swapped · locked` and explains the decision.
- Swapped colors show a `SWAPPED` state in palette cards.
- Sorting Light → Dark or Role order does not alter the semantic swap.
- Added a regression test covering swap → Fix Palette persistence.

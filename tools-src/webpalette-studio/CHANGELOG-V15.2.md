# Palette Fixer V15.2

## Fixed: accepted suggestions are no longer overwritten

Previously, choosing one of the ranked Dark Neutral / Accent suggestions inserted a generated swatch. Pressing **Fix Palette** could then replace it because the engine still considered it disposable.

V15.2 changes the state contract:

- **SOURCE** = user-entered/picked color; protected.
- **SELECTED** = suggestion explicitly accepted by the user; protected and role-locked.
- **GENERATED** = automatic repair output; replaceable.

The relationship solver now accepts hard role locks. If the user selects an Accent suggestion, the next repair must preserve that exact HEX as Accent and solve the remaining roles around it.

## Brand update

Product chrome now uses:

- `#FFFCF4` cream
- `#FF6112` orange

The supplied AW logo is included in `public/` and used in the header/favicon.

The user's palette preview remains optically honest and is not recolored with the product brand.

## Validation

- Core color-engine TypeScript compilation: passed.
- 120 named-color regression sample: 0 health failures.
- Locked Dark/Accent suggestion sample set: 0 preservation failures.
- Locked-role canonical check: exact selected HEX and role preserved.
- React/TSX syntax parse pass: no syntax parse diagnostics.
- Full React/Vitest execution still requires `npm install`.


> Note: V15.3 rolls back only the V15.2 orange/cream visual theme. The locked-suggestion behavior remains.

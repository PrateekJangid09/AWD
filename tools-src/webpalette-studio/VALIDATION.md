# V15 validation notes

- Engine library TypeScript compiled successfully in isolation.
- TS/TSX syntax pass: 22 source/test files, 0 syntax diagnostics.
- 1,127 / 1,127 named single-color inputs produced healthy five-role systems.
- Canonical source-preservation cases retained every supplied source HEX unchanged.
- `#6C63FF + #FFF6F1` is classified as Single hue and produces a tonal violet accent rather than an unrelated green.
- Regression simulation: 2 sources → repair → remove one source → repair from surviving source restores 5 unique roles and is preview-ready.
- 220 deterministic 3-source stress cases: 0 completion failures and 0 source-preservation failures. Some protected multi-source combinations intentionally remain below perfect health when the user colors themselves make a perfect score impossible.

The full Vite/Vitest dependency install was not available in the build container, so the package includes the test suite for normal local `npm install && npm test` execution.

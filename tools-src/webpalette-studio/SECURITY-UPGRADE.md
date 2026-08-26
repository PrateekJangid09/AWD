# Palette Fixer V15.1 security-tooling update

This patch removes the stale Vite 5 / Vitest 2 lockfile and pins the development toolchain to:

- Vite 6.4.3
- Vitest 3.2.7
- @vitejs/plugin-react 4.3.4
- TypeScript 5.6.3

Testing-only packages (`jsdom` and Testing Library) are devDependencies instead of runtime dependencies.

## Install

Use Node 20+ and run:

```bash
npm install
npm run typecheck
npm test
npm run build
npm audit
```

Do **not** use `npm audit fix --force` to jump this project to Vite 8 automatically. Major Vite upgrades should be deliberate and tested separately.

The previous `package-lock.json` was intentionally removed because it locked vulnerable Vite/esbuild-era transitive packages. `npm install` will create a fresh lockfile from the exact versions in `package.json`.

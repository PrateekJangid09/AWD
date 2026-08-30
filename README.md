# AllWebsites.Design

The Website Design Research Archive — a Next.js 15 site for browsing curated website-design references by industry, style, colour, typography, and technology.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm start
```

## Deploy to Vercel

1. Import this GitHub repository in [Vercel](https://vercel.com/new).
2. Framework Preset: **Next.js** (auto-detected).
3. Root Directory: `.` (repository root).
4. Build Command: `npm run build`.
5. Deploy.

No environment variables are required for the current build.

`/privacy` and `/cookies` permanently redirect to `/privacy-policy` and `/cookie-preference`. Tool routes under `/tools/*` rewrite to static HTML in `public/tools`.

The archive currently publishes **477** extracted website records (ignored domains from the source pack are not listed). Each record uses the RankBeaver slug template at `/archive/<slug>`.

## Adding a website record

Drop a canonical JSON file at `content/sites/<slug>.json` and screenshots at `public/sites/<slug>/` (`desktop.webp`, `about.webp`, …). Records are discovered at build time — no code change required.

Extractor preview HTML can be converted with:

```bash
python3 scripts/import-previews.py
```

## Project structure

- `app/` — Next.js App Router pages
- `components/` — shared UI
- `content/sites/` — canonical website records
- `lib/` — archive data and canonical loaders
- `public/tools/` — shipped design tools
- `public/sites/` — record screenshots
- `tools-src/webpalette-studio/` — WebPalette source

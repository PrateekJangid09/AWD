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

The archive currently publishes **304** extracted website records (ignored and removed domains are not listed). Each record uses the RankBeaver slug template at `/archive/<slug>`.

## Adding a website record

Drop a canonical JSON file at `content/sites/<slug>.json` and screenshots at `public/sites/<slug>/` (`desktop.webp`, `about.webp`, …). Records are discovered at build time — no code change required.

Extractor preview HTML can be converted with:

```bash
python3 scripts/import-previews.py
```

## Publishing to the journal

Journal posts live in two places: metadata in `lib/journal.ts` and the body in
`content/journal/<slug>.tsx`, registered in `content/journal/index.ts`. The
sitemap, HTML site map, footer and `llms.txt` pick up published posts
automatically; drafts carry `noindex` and are excluded from the sitemap.

Every statistic a post quotes is computed in `lib/insights.ts` from
`content/sites/*.json` at build time and carries its sample size, so a figure
cannot drift away from the archive behind it.

## SEO and AEO acceptance gate

`docs/page-acceptance-checklist.md` is the definition of done for any page. The
machine checkable parts run as a script:

```bash
npm run build
npm start -- -p 4360 &
npm run seo:check -- --base http://localhost:4360 --all
```

It checks robots, canonicals, title and description length, H1 count, Open
Graph, JSON-LD validity, that `FAQPage` questions are visible on the page, image
alt attributes, internal link counts, AI crawler access in `robots.txt` and that
`llms.txt` resolves. It exits non-zero on failure.

## Project structure

- `app/` — Next.js App Router pages
- `components/` — shared UI
- `content/sites/` — canonical website records
- `content/journal/` — journal article bodies
- `docs/` — page acceptance checklist and reindex runbook
- `lib/` — archive data, canonical loaders, SEO helpers and computed insights
- `scripts/seo-check.mjs` — the acceptance gate
- `public/tools/` — shipped design tools
- `public/sites/` — record screenshots
- `tools-src/webpalette-studio/` — WebPalette source

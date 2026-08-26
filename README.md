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

No environment variables are required for the current static/content build.

The `/tools/*` routes are rewritten to static HTML in `public/tools` (Colorhyme, Mockupalettes, Chromary, TrueGradient, WebPalette).

## Project structure

- `app/` — Next.js App Router pages
- `components/` — shared UI
- `lib/data.ts` — categories, site records, and archive stats
- `public/tools/` — shipped design tools
- `tools-src/webpalette-studio/` — WebPalette source (built output lives in `public/tools/webpalette`)

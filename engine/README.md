# Local intelligence engine — AllWebsites.design
#
# Run this on your machine. Private SQLite profiles stay local.
# Export allowlisted JSON into the parent repo for public page templates.

## Quick start

```bash
cd engine
cp .env.example .env   # set ADMIN_SECRET and SESSION_SECRET
npm install
npx playwright install chromium   # optional; enables screenshots

# Demo rows (offline) or live crawl:
npm run seed
# npm run seed -- https://linear.app

# Start local server (binds 127.0.0.1 by default)
npm start
# Gallery:  http://127.0.0.1:3000/
# Admin:    http://127.0.0.1:3000/admin
```

## Local workflow (recommended for large lists)

1. Put URLs in a CSV (header `url` / `website` / `domain`, or one URL per line).
2. Run the private engine on your laptop:

```bash
node scripts/import.js sites.csv --no-shot          # fast classify-first
node scripts/import.js sites.csv --concurrency=3    # with screenshots
node scripts/import.js sites.csv --reanalyze        # refresh existing
```

3. Export **public** fields into the shared repo (for page templates later):

```bash
npm run export
# writes ../data/engine-sites.json  (allowlisted only — no evidence/profile)
npm run export -- --copy-shots      # also copies screenshots to ../public/engine-shots
```

4. Build website template pages from `data/engine-sites.json` (Next.js or engine `site.html`).

**Never commit** `data/allwebsites.db` — it contains full private intelligence profiles.

## Security model

| Surface | Access |
|---------|--------|
| `GET /api/sites`, `/api/facets`, `/api/sites/:domain` | Public read-only allowlist |
| `POST /api/admin/analyze`, `/batch`, `/reanalyze`, job polls, `/site/:domain/internal` | Admin only |
| `/admin` | Admin session (HttpOnly cookie) or login page |
| Legacy `/api/analyze`, `/api/job`, `/api/batch` | Removed (404) |

Auth:

- Env: `ADMIN_SECRET`, `SESSION_SECRET` (never put these in frontend JS).
- Browser: `POST /api/admin/login` `{ "secret": "..." }` → HttpOnly `SameSite=Lax` cookie.
- CLI/curl: `Authorization: Bearer <ADMIN_SECRET>`.

Public JSON never includes `profile`, `evidence`, confidence metadata, candidates, `_debug`, etc.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm start` | Local Express server |
| `npm run seed` | Seed demo / crawl URLs |
| `npm run export` | Write public `data/engine-sites.json` |
| `npm run check` | Re-check stored domains |
| `npm test` | Taxonomy + leakage/auth tests |

## Notes

- Default bind is `127.0.0.1` (`HOST` / `PORT` overridable).
- Pipeline algorithms under `src/pipeline/` are proprietary — keep this repo private.
- The public directory UI no longer runs analysis; use `/admin` or CLI.

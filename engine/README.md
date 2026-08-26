# Local intelligence engine — AllWebsites.design

Run this **on your Windows/Mac machine**. It is not a Vercel/cloud service.
Private SQLite profiles stay on disk. Public records are exported into the Next.js app as **slug pages** at `/sites/<domain>`.

## Windows PowerShell (from scratch)

The engine is **inside the AWD repo**, not in `C:\Users\DIKSHA`.

```powershell
cd C:\Users\DIKSHA
git clone -b cursor/secure-engine-local-export-8772 https://github.com/PrateekJangid09/AWD.git
cd AWD\engine
Copy-Item .env.example .env
notepad .env
```

Set `ADMIN_SECRET` and `SESSION_SECRET` in `.env`, save, then:

```powershell
npm install
node scripts\import.js data\final-list.csv --no-shot --concurrency=4
npm run export -- --copy-shots
```

That writes:

- `C:\Users\DIKSHA\AWD\data\engine-sites.json`  (public fields only)
- `C:\Users\DIKSHA\AWD\public\engine-shots\`    (screenshots, if captured)

Then start the **website** (not the engine) to see slug pages:

```powershell
cd C:\Users\DIKSHA\AWD
npm install
npm run dev
```

Open:

- Directory: http://localhost:3000/
- One site: http://localhost:3000/sites/linearly.app  (slug = domain)

## What not to run in the cloud

- Do not deploy `engine/` to Vercel. `.vercelignore` excludes it.
- Do not expect Cursor Cloud to crawl 5,800 sites for you on a laptop path.
- The Vercel site only reads `data/engine-sites.json` after you export locally and commit/push that JSON (optional).

## Optional: engine admin UI

```powershell
cd C:\Users\DIKSHA\AWD\engine
npm start
```

- Gallery preview: http://127.0.0.1:3000/
- Admin: http://127.0.0.1:3000/admin

If the Next.js app is already on port 3000, set `PORT=3456` in `engine\.env`.

**Never commit** `engine/data/allwebsites.db`.

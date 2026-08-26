# Local engine → 5,800 dedicated pages

The extractor is the **backend**. The public site only shows final datapoints.

```text
CSV of URLs
  → engine/scripts/import.js   (background, private)
  → SQLite full profile         (never public)
  → npm run export              (allowlisted JSON)
  → Next.js pages
      allwebsites.design/category/saas/rankbeaver
```

Example: extract rankbeaver.com → page at:

`/category/saas/rankbeaver`

showing fonts, color scheme, tech stack, category, subcategory, website type, etc.

## Run extraction (your PC)

```powershell
cd C:\Users\DIKSHA\AWD
git checkout cursor/secure-engine-local-export-8772
cd engine
Copy-Item .env.example .env
npm install
node scripts\import.js data\final-list.csv --no-shot --concurrency=4
npm run export -- --copy-shots
cd ..
npm install
npm run dev
```

Then open:

`http://localhost:3000/category/saas/rankbeaver`

(Use the real category + brand slug from the export.)

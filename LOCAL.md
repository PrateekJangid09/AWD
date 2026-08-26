# Run the engine on your PC (not in the cloud)

Cursor Cloud / Vercel will **not** crawl your 5,800 URLs. Clone the repo and run locally.

```powershell
cd C:\Users\DIKSHA
git clone -b cursor/secure-engine-local-export-8772 https://github.com/PrateekJangid09/AWD.git
cd AWD\engine
Copy-Item .env.example .env
# set ADMIN_SECRET and SESSION_SECRET in .env
npm install
node scripts\import.js data\final-list.csv --no-shot --concurrency=4
npm run export -- --copy-shots
cd ..
npm install
npm run dev
```

Then open a slug page:

`http://localhost:3000/sites/<domain>`

Example: `http://localhost:3000/sites/onepagelove.com`

Full notes: [engine/README.md](engine/README.md)

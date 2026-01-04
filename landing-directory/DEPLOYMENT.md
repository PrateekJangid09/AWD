# Deployment Guide 🚀

Complete guide to deploy AllWebsites.Design to production.

## Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] Generated screenshots (at least test batch)
- [ ] Updated placeholder URLs in CSV (optional, but recommended)
- [ ] Tested locally (`npm run dev`)
- [ ] Verified no linting errors (`npm run lint`)
- [ ] Set up Git repository (if deploying to Vercel/Netlify)

## Option 1: Deploy to Vercel (Recommended)

### Why Vercel?
- ✅ Built for Next.js
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Zero configuration
- ✅ Free tier available

### Step-by-Step

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from Project Directory**
   ```bash
   cd landing-directory
   vercel
   ```

4. **Follow the Prompts**
   - Set up and deploy? **Yes**
   - Which scope? **Your account**
   - Link to existing project? **No**
   - Project name? **allwebsites-design** (or your choice)
   - Directory? **./
   - Override settings? **No**

5. **Wait for Deployment**
   - Vercel will build and deploy
   - You'll get a preview URL
   - Screenshots will be generated during build

6. **Production Deployment**
   ```bash
   vercel --prod
   ```

### Custom Domain Setup

1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Domains
4. Add your custom domain
5. Update DNS records (Vercel provides instructions)

### Environment Variables

If needed, add in Vercel Dashboard:
```
NEXT_PUBLIC_SITE_URL=https://allwebsites.design
```

## Option 2: Deploy to Netlify

### Step-by-Step

1. **Install Netlify CLI**
   ```bash
   npm i -g netlify-cli
   ```

2. **Build the Project**
   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy
   ```

4. **For Production**
   ```bash
   netlify deploy --prod
   ```

### Netlify Configuration

Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

## Option 3: Self-Hosting

### Using Node.js Server

1. **Build the Project**
   ```bash
   npm run build
   ```

2. **Start Production Server**
   ```bash
   npm run start
   ```

3. **Use Process Manager (PM2)**
   ```bash
   npm i -g pm2
   pm2 start npm --name "landing-directory" -- start
   pm2 save
   pm2 startup
   ```

### Using Docker

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t landing-directory .
docker run -p 3000:3000 landing-directory
```

## Screenshot Generation in Production

### Option A: Pre-Generate Locally

**Best for**: Small updates, full control

```bash
# Generate all screenshots locally
npm run screenshots

# Commit to git
git add public/screenshots
git commit -m "Add screenshots"
git push

# Deploy
vercel --prod
```

### Option B: Generate During Build

**Best for**: Automated deployments

The `prebuild` script in `package.json` automatically runs screenshots:
```json
"prebuild": "npm run screenshots"
```

**Warning**: This increases build time significantly (~30 mins for 700 sites)

### Option C: Generate On-Demand

**Best for**: Large datasets, dynamic content

1. Remove `prebuild` script
2. Create API route to generate screenshots on-demand
3. Use background job queue (Bull, Agenda)

## Build Optimization

### Reduce Build Time

1. **Skip Screenshots in CI/CD**
   ```json
   "prebuild": "echo 'Skipping screenshots'"
   ```

2. **Use Incremental Static Regeneration**
   ```typescript
   // In app/page.tsx
   export const revalidate = 3600; // Revalidate every hour
   ```

3. **Cache node_modules**
   - Vercel: Automatic
   - Netlify: Automatic
   - Custom: Use build cache

### Optimize Bundle Size

1. **Analyze Bundle**
   ```bash
   npm install -D @next/bundle-analyzer
   ```

2. **Update next.config.ts**
   ```typescript
   import withBundleAnalyzer from '@next/bundle-analyzer';
   
   const config = withBundleAnalyzer({
     enabled: process.env.ANALYZE === 'true',
   })({
     // ... your config
   });
   ```

3. **Run Analysis**
   ```bash
   ANALYZE=true npm run build
   ```

## Post-Deployment

### 1. Verify Deployment

- [ ] Homepage loads correctly
- [ ] Search works
- [ ] Filters work
- [ ] Images load (or fallbacks appear)
- [ ] Links open in new tab
- [ ] Mobile responsive
- [ ] Keyboard navigation works

### 2. Performance Testing

**Lighthouse Audit**:
```bash
npm install -g lighthouse
lighthouse https://your-url.com --view
```

**Target Scores**:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 95+

### 3. SEO Optimization

Add to `app/layout.tsx`:
```typescript
export const metadata: Metadata = {
  title: 'Your Title | Landing Page Directory',
  description: 'Your description',
  keywords: ['landing pages', 'design', 'inspiration'],
  openGraph: {
    title: 'Your Title',
    description: 'Your description',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Your Title',
    description: 'Your description',
    images: ['/og-image.png'],
  },
};
```

### 4. Analytics Setup

**Vercel Analytics**:
```bash
npm install @vercel/analytics
```

In `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 5. Error Monitoring

**Sentry Setup**:
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

## Continuous Deployment

### GitHub Integration

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/landing-directory.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to Vercel Dashboard
   - Import Git Repository
   - Select your repo
   - Deploy

3. **Automatic Deployments**
   - Push to `main` → Production
   - Push to other branches → Preview

## Troubleshooting

### Build Fails on Vercel

**Issue**: Puppeteer can't install
**Solution**: Add to `vercel.json`:
```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next",
      "config": {
        "includeFiles": ["node_modules/puppeteer/.local-chromium/**"]
      }
    }
  ]
}
```

### Screenshots Not Showing

**Issue**: Images not found in production
**Solutions**:
1. Ensure screenshots are in `public/screenshots/`
2. Check `.gitignore` isn't excluding them
3. Verify build logs show screenshot generation
4. Use fallback gradients for missing images

### Slow Build Times

**Issue**: 30+ minute builds
**Solutions**:
1. Pre-generate screenshots locally
2. Skip screenshots in CI/CD
3. Use smaller concurrency in screenshot script
4. Cache build artifacts

### Out of Memory

**Issue**: Build crashes with OOM error
**Solutions**:
1. Reduce screenshot concurrency (5 → 2)
2. Increase Vercel memory (Pro plan)
3. Generate screenshots locally
4. Use serverless functions for screenshots

## Cost Estimation

### Vercel Free Tier
- ✅ 100GB bandwidth/month
- ✅ Unlimited sites
- ✅ 100 build hours/month
- **Perfect for**: Personal projects, demos

### Vercel Pro ($20/month)
- ✅ 1TB bandwidth/month
- ✅ 400 build hours/month
- ✅ Analytics included
- **Perfect for**: Production apps

### Self-Hosted (AWS/DigitalOcean)
- **EC2 t3.micro**: ~$10/month
- **Bandwidth**: ~$0.09/GB
- **Perfect for**: Full control, custom setup

## Security Checklist

- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Environment variables secured
- [ ] No API keys in client code
- [ ] CSP headers configured
- [ ] Rate limiting on API routes

## Backup Strategy

1. **Data Backup**
   - CSV file in version control
   - Screenshots in cloud storage (S3, Cloudinary)

2. **Code Backup**
   - GitHub repository
   - Regular commits

3. **Database Backup** (if using DB in future)
   - Automated daily backups
   - Point-in-time recovery

## Rollback Plan

If deployment fails:

1. **Vercel**: Instant rollback from dashboard
2. **Netlify**: Rollback to previous deploy
3. **Custom**: Keep previous build, reverse proxy switch

## Success! 🎉

Your Landing Page Directory is now live!

### Next Steps

1. Share on social media
2. Submit to directories (Product Hunt, Indie Hackers)
3. Gather user feedback
4. Iterate and improve

---

**Need Help?** Check logs in your deployment platform's dashboard.


# AllWebsites.Design 🚀

A high-performance directory of curated website references with automated screenshot generation, category filtering, and fuzzy search. Built with Next.js 16, TypeScript, and Tailwind CSS.

## ✨ Features

- **Curated Website Archive** - Public counts are generated from the cleaned catalogue rather than hardcoded
- **Smart Filtering** - Horizontal scrollable category pills with real-time counts
- **Fuzzy Search** - Powered by Fuse.js for intelligent search across names, descriptions, and categories
- **Automated Screenshots** - Puppeteer-based screenshot generation with fallback gradients
- **Responsive Design** - Mobile-first grid layout (1-4 columns based on screen size)
- **Performance Optimized** - Next.js Image optimization, lazy loading, and static generation
- **Accessibility** - WCAG 2.1 AA compliant with keyboard navigation and ARIA labels

## 🏗️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Search**: Fuse.js (fuzzy search)
- **Screenshots**: Puppeteer
- **CSV Parsing**: PapaParse
- **Image Optimization**: Sharp

## 📁 Project Structure

```
landing-directory/
├── app/
│   ├── api/websites/route.ts    # API endpoint for website data
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Main directory page
│   └── globals.css               # Global styles
├── components/
│   ├── WebsiteCard.tsx           # Individual website card
│   ├── FilterBar.tsx             # Category filter pills
│   ├── SearchBar.tsx             # Search input with debounce
│   └── Header.tsx                # Site header
├── lib/
│   ├── data.ts                   # CSV parser & data utilities
│   └── utils.ts                  # Helper functions
├── scripts/
│   ├── find-urls.js              # Find placeholder URLs
│   └── generate-screenshots.js   # Generate hero screenshots
├── data/
│   └── websites.csv              # Website data (700+ entries)
└── public/
    └── screenshots/              # Generated screenshots
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- For screenshot generation: Chromium (installed automatically with Puppeteer)

### Installation

1. **Navigate to the project:**
   ```bash
   cd landing-directory
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Generate screenshots (optional - first 5-10 sites for testing):**
   ```bash
   npm run screenshots
   ```
   > ⚠️ This will take time for all 700 sites. For testing, modify the script to process fewer sites.

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📸 Screenshot Generation

The `generate-screenshots.js` script:

1. Reads `data/websites.csv`
2. Launches headless Chromium via Puppeteer
3. Captures 1280x720 screenshots (16:9 ratio)
4. Removes cookie banners automatically
5. Saves as WebP format for optimization
6. Generates fallback gradients on failures

### Fallback Strategy

1. **Primary**: Puppeteer screenshot
2. **Secondary**: Gradient with category color + site name
3. **Tertiary**: Generic placeholder

### Batch Processing

- Processes 5 sites concurrently
- ~5-10 seconds per site
- Total time for 700 sites: ~20-30 minutes

## 🎨 Design System

### Color Palette

Categories are color-coded for quick visual identification:

| Category | Color | Hex |
|----------|-------|-----|
| SaaS | Blue | `#3B82F6` |
| Design Studio | Violet | `#8B5CF6` |
| Fintech | Emerald | `#10B981` |
| E-commerce | Amber | `#F59E0B` |
| Portfolio | Pink | `#EC4899` |
| AI Tool | Indigo | `#6366F1` |

### Typography

- **Hero**: 48px
- **Headings**: 24px
- **Body**: 16px
- **Meta**: 14px

### Responsive Breakpoints

- **Mobile**: 640px (1 column)
- **Tablet**: 768px (2 columns)
- **Laptop**: 1024px (3 columns)
- **Desktop**: 1280px+ (4 columns)

## 🔧 Configuration

### Adding New Categories

Edit `lib/data.ts` and add to the `getCategoryColor()` function:

```typescript
'Your Category': '#HEX_COLOR',
```

### Modifying Screenshot Settings

Edit `scripts/generate-screenshots.js`:

```javascript
await page.setViewport({ width: 1280, height: 720 });
```

## 🔄 Revalidation (ISR)

Pages use **Incremental Static Regeneration**: they revalidate at most every 5 minutes. To refresh content immediately after updating `data/websites.csv` or SEO, use on-demand revalidation.

### 1. Set the secret

In **Vercel** (and locally for testing), add an environment variable:

- **Name:** `REVALIDATE_SECRET`
- **Value:** a long random string (e.g. from `openssl rand -hex 32`)

### 2. Trigger revalidation

**Revalidate homepage only:**
```bash
curl -X POST "https://allwebsites.design/api/revalidate?secret=YOUR_SECRET&path=/"
```

**Revalidate one site page:**
```bash
curl -X POST "https://allwebsites.design/api/revalidate?secret=YOUR_SECRET&path=/sites/my-site-slug"
```

**Revalidate entire site (all cached pages):**
```bash
curl -X POST "https://allwebsites.design/api/revalidate?secret=YOUR_SECRET&path=all"
```

Use GET with the same query params if you prefer. Invalid or missing `secret` returns 401.

## 🐛 Troubleshooting

### Issue: Missing URLs (101 placeholder sites)

**Solution**: Run the URL finder script:
```bash
node ../scripts/find-urls.js
```
This generates `data/missing-urls.json` with sites to research manually.

### Issue: Screenshots failing

**Causes**:
- Site blocks headless browsers
- Cloudflare protection
- Geo-restrictions
- Invalid URLs

**Solution**: Fallback gradients are automatically generated.

### Issue: Out of memory during screenshot generation

**Solution**: Reduce concurrency in `scripts/generate-screenshots.js`:
```javascript
const concurrency = 3; // Reduce from 5 to 3
```

## 📊 Data Format

### CSV Structure

```csv
Name,URL,Category,100-char description
Cursor,https://cursor.com,AI Tool / Developer,"AI code editor..."
```

### Category Format

Categories can be:
- **Single**: `SaaS`, `Fintech`, `Portfolio`
- **Compound**: `SaaS / Analytics`, `AI Tool / Video`

The system automatically extracts the primary category (before `/`) for filtering.

## 🚢 Deployment

### Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Add Environment Variables** (if needed):
   - `NEXT_PUBLIC_SITE_URL`: Your production URL

### Build Command

```bash
npm run build
```

The `prebuild` script automatically runs screenshot generation.

### Performance Targets

- ✅ First Contentful Paint: <1.5s
- ✅ Largest Contentful Paint: <2.5s
- ✅ Cumulative Layout Shift: <0.1
- ✅ Time to Interactive: <3.5s
- ✅ Lighthouse Score: 95+

## 🔒 Security

- All external links open with `rel="noopener noreferrer"`
- No user data collection
- Static generation (no runtime data exposure)
- Screenshots cached locally

## 📝 License

This project is for educational and portfolio purposes.

## 🙏 Credits

- Website data curated from public sources
- Built with modern web technologies
- Designed for performance and accessibility

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the project structure
3. Examine the console for errors

---

**Built with ❤️ for designers and developers**

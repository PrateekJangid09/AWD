# Quick Start Guide 🚀

Get your Landing Page Directory up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
cd landing-directory
npm install
```

## Step 2: Start Development Server

```bash
npm run dev
```

The app will be running at [http://localhost:3000](http://localhost:3000)

## Step 3: Generate Test Screenshots (Optional)

For a quick test with just 10 websites:

1. Open `scripts/generate-screenshots.js`
2. Find the line with the for loop:
   ```javascript
   for (let i = 0; i < websites.length; i += concurrency) {
   ```
3. Change to:
   ```javascript
   for (let i = 0; i < Math.min(10, websites.length); i += concurrency) {
   ```
4. Run:
   ```bash
   npm run screenshots
   ```

## What You'll See

### 1. Homepage
- Search bar at the top
- Horizontal scrolling category filters
- Grid of website cards (responsive)
- Footer with credits

### 2. Category Filters
- **All** - Shows all 700 sites
- **SaaS** - SaaS platforms
- **Design Studio** - Design agencies
- **Fintech** - Financial technology
- **E-commerce** - Online stores
- And 10+ more categories!

### 3. Search Functionality
- Type in the search bar
- Results update in real-time (300ms debounce)
- Searches across: website name, description, category
- Fuzzy matching (handles typos)

### 4. Website Cards
- **Screenshot**: Hero section of the website
- **Category pill**: Color-coded category badge
- **Name**: Website name (1-line truncation)
- **Description**: 100-char description (2-line truncation)
- **Hover effect**: "Visit Site →" button appears
- **Click**: Opens website in new tab

## Keyboard Navigation

- **Tab**: Move between cards
- **Enter**: Open selected website
- **Tab + Shift**: Navigate backwards

## Performance Features

✅ **Lazy Loading**: Images load as you scroll
✅ **WebP Format**: Optimized image format
✅ **Responsive Images**: Different sizes for different screens
✅ **Static Generation**: Fast page loads
✅ **Debounced Search**: Smooth search experience

## Customization

### Change Number of Columns

Edit `app/page.tsx`:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {/* Change xl:grid-cols-4 to xl:grid-cols-5 for 5 columns */}
</div>
```

### Add New Category Color

Edit `lib/data.ts`:
```typescript
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Your Category': '#FF6B6B', // Add your color here
    // ... existing colors
  };
}
```

### Adjust Card Height

Edit `components/WebsiteCard.tsx`:
```tsx
<div className="relative h-[240px] w-full overflow-hidden">
  {/* Change h-[240px] to your desired height */}
</div>
```

## Troubleshooting

### Dev Server Won't Start
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Images Not Loading
- Check that screenshots exist in `/public/screenshots/`
- Fallback gradients will appear if screenshots are missing
- Run `npm run screenshots` to generate them

### Search Not Working
- Make sure Fuse.js is installed: `npm install fuse.js`
- Check browser console for errors

### Styles Not Applying
```bash
# Reinstall Tailwind
npm install -D tailwindcss @tailwindcss/postcss
```

## Next Steps

1. **Generate All Screenshots**: Run `npm run screenshots` (takes ~30 mins)
2. **Update Placeholder URLs**: Edit `data/websites.csv` to replace `impossiblefoods.com` URLs
3. **Deploy to Vercel**: Run `vercel` in the project directory
4. **Add Analytics**: Integrate Vercel Analytics or Google Analytics
5. **SEO Optimization**: Add meta tags in `app/layout.tsx`

## Common Commands

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Build for production
npm run start              # Start production server

# Screenshots
npm run screenshots        # Generate all screenshots

# Linting
npm run lint              # Check for code issues
```

## File Locations

- **Website Data**: `data/websites.csv`
- **Screenshots**: `public/screenshots/`
- **Components**: `components/`
- **Main Page**: `app/page.tsx`
- **API Route**: `app/api/websites/route.ts`

## Tech Stack Quick Reference

| Technology | Purpose |
|-----------|---------|
| Next.js 15 | React framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Puppeteer | Screenshots |
| Fuse.js | Search |
| PapaParse | CSV parsing |
| Sharp | Image optimization |

## Support

- **Issues**: Check `README.md` troubleshooting section
- **Customization**: See component files in `components/`
- **Data**: Edit `data/websites.csv`

Happy coding! 🎉


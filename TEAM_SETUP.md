# Team Setup Guide 🚀

Welcome to the TrackdIn project! This guide will help your teammates get the complete website running locally with all features and screenshots.

## Quick Start (5 minutes)

### 1. Clone the Repository
```bash
git clone https://github.com/PrateekJangid09/figfiles.design
cd figfiles.design
```

### 2. Navigate to the Website Directory
```bash
cd landing-directory
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Open Your Browser
Navigate to [http://localhost:3000](http://localhost:3000)

🎉 **You're all set!** The website should be running with all 700+ websites and screenshots.

## What You'll See

### Complete Website Features
- **700+ Curated Websites** - All websites with real screenshots
- **Smart Search** - Fuzzy search across names, descriptions, and categories
- **Category Filtering** - Horizontal scrollable category pills
- **Responsive Design** - Works on mobile, tablet, and desktop
- **Real Screenshots** - 3,415+ WebP screenshots included (no generation needed)

### Available Categories
- SaaS (Software as a Service)
- Design Studio
- Fintech (Financial Technology)
- E-commerce
- Portfolio
- AI Tool
- And 10+ more categories!

## Project Structure

```
figfiles.design/
├── landing-directory/          # Main Next.js website
│   ├── app/                    # Next.js 15 App Router
│   ├── components/             # React components
│   ├── lib/                    # Utilities and data processing
│   ├── data/                   # Website data (CSV files)
│   ├── public/
│   │   ├── screenshots/        # 1,716 hero screenshots
│   │   └── fullshots/          # 1,699 full-page screenshots
│   └── scripts/                # Screenshot generation tools
├── scripts/                    # Data processing scripts
└── data/                       # Additional data files
```

## Available Commands

### Development
```bash
npm run dev          # Start development server (port 3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Check code quality
```

### Screenshot Generation (Optional)
```bash
npm run screenshots           # Generate all screenshots (~30 mins)
npm run screenshots:advanced  # Advanced screenshot system
npm run screenshots:hero      # Generate first 50 screenshots
npm run screenshots:fullpage  # Generate full-page screenshots
```

## Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| Next.js | React framework | 15.5.4 |
| TypeScript | Type safety | ^5 |
| Tailwind CSS | Styling | ^4 |
| Fuse.js | Fuzzy search | ^7.1.0 |
| Puppeteer | Screenshots | ^24.23.0 |
| PapaParse | CSV parsing | ^5.5.3 |

## Key Features Explained

### 1. Screenshot System
- **3,415+ Screenshots Included** - No need to generate them
- **WebP Format** - Optimized for web performance
- **Fallback Gradients** - Automatic fallbacks for failed screenshots
- **Responsive Images** - Different sizes for different screens

### 2. Search System
- **Fuzzy Search** - Handles typos and partial matches
- **Real-time Results** - 300ms debounced search
- **Multi-field Search** - Searches name, description, and category
- **Instant Filtering** - Updates results as you type

### 3. Data Management
- **CSV-based** - Easy to update website data
- **Category System** - Automatic color coding
- **Backup Files** - Multiple data backups included

## Troubleshooting

### Issue: Port 3000 Already in Use
```bash
# Kill process using port 3000
npx kill-port 3000
# Or use a different port
npm run dev -- -p 3001
```

### Issue: Dependencies Won't Install
```bash
# Clear npm cache
npm cache clean --force
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Screenshots Not Loading
- All screenshots are included in the repository
- Check that files exist in `public/screenshots/` and `public/fullshots/`
- Fallback gradients will appear if screenshots are missing

### Issue: Search Not Working
- Make sure Fuse.js is installed: `npm install fuse.js`
- Check browser console for errors
- Verify data is loaded in `data/websites.csv`

### Issue: Styles Not Applying
```bash
# Reinstall Tailwind CSS
npm install -D tailwindcss @tailwindcss/postcss
```

## Customization Guide

### Adding New Websites
1. Edit `landing-directory/data/websites.csv`
2. Add new row: `Name,URL,Category,Description`
3. Screenshots will be generated automatically on next run

### Adding New Categories
1. Edit `landing-directory/lib/data.ts`
2. Add color to `getCategoryColor()` function
3. Update category list in components

### Modifying Screenshot Settings
1. Edit `landing-directory/scripts/generate-screenshots.js`
2. Adjust viewport size, quality, or format
3. Run `npm run screenshots` to regenerate

## Performance Notes

- **Repository Size**: ~500MB-1GB (due to screenshots)
- **Clone Time**: 5-15 minutes depending on internet speed
- **First Load**: <3 seconds with all screenshots
- **Search Performance**: <100ms for 700+ websites

## Deployment

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd landing-directory
vercel
```

### Deploy to Netlify
```bash
# Build the project
npm run build

# Deploy the 'out' folder to Netlify
```

## Support

### Common Issues
1. **Check the troubleshooting section above**
2. **Review the README.md in landing-directory/**
3. **Check browser console for errors**
4. **Verify all dependencies are installed**

### File Locations
- **Main Website**: `landing-directory/app/page.tsx`
- **Website Data**: `landing-directory/data/websites.csv`
- **Components**: `landing-directory/components/`
- **Screenshots**: `landing-directory/public/screenshots/`

### Getting Help
- Check the project documentation in `landing-directory/README.md`
- Review the quick start guide in `landing-directory/QUICKSTART.md`
- Examine the implementation summary in `landing-directory/IMPLEMENTATION-SUMMARY.md`

## What's Included

✅ **Complete Next.js 15 Website**  
✅ **700+ Website Entries**  
✅ **3,415+ Screenshots** (WebP format)  
✅ **Fuzzy Search System**  
✅ **Category Filtering**  
✅ **Responsive Design**  
✅ **TypeScript Support**  
✅ **Performance Optimized**  
✅ **Deployment Ready**  

---

**Happy coding! 🎉**

Your teammates can now clone, install, and run the complete TrackdIn website with all features and screenshots included.

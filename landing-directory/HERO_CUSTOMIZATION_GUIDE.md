# Hero Section Customization Guide

## 🎨 Quick Start for Developers

This guide helps you customize the newly redesigned hero section to match your brand and requirements.

---

## 🎯 Common Customizations

### 1. Change Colors

#### Update Brand Colors
Edit `tailwind.config.js`:

```javascript
colors: {
  'deep-pink': '#YOUR_PRIMARY_COLOR',    // Main CTA color
  'dark-teal': '#YOUR_SECONDARY_COLOR',  // Accent color
  'warm-beige': '#YOUR_TERTIARY_COLOR',  // Subtle accents
}
```

#### Update Category Gradients
In `HeroSection.tsx`, find the `CATEGORIES` array:

```typescript
const CATEGORIES = [
  { 
    name: 'Your Category',
    icon: '🎯',
    gradient: 'from-blue-500 via-purple-500 to-pink-500', // Edit this
    count: '100+',
    description: 'Your description'
  },
  // ...
];
```

**Available Tailwind Gradients:**
- `from-{color}-{shade} via-{color}-{shade} to-{color}-{shade}`
- Common colors: blue, purple, pink, emerald, amber, red, teal, indigo
- Shades: 400, 500, 600, 700

---

### 2. Modify Text Content

#### Headline
```typescript
// Line 159
<h1>
  <span>Your First Line</span>
  <span>Your Highlighted Text</span>
</h1>
```

#### Subheadline
```typescript
// Line 178
<p>
  Your custom subheadline text here.
  <span className="text-deep-pink">Highlighted numbers</span>
</p>
```

#### Badge
```typescript
// Line 142
<span>
  {totalWebsites}+ Your Custom Text
</span>
```

---

### 3. Adjust Search Placeholders

```typescript
// Line 45
const placeholders = [
  '🔍 Your first placeholder...',
  '✨ Your second placeholder...',
  '🎯 Your third placeholder...',
  '🚀 Your fourth placeholder...',
  '💡 Your fifth placeholder...',
];
```

**Tips:**
- Keep them under 40 characters
- Use emojis for visual interest
- Suggest actual search terms
- Rotate every 3-4 seconds (line 55)

---

### 4. Change Category Pills

#### Add New Category
```typescript
// Line 23
const CATEGORIES = [
  // ... existing categories
  { 
    name: 'Your Category',
    icon: '🎨', // Pick from emojipedia.org
    gradient: 'from-cyan-500 via-blue-500 to-purple-600',
    count: '50+', // Your count
    description: 'Brief description'
  },
];
```

#### Remove Category
Simply delete the object from the array.

#### Reorder Categories
Drag and drop within the array (order matters for display).

---

### 5. Customize Stats Cards

```typescript
// Line 331
{[
  { 
    label: 'Your Metric',
    value: 'Your Number',
    icon: '🎯',
    gradient: 'from-blue-500 to-indigo-600',
    description: 'Your description'
  },
  // ... more stats
].map((stat, index) => (...))}
```

**Best Practices:**
- Keep to 3 stats (cognitive load)
- Use round numbers (750 vs 749)
- Include units where needed (15+, $1M, 99%)
- Choose relevant emojis

---

### 6. Adjust Featured Showcase

#### Show More/Fewer Items
```typescript
// Line 395
{featuredWebsites.slice(0, 8).map(...)}
//                           ^ Change this number
```

Recommended: 4, 8, 12, or 16 (divisible by 4 for grid)

#### Change Grid Layout
```typescript
// Line 395
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
//                                                         ^ Change these
```

**Grid Options:**
- `grid-cols-2`: 2 columns
- `grid-cols-3`: 3 columns
- `grid-cols-4`: 4 columns
- `grid-cols-6`: 6 columns (for small cards)

---

### 7. Modify Animation Speeds

#### Entrance Animations
```typescript
// Line 82
delayChildren: 0.3, // Initial delay before any animations
staggerChildren: 0.12, // Delay between each child element
```

**Timing Guide:**
- Fast: 0.05-0.1s stagger
- Medium: 0.12-0.15s stagger (default)
- Slow: 0.2-0.3s stagger

#### Background Orbs
```typescript
// Line 123, 133, 143
transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
//                      ^ Change duration (seconds)
```

**Recommendations:**
- 15-20s: Fast, energetic
- 20-30s: Balanced (default)
- 30-45s: Slow, elegant

#### Floating Particles
```typescript
// Line 68
duration={15 + Math.random() * 10}
//        ^ Min + range
```

---

### 8. Customize Hover Effects

#### Card Hover Lift
```typescript
// Line 409
whileHover={{ y: -12, scale: 1.03 }}
//               ^ Lift amount (pixels)
//                       ^ Scale multiplier
```

**Lift Guide:**
- Subtle: -4 to -6px
- Medium: -8 to -12px (default)
- Dramatic: -16 to -20px

#### Category Pill Hover
```typescript
// Line 309
whileHover={{ y: -6, scale: 1.05 }}
```

---

### 9. Adjust Spacing & Sizing

#### Container Padding
```typescript
// Line 113
className="container mx-auto px-4 sm:px-6 lg:px-8"
//                              ^ Adjust these
```

#### Section Gaps
```typescript
// Search to Categories
className="mb-12" // 3rem

// Categories to Stats
className="mb-16" // 4rem

// Stats to Featured
className="mb-20" // 5rem
```

**Spacing Scale:**
- `mb-8`: 2rem (32px)
- `mb-12`: 3rem (48px)
- `mb-16`: 4rem (64px)
- `mb-20`: 5rem (80px)

---

### 10. Mobile Responsiveness

#### Headline Size
```typescript
// Line 159
className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl"
//         ^ Mobile  ^ Small   ^ Medium  ^ Large    ^ XL
```

**Size Scale:**
- 5xl: 48px
- 6xl: 60px
- 7xl: 72px
- 8xl: 96px
- 9xl: 128px

#### Hide on Mobile
```typescript
className="hidden md:block" // Hidden until medium screens
className="md:hidden" // Visible only on mobile
```

---

## 🎨 Advanced Customizations

### 1. Add Custom Background Pattern

```typescript
// After line 110
<div 
  className="absolute inset-0 opacity-10"
  style={{
    backgroundImage: 'url("/your-pattern.svg")',
    backgroundSize: '100px 100px',
    backgroundRepeat: 'repeat'
  }}
/>
```

### 2. Create Custom Gradient

```typescript
// Add to inline styles
style={{
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
}}
```

**Gradient Tools:**
- [CSS Gradient Generator](https://cssgradient.io/)
- [Mesh Gradients](https://meshgradient.com/)
- [Grabient](https://www.grabient.com/)

### 3. Add Parallax Effect

```typescript
// Import at top
import { useTransform } from 'framer-motion';

// In component
const { scrollYProgress } = useScroll();
const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

// Apply to element
<motion.div style={{ y }}>
  Your content
</motion.div>
```

### 4. Custom Mouse Cursor Effect

```typescript
// The component already tracks mouse position
// Use mousePosition state to create effects

<motion.div
  style={{
    x: mousePosition.x / 50, // Parallax based on mouse
    y: mousePosition.y / 50,
  }}
>
  Floating element
</motion.div>
```

### 5. Add Video Background

```typescript
// Replace background div with video
<video
  autoPlay
  loop
  muted
  playsInline
  className="absolute inset-0 w-full h-full object-cover opacity-20"
>
  <source src="/hero-background.webm" type="video/webm" />
  <source src="/hero-background.mp4" type="video/mp4" />
</video>
```

---

## 🛠️ Troubleshooting

### Animations Not Working
```bash
# Check Framer Motion is installed
npm list framer-motion

# Reinstall if needed
npm install framer-motion@latest
```

### Images Not Loading
```typescript
// Ensure screenshotUrl is valid
console.log(featuredWebsites[0].screenshotUrl);

// Check Next.js image domains in next.config.ts
images: {
  domains: ['your-domain.com'],
}
```

### Layout Breaking on Mobile
```bash
# Check responsive classes are correct
# Tailwind breakpoints:
# sm: 640px
# md: 768px
# lg: 1024px
# xl: 1280px
# 2xl: 1536px
```

### Performance Issues
```typescript
// Reduce floating particles
{Array.from({ length: 10 }).map(...)} // Was 20

// Simplify animations
transition={{ duration: 30 }} // Slower = less frequent updates

// Disable blur on low-end devices
className="backdrop-blur-xl md:backdrop-blur-2xl"
```

---

## 📱 Testing Checklist

After customization, test:

- [ ] Desktop (1920×1080)
- [ ] Laptop (1366×768)
- [ ] Tablet (768×1024)
- [ ] Mobile (375×667)
- [ ] Mobile (414×896)
- [ ] 4K (3840×2160)
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Safari
- [ ] Keyboard navigation
- [ ] Screen reader
- [ ] Dark mode (if applicable)
- [ ] Slow 3G network
- [ ] Touch gestures

---

## 🎯 Quick Recipes

### Minimal Look (Less Animation)
```typescript
// Remove particles (line 67)
// Reduce orbs to 1 (remove lines 114-142)
// Set stagger to 0.05 (line 83)
// Remove icon wiggles (remove animate props)
```

### Bold & Energetic
```typescript
// Increase headline to 10xl on XL screens
// Use bright gradients (red, orange, yellow)
// Add more particles (30 instead of 20)
// Faster animations (15s instead of 25s)
// Larger hover lifts (-20px instead of -12px)
```

### Corporate & Professional
```typescript
// Use muted colors (grays, blues)
// Remove emojis from placeholders
// Simplify animations (linear instead of easeInOut)
// Remove decorative sparkles
// Use sans-serif throughout
```

### Dark Mode Version
```typescript
// Change background to dark
bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900

// Invert text colors
text-slate-900 → text-white
text-slate-600 → text-slate-300

// Adjust glass morphism
bg-white/95 → bg-slate-800/95

// Update borders
border-slate-200 → border-slate-700
```

---

## 🚀 Performance Tips

### 1. Optimize Images
```bash
# Use next-gen formats
.webp instead of .jpg/.png

# Compress images
tinypng.com or squoosh.app

# Lazy load below fold
loading="lazy"
```

### 2. Reduce Animation Complexity
```typescript
// Use transform instead of width/height
✅ transform: translateX()
❌ width: changing values

// Limit blur radius
✅ backdrop-blur-xl (20px)
❌ backdrop-blur-3xl (64px)
```

### 3. Code Splitting
```typescript
// Lazy load heavy components
const HeroSection = dynamic(() => import('./HeroSection'), {
  loading: () => <HeroSkeleton />,
});
```

---

## 📚 Resources

### Design Inspiration
- [Awwwards](https://www.awwwards.com/)
- [Dribbble](https://dribbble.com/)
- [Behance](https://www.behance.net/)
- [SaaS Landing Page](https://saaslandingpage.com/)

### Color Tools
- [Coolors](https://coolors.co/)
- [Adobe Color](https://color.adobe.com/)
- [Paletton](https://paletton.com/)

### Animation Libraries
- [Framer Motion](https://www.framer.com/motion/)
- [GSAP](https://greensock.com/gsap/)
- [Anime.js](https://animejs.com/)

### Icon Resources
- [Emojipedia](https://emojipedia.org/)
- [Heroicons](https://heroicons.com/)
- [Lucide Icons](https://lucide.dev/)

---

## 💡 Pro Tips

1. **Start Simple**: Add complexity gradually
2. **Test Early**: Check on real devices often
3. **Measure Impact**: Use analytics to track changes
4. **Get Feedback**: Ask users what they think
5. **Iterate**: Design is never "done"

---

## 🆘 Need Help?

### Common Issues

**Q: Animations are choppy**
A: Check if you're animating GPU-accelerated properties (transform, opacity) instead of layout properties (width, height, top, left)

**Q: Text is unreadable**
A: Ensure 4.5:1 contrast ratio minimum. Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

**Q: Mobile layout is broken**
A: Verify responsive classes are in correct order: base → sm → md → lg → xl

**Q: Build fails**
A: Check TypeScript errors with `npm run build`

---

## 🎓 Learning Resources

### Framer Motion
- [Official Docs](https://www.framer.com/motion/)
- [Motion Examples](https://motion-examples.vercel.app/)

### Tailwind CSS
- [Official Docs](https://tailwindcss.com/)
- [Tailwind Play](https://play.tailwindcss.com/)

### Next.js
- [Official Docs](https://nextjs.org/docs)
- [Next.js Examples](https://github.com/vercel/next.js/tree/canary/examples)

---

**Happy Customizing! 🎨**

*If you make something cool, share it!*

---

*Last Updated: October 10, 2025*
*Component Version: 2.0*


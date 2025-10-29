import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const categories = [
    'SaaS',
    'Agency/Studio',
    'Portfolio',
    'Fintech',
    'E-commerce',
    'Developer',
    'AI',
    'Crypto/Web3',
  ];

  return (
    <footer className="relative z-10 border-t border-white/10 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: 'linear-gradient(135deg, #4735DD 0%, #FF3E6C 100%)' }}>
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">FigFiles</h3>
              </div>
            </div>
            <p className="text-sm text-foreground/70 leading-relaxed mb-4">
              A curated directory of 878+ landing pages from top companies and creators worldwide.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 transition-all duration-300 hover:scale-105 group"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '50px',
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 8px rgba(0,0,0,0.1)`,
                }}
                aria-label="Twitter"
              >
                <svg className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                </svg>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 transition-all duration-300 hover:scale-105 group"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '50px',
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 8px rgba(0,0,0,0.1)`,
                }}
                aria-label="GitHub"
              >
                <svg className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 transition-all duration-300 hover:scale-105 group"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '50px',
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 8px rgba(0,0,0,0.1)`,
                }}
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Templates by Category */}
          <div>
            <h4 className="text-sm font-bold text-foreground mb-4">Templates</h4>
            <ul className="space-y-2">
              {categories.slice(0, 4).map((category) => (
                <li key={category}>
                  <Link href={`/c/${encodeURIComponent(category === 'Agency/Studio' ? 'agency-studio' : category.replace(/\s+/g,'-').toLowerCase())}`} className="text-sm text-foreground/70 hover:text-foreground transition-colors duration-200">
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More Templates */}
          <div>
            <h4 className="text-sm font-bold text-foreground mb-4">More</h4>
            <ul className="space-y-2">
              {categories.slice(4).map((category) => (
                <li key={category}>
                  <Link href={`/c/${encodeURIComponent(category === 'Agency/Studio' ? 'agency-studio' : category.replace(/\s+/g,'-').toLowerCase())}`} className="text-sm text-foreground/70 hover:text-foreground transition-colors duration-200">
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools / Products */}
          <div>
            <h4 className="text-sm font-bold text-foreground mb-4">Products</h4>
            <ul className="space-y-2">
              <li><Link href="/c/saas" className="text-sm text-foreground/70 hover:text-foreground transition-colors duration-200">All Template Access</Link></li>
              <li><Link href="/c/e-commerce" className="text-sm text-foreground/70 hover:text-foreground transition-colors duration-200">Premium Templates</Link></li>
              <li><Link href="/c/portfolio" className="text-sm text-foreground/70 hover:text-foreground transition-colors duration-200">Free Templates</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-foreground/60 text-center sm:text-left">
              © {currentYear} FigFiles. Curated with ❤️ for designers and developers.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/about" className="text-sm text-foreground/70 hover:text-foreground transition-colors duration-200">
                About
              </Link>
              <Link href="/privacy" className="text-sm text-foreground/70 hover:text-foreground transition-colors duration-200">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-foreground/70 hover:text-foreground transition-colors duration-200">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

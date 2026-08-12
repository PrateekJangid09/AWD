import Link from 'next/link';

const columns = [
  { title: 'Discover', links: [['Home', '/'], ['Full Archive', '/archive'], ['Categories', '/c'], ['2026 Design Index', '/research/website-design-index-2026']] },
  { title: 'Contribute', links: [['Submit a Site', '/submit'], ['Editorial Guidelines', '/editorial-guidelines'], ['Contact', '/contact']] },
  { title: 'Company', links: [['About', '/about'], ['Manifesto', '/manifesto'], ['Privacy', '/privacy'], ['Terms', '/terms']] },
];

export default function Footer({ variant = 'default' }: { variant?: 'default' | 'inverted' }) {
  const inverted = variant === 'inverted';
  return (
    <footer className={`${inverted ? 'bg-[#050505] text-white' : 'bg-white text-black'} border-t-2 border-current`}>
      <div className="mx-auto grid max-w-7xl md:grid-cols-4">{columns.map((column) => <section className="border-b border-current/15 p-10 md:border-b-0 md:border-r" key={column.title}><h2 className="text-xs uppercase tracking-widest opacity-50">{column.title}</h2><ul className="mt-6 space-y-3">{column.links.map(([label, href]) => <li key={href}><Link className="hover:underline" href={href}>{label}</Link></li>)}</ul></section>)}<section className="p-10"><h2 className="text-xs uppercase tracking-widest opacity-50">Community</h2><p className="mt-6 text-sm leading-6 opacity-65">Independent website-design research, curated for people building the web.</p></section></div>
      <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-4 border-t border-current/15 px-10 py-8 text-sm opacity-65"><span>© {new Date().getFullYear()} AllWebsites.Design. Curated in California.</span><span className="flex gap-4"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/sitemap.xml">Sitemap</Link></span></div>
    </footer>
  );
}

import { useEffect } from 'react';

const TOOLS = [
  { slug: 'chromary', name: 'Chromary', tagline: 'Color name finder' },
  { slug: 'colorhyme', name: 'Colorhyme', tagline: 'Color harmony generator' },
  { slug: 'webpalette', name: 'WebPalette', tagline: 'Website color palette generator' },
  { slug: 'truegradient', name: 'TrueGradient', tagline: 'OKLCH gradient generator' },
  { slug: 'mockupalettes', name: 'Mockupalettes', tagline: 'Website color palette visualizer' },
] as const;

const CURRENT = 'webpalette';

export function OtherToolsRail() {
  const others = TOOLS.filter((tool) => tool.slug !== CURRENT);

  useEffect(() => {
    document.documentElement.classList.add('aw-has-other-tools');
    if (!document.querySelector('link[href="/tools/other-tools.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/tools/other-tools.css';
      document.head.appendChild(link);
    }
    return () => {
      document.documentElement.classList.remove('aw-has-other-tools');
    };
  }, []);

  return (
    <aside className="aw-other-tools" aria-label="Use our Other Tools">
      <h2>Use our Other Tools</h2>
      {others.map((tool) => (
        <a key={tool.slug} href={`/tools/${tool.slug}`}>
          <strong>{tool.name}</strong>
          <span>{tool.tagline}</span>
        </a>
      ))}
    </aside>
  );
}

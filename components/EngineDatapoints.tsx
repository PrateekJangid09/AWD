import type { Website } from '@/lib/types';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="border-b border-neutral-200 py-4">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">{label}</div>
      <div className="mt-1 text-[15px] text-neutral-900">{children}</div>
    </div>
  );
}

export default function EngineDatapoints({ website }: { website: Website }) {
  const fonts = (website.fonts || []).map((f) => f.name).filter(Boolean);
  const styles = website.style || [];
  const audience = website.audience || [];
  const palette = website.palette || [];
  const tech = website.tech;
  const techRows = tech
    ? [
        ['Builder / CMS', tech.builder_cms],
        ['Framework', tech.framework],
        ['Language', tech.language],
        ['Frontend', tech.frontend],
        ['Ecommerce', tech.ecommerce],
        ['Web server', tech.web_server],
        ['Hosting', tech.hosting],
        ['CDN', tech.cdn],
        ['Storage', tech.storage],
      ].filter(([, arr]) => arr && arr.length)
    : [];
  const pages = website.keyPages || {};
  const pageLinks = Object.entries(pages).filter(([, p]) => p?.url);

  return (
    <section className="mx-auto max-w-3xl px-5 py-16">
      <h2 className="mb-6 text-2xl font-black tracking-tight">Extracted datapoints</h2>
      <Row label="Category">{website.displayCategory || website.category}</Row>
      <Row label="Subcategory">{website.subcategory}</Row>
      <Row label="Website type">{website.websiteType}</Row>
      <Row label="Audience">{audience.length ? audience.join(', ') : null}</Row>
      <Row label="Style">{styles.length ? styles.join(' · ') : null}</Row>
      <Row label="Fonts">{fonts.length ? fonts.join(' · ') : null}</Row>
      {palette.length ? (
        <Row label="Color scheme">
          <div className="mt-2 flex flex-wrap gap-3">
            {palette.map((c) => (
              <div key={c.hex + (c.role || '')} className="flex items-center gap-2">
                <span
                  className="inline-block h-8 w-8 rounded-full border border-black/10"
                  style={{ background: c.hex }}
                />
                <span className="font-mono text-xs">
                  {c.hex}
                  {c.role ? ` · ${c.role}` : ''}
                </span>
              </div>
            ))}
          </div>
        </Row>
      ) : null}
      <Row label="Tech stack">{website.techSummary}</Row>
      {techRows.length ? (
        <Row label="Technology">
          <ul className="mt-1 space-y-1">
            {techRows.map(([k, arr]) => (
              <li key={k as string}>
                <span className="text-neutral-500">{k}: </span>
                {(arr as string[]).join(', ')}
              </li>
            ))}
          </ul>
        </Row>
      ) : null}
      {pageLinks.length ? (
        <Row label="Key pages">
          <ul className="mt-1 space-y-1">
            {pageLinks.map(([label, page]) => (
              <li key={label}>
                <a className="underline" href={page.url} target="_blank" rel="noopener noreferrer">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </Row>
      ) : null}
      <Row label="Email">
        {website.contactEmail ? (
          <a className="underline" href={`mailto:${website.contactEmail}`}>
            {website.contactEmail}
          </a>
        ) : null}
      </Row>
      <Row label="LinkedIn">
        {website.linkedin ? (
          <a className="underline" href={website.linkedin} target="_blank" rel="noopener noreferrer">
            {website.linkedin}
          </a>
        ) : null}
      </Row>
      <Row label="X">
        {website.x ? (
          <a className="underline" href={website.x} target="_blank" rel="noopener noreferrer">
            {website.x}
          </a>
        ) : null}
      </Row>
    </section>
  );
}

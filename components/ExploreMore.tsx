import Link from "next/link";

const LINKS = [
  { href: "/archive", label: "Browse the archive", desc: "Search every published website." },
  { href: "/c", label: "Explore categories", desc: "See how each industry designs." },
  { href: "/tools", label: "Free colour tools", desc: "Palette, gradient and naming tools." },
  { href: "/blogs", label: "Research", desc: "Findings measured from the record set." },
  { href: "/research/website-design-index-2026", label: "2026 Design Index", desc: "What the archive is measuring." },
  { href: "/submit", label: "Submit a site", desc: "Nominate a reference for review." },
  { href: "/about", label: "About the archive", desc: "How we study websites." },
  { href: "/site-map", label: "Site map", desc: "Every page and record in one list." },
  { href: "/contact", label: "Contact", desc: "Corrections and editorial questions." },
];

export default function ExploreMore({
  except = [],
}: {
  except?: string[];
}) {
  const items = LINKS.filter((l) => !except.includes(l.href)).slice(0, 6);
  return (
    <section className="border-t border-line bg-bone py-14 sm:py-16">
      <div className="wrap">
        <p className="eyebrow text-ink">Keep exploring</p>
        <h2 className="display mt-3 text-2xl sm:text-3xl">More from the archive.</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-2xl border border-line bg-paper p-5 transition-colors hover:border-line-strong"
            >
              <span className="block text-[15px] font-semibold tracking-tight">{l.label}</span>
              <span className="mt-1 block text-[13px] text-muted">{l.desc}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

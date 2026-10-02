import Link from "next/link";

const LINKS = [
  { href: "/archive", label: "Browse the archive", desc: "Search every published website." },
  { href: "/c", label: "Explore categories", desc: "See how each industry designs." },
  { href: "/tools", label: "Free colour tools", desc: "Palette, gradient and naming tools." },
  { href: "/resources", label: "Resources", desc: "Research, guides and the dataset." },
  { href: "/blogs", label: "Journal", desc: "Findings measured from the record set." },
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
    <section className="border-t border-line py-16 sm:py-20">
      <div className="wrap grid gap-10 lg:grid-cols-[5fr_7fr]">
        <div>
          <p className="eyebrow text-ink">Keep exploring</p>
          <h2 className="display mt-4 text-[40px] sm:text-[52px]">More from the archive.</h2>
        </div>
        <ul className="grid border-t border-line sm:grid-cols-2 sm:gap-x-8">
          {items.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="index-row group">
                <span className="flex-1">
                  <span className="block text-[16px] font-semibold text-ink">{l.label}</span>
                  <span className="mt-0.5 block text-[14px] text-muted">{l.desc}</span>
                </span>
                <span aria-hidden className="text-muted transition-colors group-hover:text-orange-ink">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

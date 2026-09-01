import Link from "next/link";
import Logo from "./Logo";
import { CANONICAL, liveCategories } from "@/lib/canonical";

const COLS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Explore",
    links: [
      { href: "/archive", label: "Archive" },
      { href: "/c", label: "Categories" },
      { href: "/tools", label: "Tools" },
      { href: "/research/website-design-index-2026", label: "Research" },
      { href: "/field-guide", label: "Field Guide" },
      { href: "/blogs", label: "Resources" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/about", label: "About" },
      { href: "/manifesto", label: "Manifesto" },
      { href: "/editorial-guidelines", label: "Editorial Guidelines" },
      { href: "/submit", label: "Submit a Site" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy-policy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/cookie-preference", label: "Cookies" },
    ],
  },
];

export default function Footer() {
  const categories = liveCategories().filter((c) => c.count > 0).slice(0, 8);

  return (
    <footer className="border-t border-line bg-ink text-paper">
      <div className="wrap grid grid-cols-2 gap-10 py-16 md:grid-cols-5">
        <div className="col-span-2">
          <div className="[&_span]:text-paper">
            <Logo />
          </div>
          <p className="mt-6 max-w-xs text-pretty text-sm leading-relaxed text-white/75">
            A searchable design archive and a connected set of tools, for people who
            study how the web is made.
          </p>
          <p className="mt-6 text-[11px] uppercase tracking-[0.16em] text-white/70">
            {CANONICAL.length.toLocaleString()} references · {liveCategories().filter((c) => c.count > 0).length} categories
          </p>
        </div>

        {COLS.map((col) => (
          <div key={col.title}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
              {col.title}
            </p>
            <ul className="mt-5 space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-white/80 transition-colors hover:text-orange"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {categories.length > 0 && (
        <div className="border-t border-white/10">
          <div className="wrap py-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
              Popular categories
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/c/${c.slug}`}
                  className="rounded-full border border-white/10 px-3 py-1.5 text-[12px] text-white/80 transition-colors hover:border-orange hover:text-orange"
                >
                  {c.name}
                </Link>
              ))}
              <Link
                href="/c"
                className="rounded-full bg-orange px-3 py-1.5 text-[12px] font-medium text-white"
              >
                All categories
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-white/10">
        <div className="wrap flex flex-col gap-3 py-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/70">
            © {new Date().getFullYear()} AllWebsites.Design
          </p>
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/70">
            Discover · Understand · Explore
          </p>
        </div>
      </div>
    </footer>
  );
}

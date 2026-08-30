import Link from "next/link";
import Logo from "./Logo";
import { STATS } from "@/lib/data";

const COLS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Explore",
    links: [
      { href: "/archive", label: "Archive" },
      { href: "/c", label: "Categories" },
      { href: "/tools", label: "Tools" },
      { href: "/research/website-design-index-2026", label: "Research" },
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
  return (
    <footer className="border-t border-line bg-ink text-paper">
      <div className="wrap grid grid-cols-2 gap-10 py-16 md:grid-cols-5">
        <div className="col-span-2">
          <div className="[&_span]:text-paper">
            <Logo />
          </div>
          <p className="mt-6 max-w-xs text-pretty text-sm leading-relaxed text-white/55">
            A searchable design archive and a connected set of tools, for people who
            study how the web is made.
          </p>
          <p className="mt-6 text-[11px] uppercase tracking-[0.16em] text-white/35">
            {STATS.total.toLocaleString()} references · {STATS.categories} categories
          </p>
        </div>

        {COLS.map((col) => (
          <div key={col.title}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
              {col.title}
            </p>
            <ul className="mt-5 space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-white/70 transition-colors hover:text-orange"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="wrap flex flex-col gap-3 py-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">
            © {new Date().getFullYear()} AllWebsites.Design
          </p>
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">
            Discover · Understand · Explore
          </p>
        </div>
      </div>
    </footer>
  );
}

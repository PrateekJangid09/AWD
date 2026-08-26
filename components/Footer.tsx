import Link from "next/link";
import Logo from "./Logo";
import { STATS } from "@/lib/data";

const COLS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Discover",
    links: [
      { href: "/archive", label: "Full Archive" },
      { href: "/c", label: "Categories" },
      { href: "/tools", label: "Free Tools" },
      { href: "/research/website-design-index-2026", label: "2026 Design Index" },
    ],
  },
  {
    title: "Contribute",
    links: [
      { href: "/submit", label: "Submit a Site" },
      { href: "/editorial-guidelines", label: "Editorial Guidelines" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/manifesto", label: "Manifesto" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms & Conditions" },
      { href: "/cookies", label: "Cookie Preferences" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-paper">
      {/* Newsletter band */}
      <div className="border-b border-white/10">
        <div className="wrap flex flex-col gap-8 py-14 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="eyebrow text-white/90">The Monday Dispatch</p>
            <h3 className="mega mt-4 text-3xl text-paper sm:text-4xl">
              One email. Every Monday.
              <br />
              The best of the archive.
            </h3>
          </div>
          <form
            className="flex w-full max-w-md gap-2 md:w-auto"
            action="#"
            aria-label="Newsletter signup"
          >
            <input
              type="email"
              required
              placeholder="you@studio.com"
              className="min-w-0 flex-1 border-b border-white/25 bg-transparent px-1 py-3 text-sm text-paper placeholder:text-white/35 focus:border-orange"
            />
            <button type="submit" className="btn bg-orange px-5 py-3 text-white hover:bg-orange-600">
              Join
            </button>
          </form>
        </div>
      </div>

      {/* Columns */}
      <div className="wrap grid grid-cols-2 gap-10 py-16 md:grid-cols-6">
        <div className="col-span-2">
          <div className="[&_span]:text-paper">
            <Logo />
          </div>
          <p className="mt-6 max-w-xs text-pretty text-sm leading-relaxed text-white/55">
            Independent website-design research, curated for people building the web.
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

      {/* Baseline */}
      <div className="border-t border-white/10">
        <div className="wrap flex flex-col gap-3 py-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">
            © {new Date().getFullYear()} AllWebsites.Design
          </p>
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">
            Discover · Compare · Study
          </p>
        </div>
      </div>
    </footer>
  );
}

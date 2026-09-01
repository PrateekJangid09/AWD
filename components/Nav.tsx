"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import Logo from "./Logo";
import { CATEGORIES, TOOLS } from "@/lib/catalog";
import type { Category } from "@/lib/catalog";

type MenuKey = "categories" | "tools" | null;

const LINKS: { href: string; label: string; menu?: Exclude<MenuKey, null> }[] = [
  { href: "/archive", label: "Archive" },
  { href: "/c", label: "Categories", menu: "categories" },
  { href: "/tools", label: "Tools", menu: "tools" },
  { href: "/research/website-design-index-2026", label: "Research" },
  { href: "/blogs", label: "Resources" },
];

export default function Nav({
  categories = CATEGORIES,
}: {
  categories?: Pick<Category, "slug" | "name" | "count" | "accent">[];
}) {
  const [open, setOpen] = useState(false); // mobile
  const [menu, setMenu] = useState<MenuKey>(null); // desktop dropdown
  const [mobileSub, setMobileSub] = useState<MenuKey>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function openMenu(k: MenuKey) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMenu(k);
  }
  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMenu(null), 120);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white">
      <div className="wrap flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {LINKS.map((l) => (
            <div
              key={l.href}
              className="relative"
              onMouseEnter={() => (l.menu ? openMenu(l.menu) : openMenu(null))}
              onMouseLeave={l.menu ? scheduleClose : undefined}
            >
              <Link
                href={l.href}
                className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium tracking-wide text-soft transition-colors hover:text-ink"
                aria-haspopup={l.menu ? "true" : undefined}
                aria-expanded={l.menu ? menu === l.menu : undefined}
              >
                {l.label}
                {l.menu && (
                  <span
                    className={`text-[9px] transition-transform ${menu === l.menu ? "rotate-180" : ""}`}
                    aria-hidden
                  >
                    ▾
                  </span>
                )}
              </Link>
            </div>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Link href="/submit" className="btn-dark !py-2.5 !text-[12px]">
            Submit a Site <span aria-hidden>↗</span>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle menu"
          className="flex h-10 w-10 items-center justify-center lg:hidden"
        >
          <div className="space-y-[6px]">
            <span className={`block h-[2px] w-6 bg-ink transition-transform duration-200 ${open ? "translate-y-[8px] rotate-45" : ""}`} />
            <span className={`block h-[2px] w-6 bg-ink transition-opacity duration-200 ${open ? "opacity-0" : ""}`} />
            <span className={`block h-[2px] w-6 bg-ink transition-transform duration-200 ${open ? "-translate-y-[8px] -rotate-45" : ""}`} />
          </div>
        </button>
      </div>

      {/* ── Desktop dropdown panels ── */}
      {menu && (
        <div
          className="absolute inset-x-0 top-16 hidden lg:block"
          onMouseEnter={() => openMenu(menu)}
          onMouseLeave={scheduleClose}
        >
          <div className="wrap">
            <div className="anim-up ml-auto mt-2 w-full overflow-hidden rounded-2xl border border-line bg-white shadow-soft-lg" style={{ animationDuration: "0.28s" }}>
              {menu === "categories" ? (
                <div className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="eyebrow text-ink">Browse by category</p>
                    <Link href="/c" className="text-[13px] font-medium text-soft hover:text-ink">
                      All {categories.length} →
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3 lg:grid-cols-4">
                    {categories.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/c/${c.slug}`}
                        onClick={() => setMenu(null)}
                        className="group flex items-center justify-between border-b border-line/60 py-2.5"
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.accent }} />
                          <span className="text-sm text-soft group-hover:text-ink">
                            {c.name}
                          </span>
                        </span>
                        <span className="text-[11px] text-muted">{c.count.toLocaleString()}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="eyebrow text-ink">Free design tools</p>
                    <Link href="/tools" className="text-[13px] font-medium text-soft hover:text-ink">
                      All tools →
                    </Link>
                  </div>
                  <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                    {TOOLS.map((t) => (
                      <a
                        key={t.slug}
                        href={`/tools/${t.slug}`}
                        onClick={() => setMenu(null)}
                        className="group flex items-center gap-3 rounded-xl border border-line bg-white p-3 transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-soft"
                      >
                        <span className="flex h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-line">
                          {t.swatches.map((s) => (
                            <span key={s} className="flex-1" style={{ backgroundColor: s }} />
                          ))}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium tracking-tight group-hover:text-ink">
                            {t.name}
                          </span>
                          <span className="block truncate text-[11px] text-muted">{t.tagline}</span>
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile menu ── */}
      {open && (
        <div className="max-h-[80vh] overflow-y-auto border-t border-line bg-white lg:hidden">
          <div className="wrap flex flex-col py-3">
            {LINKS.map((l) =>
              l.menu ? (
                <div key={l.href} className="border-b border-line">
                  <button
                    onClick={() => setMobileSub(mobileSub === l.menu ? null : l.menu!)}
                    className="flex w-full items-center justify-between py-3.5 text-sm font-medium tracking-wide"
                    aria-expanded={mobileSub === l.menu}
                  >
                    {l.label}
                    <span className={`text-[10px] transition-transform ${mobileSub === l.menu ? "rotate-180" : ""}`}>▾</span>
                  </button>
                  {mobileSub === l.menu && (
                    <div className="pb-3">
                      {l.menu === "categories"
                        ? categories.slice(0, 8).map((c) => (
                            <Link key={c.slug} href={`/c/${c.slug}`} onClick={() => setOpen(false)} className="flex items-center gap-2 py-2 text-[13px] text-soft">
                              <span className="h-1.5 w-1.5" style={{ backgroundColor: c.accent }} />
                              {c.name}
                            </Link>
                          ))
                        : TOOLS.map((t) => (
                            <a key={t.slug} href={`/tools/${t.slug}`} onClick={() => setOpen(false)} className="block py-2 text-[13px] text-soft">
                              {t.name}
                            </a>
                          ))}
                      <Link href={l.href} onClick={() => setOpen(false)} className="mt-1 block py-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-orange-700">
                        {l.menu === "categories" ? "All categories →" : "All tools →"}
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="border-b border-line py-3.5 text-sm font-medium tracking-wide">
                  {l.label}
                </Link>
              ),
            )}
            <Link href="/contact" onClick={() => setOpen(false)} className="border-b border-line py-3.5 text-sm font-medium tracking-wide">
              Contact
            </Link>
            <Link href="/submit" onClick={() => setOpen(false)} className="btn-dark mt-4 w-full">
              Submit a Site ↗
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

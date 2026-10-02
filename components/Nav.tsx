"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { CaretDown, List, X } from "@phosphor-icons/react";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { TOOLS } from "@/lib/catalog";
import type { Category } from "@/lib/catalog";

type MenuKey = "categories" | "tools" | null;

const LINKS: { href: string; label: string; menu?: Exclude<MenuKey, null>; match: RegExp }[] = [
  { href: "/archive", label: "Archive", match: /^\/archive/ },
  { href: "/c", label: "Categories", menu: "categories", match: /^\/c(\/|$)/ },
  { href: "/tools", label: "Tools", menu: "tools", match: /^\/tools/ },
  { href: "/resources", label: "Resources", match: /^\/(resources|blogs|research)/ },
  { href: "/about", label: "About", match: /^\/(about|manifesto)/ },
];

const panel = {
  initial: { opacity: 0, y: -6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.16, ease: [0.22, 0.7, 0.2, 1] as const },
};

function CurrentMark() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 60 8"
      preserveAspectRatio="none"
      className="absolute -bottom-[3px] left-2 right-2 h-[6px] w-[calc(100%-1rem)]"
    >
      <path
        d="M2 5c14-2.6 30-3.2 44-2.4 4 .2 7.6.6 12 1.4"
        fill="none"
        stroke="#FF6112"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Required, not defaulted: counts must come from the live record set, so there
// is no static fallback that could render a stale number.
export default function Nav({
  categories,
}: {
  categories: Pick<Category, "slug" | "name" | "count" | "accent">[];
}) {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false); // mobile
  const [menu, setMenu] = useState<MenuKey>(null); // desktop dropdown
  const [mobileSub, setMobileSub] = useState<MenuKey>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setOpen(false);
    setMenu(null);
  }, [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenu(null);
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function openMenu(k: MenuKey) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMenu(k);
  }
  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMenu(null), 140);
  }

  const sortedCats = [...categories].sort((a, b) => b.count - a.count);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper">
      <div className="wrap flex h-[76px] items-center justify-between gap-6">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {LINKS.map((l) => {
            const current = l.match.test(pathname);
            return (
              <div
                key={l.href}
                className="relative"
                onMouseEnter={() => (l.menu ? openMenu(l.menu) : openMenu(null))}
                onMouseLeave={l.menu ? scheduleClose : undefined}
                onFocus={() => l.menu && openMenu(l.menu)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node | null)) scheduleClose();
                }}
              >
                <Link
                  href={l.href}
                  aria-current={current ? "page" : undefined}
                  className="relative flex items-center gap-1 px-3 py-2 text-[15px] font-semibold text-ink"
                  aria-haspopup={l.menu ? "true" : undefined}
                  aria-expanded={l.menu ? menu === l.menu : undefined}
                >
                  {l.label}
                  {l.menu && (
                    <CaretDown
                      size={12}
                      weight="bold"
                      className={`text-muted transition-transform duration-150 ${menu === l.menu ? "rotate-180" : ""}`}
                      aria-hidden
                    />
                  )}
                  {current && <CurrentMark />}
                </Link>

                <AnimatePresence>
                  {l.menu && menu === l.menu && (
                    <m.div
                      {...panel}
                      className={`absolute top-full z-50 pt-3 ${l.menu === "categories" ? "-left-40 w-[640px]" : "-left-24 w-[520px]"}`}
                      onMouseEnter={() => openMenu(l.menu!)}
                      onMouseLeave={scheduleClose}
                    >
                      <div className="rounded-[6px] border border-ink/80 bg-surface p-6">
                        {l.menu === "categories" ? (
                          <>
                            <div className="mb-3 flex items-baseline justify-between">
                              <p className="eyebrow text-ink">Browse by industry</p>
                              <Link href="/c" className="link-underline text-[13px] font-semibold text-ink">
                                All {categories.length}
                              </Link>
                            </div>
                            <ul className="grid grid-cols-2 gap-x-8">
                              {sortedCats.map((c) => (
                                <li key={c.slug}>
                                  <Link
                                    href={`/c/${c.slug}`}
                                    className="index-row !py-2.5 text-[14px] text-ink"
                                  >
                                    <span className="flex-1">{c.name}</span>
                                    <span className="tabular-nums text-[12px] text-muted">
                                      {c.count.toLocaleString()}
                                    </span>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : (
                          <>
                            <div className="mb-3 flex items-baseline justify-between">
                              <p className="eyebrow text-ink">Free colour tools</p>
                              <Link href="/tools" className="link-underline text-[13px] font-semibold text-ink">
                                All tools
                              </Link>
                            </div>
                            <ul>
                              {TOOLS.map((t) => (
                                <li key={t.slug}>
                                  <a href={`/tools/${t.slug}`} className="index-row !py-3 text-ink">
                                    <span className="w-36 shrink-0 text-[12px] font-bold uppercase tracking-[0.12em]">
                                      {t.name}
                                    </span>
                                    <span className="flex-1 text-[14px] text-soft">{t.tagline}</span>
                                    <span aria-hidden className="text-muted">→</span>
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <Link href="/submit" className="btn-primary hidden !min-h-[44px] !px-4 !text-[14px] lg:inline-flex">
            Submit a site
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid h-11 w-11 place-items-center rounded-[6px] border border-line text-ink lg:hidden"
          >
            {open ? <X size={20} /> : <List size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <m.div
            id="mobile-menu"
            {...panel}
            className="max-h-[calc(100dvh-76px)] overflow-y-auto border-t border-line bg-paper lg:hidden"
          >
            <nav className="wrap flex flex-col py-3" aria-label="Mobile">
              {LINKS.map((l) =>
                l.menu ? (
                  <div key={l.href} className="border-b border-line">
                    <button
                      onClick={() => setMobileSub(mobileSub === l.menu ? null : l.menu!)}
                      className="flex min-h-[52px] w-full items-center justify-between text-[17px] font-semibold"
                      aria-expanded={mobileSub === l.menu}
                    >
                      {l.label}
                      <CaretDown
                        size={14}
                        weight="bold"
                        className={`transition-transform duration-150 ${mobileSub === l.menu ? "rotate-180" : ""}`}
                        aria-hidden
                      />
                    </button>
                    {mobileSub === l.menu && (
                      <div className="pb-3">
                        {l.menu === "categories"
                          ? sortedCats.slice(0, 10).map((c) => (
                              <Link
                                key={c.slug}
                                href={`/c/${c.slug}`}
                                className="flex min-h-[44px] items-center justify-between text-[15px] text-soft"
                              >
                                {c.name}
                                <span className="text-[12px] tabular-nums text-muted">{c.count}</span>
                              </Link>
                            ))
                          : TOOLS.map((t) => (
                              <a
                                key={t.slug}
                                href={`/tools/${t.slug}`}
                                className="flex min-h-[44px] items-center text-[15px] text-soft"
                              >
                                {t.name}
                              </a>
                            ))}
                        <Link
                          href={l.href}
                          className="mt-1 flex min-h-[44px] items-center text-[14px] font-semibold text-orange-ink"
                        >
                          {l.menu === "categories" ? "All categories →" : "All tools →"}
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={l.match.test(pathname) ? "page" : undefined}
                    className="flex min-h-[52px] items-center border-b border-line text-[17px] font-semibold"
                  >
                    {l.label}
                  </Link>
                ),
              )}
              <Link href="/contact" className="flex min-h-[52px] items-center border-b border-line text-[17px] font-semibold">
                Contact
              </Link>
              <Link href="/submit" className="btn-primary mt-5 w-full">
                Submit a site
              </Link>
            </nav>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  );
}

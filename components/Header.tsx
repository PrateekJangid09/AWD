'use client';
import * as React from 'react';
import Link from 'next/link';

export default function Header({ variant = 'default' }: { variant?: 'default' | 'slug' }) {
  const [open, setOpen] = React.useState(false);
  const links = [{ title: 'Archive', href: '/archive' }, { title: 'Categories', href: '/c' }, { title: 'About', href: '/about' }];
  return (
    <header className="fixed left-1/2 top-4 z-[1000] flex h-16 w-[calc(100%-32px)] max-w-3xl -translate-x-1/2 items-center justify-between rounded-2xl border border-black/10 bg-white/90 px-5 shadow-xl backdrop-blur-xl" data-variant={variant}>
      <Link className="text-lg font-bold tracking-tight text-black" href="/">ALLWEBSITES</Link>
      <nav className="hidden items-center gap-2 md:flex">{links.map((link) => <Link className="rounded-lg px-4 py-2 text-sm font-medium text-black/70 hover:bg-black/5 hover:text-black" key={link.href} href={link.href}>{link.title}</Link>)}</nav>
      <Link className="hidden rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white md:block" href="/submit">Submit a site</Link>
      <button className="rounded-lg border px-3 py-2 md:hidden" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Toggle navigation">Menu</button>
      {open && <nav className="absolute left-0 right-0 top-20 flex flex-col gap-2 rounded-2xl border bg-white p-4 shadow-xl md:hidden">{links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-lg px-4 py-3 text-black">{link.title}</Link>)}<Link href="/submit" className="rounded-lg bg-black px-4 py-3 text-white">Submit a site</Link></nav>}
    </header>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "aw-cookie-consent";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* storage blocked — stay hidden */
    }
  }, []);

  function decide(value: "all" | "essential") {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({ value, at: new Date().toISOString() }),
      );
    } catch {}
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-5">
      <div className="wrap">
        <div className="glass-strong flex flex-col gap-4 rounded-2xl p-5 shadow-soft-lg md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow text-ink">Cookies</p>
            <p className="mt-2.5 text-sm leading-relaxed text-soft">
              We use essential cookies to run the archive and optional analytics
              cookies to understand how references are discovered. You choose.{" "}
              <Link href="/cookie-preference" className="link-underline font-medium text-ink">
                Manage preferences
              </Link>
              .
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2.5">
            <button
              onClick={() => decide("essential")}
              className="btn-ghost !px-4 !py-2.5 !text-[12px]"
            >
              Essential only
            </button>
            <button
              onClick={() => decide("all")}
              className="btn-primary !px-4 !py-2.5 !text-[12px]"
            >
              Accept all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

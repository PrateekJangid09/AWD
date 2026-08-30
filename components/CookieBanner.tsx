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
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3">
      <div className="wrap">
        <div className="flex flex-col gap-3 rounded-2xl border border-line bg-paper p-3.5 shadow-soft-lg sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <p className="max-w-2xl text-[13px] leading-relaxed text-soft">
            Essential cookies run the archive. Analytics stay off unless you opt in.{" "}
            <Link href="/cookie-preference" className="font-medium text-ink underline decoration-orange decoration-2 underline-offset-2">
              Preferences
            </Link>
          </p>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={() => decide("essential")}
              className="btn-ghost !px-3.5 !py-2 !text-[12px]"
            >
              Essential only
            </button>
            <button
              onClick={() => decide("all")}
              className="btn-primary !px-3.5 !py-2 !text-[12px]"
            >
              Accept all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { readConsent, saveConsent, type ConsentPrefs } from "@/lib/consent";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!readConsent()) setShow(true);
  }, []);

  function decide(prefs: ConsentPrefs, label: string) {
    try {
      saveConsent(prefs, label);
    } catch {
      /* storage blocked */
    }
    setShow(false);
  }

  return (
    <AnimatePresence>
      {show && (
    <m.div
      role="region"
      aria-label="Cookie preferences"
      className="fixed inset-x-0 bottom-0 z-[60] p-3"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 0.8, duration: 0.22 } }}
      exit={{ opacity: 0, y: 8, transition: { duration: 0.16 } }}
    >
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col gap-3 rounded-[6px] border border-ink bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-[13px] leading-relaxed text-soft">
            Essential cookies run the archive. We also use Google Analytics and
            Tag Manager to understand how the site is used.{" "}
            <Link href="/cookie-preference" className="font-medium text-ink underline decoration-orange decoration-2 underline-offset-2">
              Preferences
            </Link>
          </p>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={() =>
                decide(
                  { analytics: false, functional: false, marketing: false },
                  "essential",
                )
              }
              className="btn-ghost !min-h-[40px] !px-3.5 !py-2 !text-[13px]"
            >
              Essential only
            </button>
            <button
              onClick={() =>
                decide(
                  { analytics: true, functional: true, marketing: true },
                  "all",
                )
              }
              className="btn-primary !min-h-[40px] !px-3.5 !py-2 !text-[13px]"
            >
              Accept all
            </button>
          </div>
        </div>
      </div>
    </m.div>
      )}
    </AnimatePresence>
  );
}

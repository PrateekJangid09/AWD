"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DocumentHero from "@/components/DocumentHero";

const KEY = "aw-cookie-consent";

type Prefs = { analytics: boolean; functional: boolean; marketing: boolean };

const GROUPS: {
  id: keyof Prefs | "essential";
  title: string;
  desc: string;
  locked?: boolean;
}[] = [
  {
    id: "essential",
    title: "Strictly necessary",
    desc: "Required to run the archive — routing, security and remembering this very choice. Always on.",
    locked: true,
  },
  {
    id: "analytics",
    title: "Analytics",
    desc: "Google Analytics 4 and Google Tag Manager measure how the archive and tools are used.",
  },
  {
    id: "functional",
    title: "Functional",
    desc: "Remembers preferences like filters and layout so the archive feels like yours between visits.",
  },
  {
    id: "marketing",
    title: "Marketing",
    desc: "We don't run ad-tracking today. This stays off unless that ever changes and you opt in.",
  },
];

export default function CookiesPage() {
  const [prefs, setPrefs] = useState<Prefs>({
    analytics: false,
    functional: false,
    marketing: false,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.prefs) setPrefs(parsed.prefs);
        else if (parsed.value === "all")
          setPrefs({ analytics: true, functional: true, marketing: false });
      }
    } catch {}
  }, []);

  function persist(next: Prefs, label: string) {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({ value: label, prefs: next, at: new Date().toISOString() }),
      );
    } catch {}
    setPrefs(next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2600);
  }

  return (
    <>
      <DocumentHero
        title="Cookie Preferences"
        description="Essential cookies keep the archive running. Everything else is opt-in and saved in your browser — change it any time."
        updated="11 August 2026"
        breadcrumb={[{ href: "/", label: "Home" }, { label: "Cookies" }]}
      />

      <section className="py-14 sm:py-20">
        <div className="wrap max-w-3xl">
          <div className="space-y-4">
            {GROUPS.map((g) => {
              const on = g.locked ? true : prefs[g.id as keyof Prefs];
              return (
                <div
                  key={g.id}
                  className="card-brutal hover:!translate-x-0 hover:!translate-y-0 flex items-start justify-between gap-6 p-5 sm:p-6"
                >
                  <div>
                    <h2 className="display text-xl">{g.title}</h2>
                    <p className="mt-2 max-w-lg text-pretty text-sm leading-relaxed text-ink/70">
                      {g.desc}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={on}
                    aria-label={`Toggle ${g.title}`}
                    disabled={g.locked}
                    onClick={() =>
                      !g.locked &&
                      setPrefs((p) => ({
                        ...p,
                        [g.id]: !p[g.id as keyof Prefs],
                      }))
                    }
                    className={`relative mt-1 h-8 w-14 shrink-0 border border-line transition-colors ${
                      on ? "bg-orange" : "bg-paper-dark"
                    } ${g.locked ? "cursor-not-allowed opacity-70" : ""}`}
                  >
                    <span
                      className={`absolute top-[1px] h-[24px] w-[24px] border border-ink/15 bg-chalk transition-transform ${
                        on ? "translate-x-[24px]" : "translate-x-[1px]"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={() =>
                persist(
                  { analytics: true, functional: true, marketing: true },
                  "all",
                )
              }
              className="btn-dark"
            >
              Accept all
            </button>
            <button
              onClick={() => persist(prefs, "custom")}
              className="btn-primary"
            >
              Save preferences
            </button>
            <button
              onClick={() =>
                persist(
                  { analytics: false, functional: false, marketing: false },
                  "essential",
                )
              }
              className="btn-ghost"
            >
              Reject non-essential
            </button>
            {saved && (
              <span className="font-mono text-[12px] uppercase tracking-wider text-orange">
                ✓ Saved to this browser
              </span>
            )}
          </div>

          <p className="mt-8 font-mono text-[11px] leading-relaxed text-ink/45">
            Preferences are stored only in your browser via localStorage — they never
            reach our servers or other devices. See the{" "}
            <Link href="/privacy-policy" className="underline decoration-orange decoration-2 underline-offset-2">
              privacy policy
            </Link>{" "}
            for the full picture.
          </p>
        </div>
      </section>
    </>
  );
}

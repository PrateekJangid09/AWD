"use client";

import { useEffect, useId, useRef, useState } from "react";

const SWATCHES = ["#FF6112", "#0E0E10", "#F4F4F5", "#FFD9C2"];

type Variant = "home" | "tools";

export default function ComingSoonSuiteCard({
  variant = "tools",
}: {
  variant?: Variant;
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      triggerRef.current?.focus();
    };
  }, [open]);

  const close = () => setOpen(false);

  const card =
    variant === "home" ? (
      <span className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white text-left transition-transform duration-300 group-hover:-translate-y-1">
        <span className="relative block aspect-[16/10] overflow-hidden border-b border-line bg-bone">
          <span className="flex h-full">
            {SWATCHES.map((swatch) => (
              <span key={swatch} className="flex-1" style={{ backgroundColor: swatch }} />
            ))}
          </span>
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10.5px] font-semibold text-ink shadow-sm backdrop-blur">
            Suite
          </span>
          <span className="absolute right-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[10.5px] font-medium text-muted shadow-sm backdrop-blur">
            Soon
          </span>
        </span>
        <span className="flex flex-1 items-center gap-4 p-5">
          <span className="min-w-0 flex-1">
            <span className="block text-[16px] font-semibold tracking-tight text-ink">
              AW Design Suite Coming Soon on Figma
            </span>
            <span className="mt-0.5 block text-[13px] text-muted">
              A Figma plugin for the same colour workflow.
            </span>
          </span>
        </span>
      </span>
    ) : (
      <span className="glass-card group flex h-full flex-col overflow-hidden text-left">
        <span className="relative aspect-[16/10] overflow-hidden border-b border-line bg-bone">
          <span className="flex h-full">
            {SWATCHES.map((swatch) => (
              <span key={swatch} className="flex-1" style={{ backgroundColor: swatch }} />
            ))}
          </span>
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-ink shadow-sm backdrop-blur">
            Suite
          </span>
          <span className="absolute right-4 top-4 rounded-full bg-white/85 px-2.5 py-1 text-[10.5px] font-medium text-muted">
            Soon
          </span>
        </span>
        <span className="flex flex-1 flex-col p-6">
          <span className="text-lg font-medium tracking-tight">
            AW Design Suite Coming Soon on Figma
          </span>
          <span className="mt-0.5 text-[13px] text-muted">Figma plugin</span>
          <span className="mt-3 flex-1 text-pretty text-[14px] leading-relaxed text-soft">
            The same colour workflow, shipping soon as a Figma plugin.
          </span>
        </span>
      </span>
    );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="group block h-full w-full cursor-pointer appearance-none border-0 bg-transparent p-0 text-left"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {card}
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
            aria-label="Close dialog"
            onClick={close}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 w-full max-w-md rounded-2xl border border-line bg-paper p-6 shadow-[0_24px_60px_-24px_rgba(17,17,20,0.35)]"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              Figma plugin
            </p>
            <h2 id={titleId} className="mt-2 text-xl font-semibold tracking-tight text-ink">
              AW Design Suite
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-soft">
              We will launch it soon for Figma users.
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              className="btn-dark mt-6"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

import type { ReactNode } from "react";

/** Stable Figma Community listing for the Color Tool Suite plugin. */
export const FIGMA_SUITE_URL =
  "https://www.figma.com/community/plugin/1677934721029949470/color-tool-suite-palette-harmony-oklch";

const SWATCHES = ["#FF6112", "#0E0E10", "#F4F4F5", "#FFD9C2"];

type Variant = "home" | "tools";

function SwatchPlane({ children }: { children: ReactNode }) {
  return (
    <>
      <span className="flex h-full">
        {SWATCHES.map((swatch) => (
          <span key={swatch} className="flex-1" style={{ backgroundColor: swatch }} />
        ))}
      </span>
      {children}
    </>
  );
}

/**
 * Live Figma Community card for Color Tool Suite.
 *
 * Replaces the old coming-soon modal: the card is a real outbound link to the
 * published plugin, with Suite + Live badges so it reads as available now.
 */
export default function FigmaSuiteCard({
  variant = "tools",
}: {
  variant?: Variant;
}) {
  if (variant === "home") {
    return (
      <a
        href={FIGMA_SUITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white text-left transition-transform duration-300 hover:-translate-y-1"
      >
        <span className="relative block aspect-[16/10] overflow-hidden border-b border-line bg-bone">
          <SwatchPlane>
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10.5px] font-semibold text-ink shadow-sm backdrop-blur">
              Suite
            </span>
            <span className="absolute right-3 top-3 rounded-full bg-orange px-2.5 py-1 text-[10.5px] font-medium text-white shadow-sm">
              Live
            </span>
          </SwatchPlane>
        </span>
        <span className="flex flex-1 items-center gap-4 p-5">
          <span className="min-w-0 flex-1">
            <span className="block text-[16px] font-semibold tracking-tight text-ink">
              Color Tool Suite on Figma
            </span>
            <span className="mt-0.5 block text-[13px] text-muted">
              Palette, harmony and OKLCH — free on Figma Community.
            </span>
          </span>
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-white transition-transform duration-300 group-hover:translate-x-0.5"
            aria-hidden
          >
            ↗
          </span>
        </span>
      </a>
    );
  }

  return (
    <a
      href={FIGMA_SUITE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="glass-card group flex h-full flex-col overflow-hidden text-left transition-transform duration-300 hover:-translate-y-1"
    >
      <span className="relative aspect-[16/10] overflow-hidden border-b border-line bg-bone">
        <SwatchPlane>
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-ink shadow-sm backdrop-blur">
            Suite
          </span>
          <span className="absolute right-4 top-4 rounded-full bg-orange px-2.5 py-1 text-[10.5px] font-medium text-white">
            Live
          </span>
        </SwatchPlane>
      </span>
      <span className="flex flex-1 flex-col p-6">
        <span className="text-lg font-medium tracking-tight">Color Tool Suite on Figma</span>
        <span className="mt-0.5 text-[13px] text-muted">Figma Community plugin</span>
        <span className="mt-3 flex-1 text-pretty text-[14px] leading-relaxed text-soft">
          The same colour workflow — palette, harmony and OKLCH — now live as a
          Figma plugin.
        </span>
        <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink">
          Open in Figma
          <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
            ↗
          </span>
        </span>
      </span>
    </a>
  );
}

/** Stable Figma Community listing for the Color Tool Suite plugin. */
export const FIGMA_SUITE_URL =
  "https://www.figma.com/community/plugin/1677934721029949470/color-tool-suite-palette-harmony-oklch";

const ROLES = [
  { role: "Primary", hex: "#FF6112" },
  { role: "Ink", hex: "#0E0E10" },
  { role: "Bone", hex: "#F4F4F5" },
  { role: "Accent", hex: "#2F6BFF" },
];

type Variant = "home" | "tools";

/**
 * Live Figma Community card for Color Tool Suite.
 *
 * The media plane is a miniature plugin panel (not bare colour stripes), so the
 * card reads as a product surface. Suite + Try now badges mark it as available.
 */
function PluginPreview() {
  return (
    <span className="absolute inset-0 bg-[#1E1E1E]">
      <span
        className="absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(80% 70% at 15% 0%, rgba(255,97,18,0.35), transparent 55%), radial-gradient(70% 60% at 100% 100%, rgba(47,107,255,0.28), transparent 50%)",
        }}
        aria-hidden
      />

      {/* Mini Figma chrome + plugin drawer */}
      <span className="absolute inset-3 flex overflow-hidden rounded-xl border border-white/10 bg-[#2C2C2C] shadow-[0_18px_40px_-20px_rgba(0,0,0,0.7)] sm:inset-4">
        <span className="hidden w-[28%] flex-col border-r border-white/10 bg-[#1A1A1A] p-2.5 sm:flex">
          <span className="h-1.5 w-8 rounded-full bg-white/15" />
          <span className="mt-3 space-y-1.5">
            {["Pages", "Layers", "Assets"].map((label) => (
              <span key={label} className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-sm bg-white/25" />
                <span className="h-1 flex-1 rounded-full bg-white/10" />
              </span>
            ))}
          </span>
          <span className="mt-auto aspect-square rounded-lg bg-gradient-to-br from-[#FF6112] via-[#FF9A5A] to-[#2F6BFF] opacity-90" />
        </span>

        <span className="flex min-w-0 flex-1 flex-col bg-[#252525]">
          <span className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF5F57]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#FEBC2E]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#28C840]" />
            <span className="ml-2 truncate text-[9px] font-medium tracking-wide text-white/55">
              Color Tool Suite
            </span>
          </span>

          <span className="flex flex-1 flex-col gap-2.5 p-3">
            <span className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
                Palette
              </span>
              <span className="rounded-full bg-orange px-2 py-0.5 text-[9px] font-semibold text-white">
                OKLCH
              </span>
            </span>

            <span className="grid grid-cols-4 gap-1.5">
              {ROLES.map((swatch) => (
                <span key={swatch.hex} className="min-w-0">
                  <span
                    className="block aspect-square rounded-md border border-white/10 shadow-sm"
                    style={{ backgroundColor: swatch.hex }}
                  />
                  <span className="mt-1 block truncate text-[8px] text-white/40">
                    {swatch.role}
                  </span>
                </span>
              ))}
            </span>

            <span
              className="mt-auto h-2 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, #FF6112 0%, #FF9A5A 35%, #2F6BFF 70%, #0E0E10 100%)",
              }}
              aria-hidden
            />

            <span className="flex items-center gap-2">
              <span className="rounded-md bg-white px-2.5 py-1 text-[9px] font-semibold text-ink">
                Apply fill
              </span>
              <span className="rounded-md border border-white/15 px-2.5 py-1 text-[9px] font-medium text-white/70">
                Harmony
              </span>
            </span>
          </span>
        </span>
      </span>
    </span>
  );
}

function Badges({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <>
        <span className="absolute left-3 top-3 z-10 rounded-full bg-white/95 px-2.5 py-1 text-[10.5px] font-semibold text-ink shadow-sm backdrop-blur">
          Suite
        </span>
        <span className="absolute right-3 top-3 z-10 rounded-full bg-orange px-2.5 py-1 text-[10.5px] font-semibold text-white shadow-sm">
          Try now
        </span>
      </>
    );
  }
  return (
    <>
      <span className="absolute left-4 top-4 z-10 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-ink shadow-sm backdrop-blur">
        Suite
      </span>
      <span className="absolute right-4 top-4 z-10 rounded-full bg-orange px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
        Try now
      </span>
    </>
  );
}

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
        <span className="relative block aspect-[16/10] overflow-hidden border-b border-line">
          <PluginPreview />
          <Badges compact />
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
      <span className="relative aspect-[16/10] overflow-hidden border-b border-line">
        <PluginPreview />
        <Badges />
      </span>
      <span className="flex flex-1 flex-col p-6">
        <span className="text-lg font-medium tracking-tight">Color Tool Suite on Figma</span>
        <span className="mt-0.5 text-[13px] text-muted">Figma Community plugin</span>
        <span className="mt-3 flex-1 text-pretty text-[14px] leading-relaxed text-soft">
          The same colour workflow — palette, harmony and OKLCH — now live as a
          Figma plugin. Open it, pick a fill, apply.
        </span>
        <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink">
          Try now on Figma
          <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
            ↗
          </span>
        </span>
      </span>
    </a>
  );
}

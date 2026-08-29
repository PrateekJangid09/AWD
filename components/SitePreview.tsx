import type { PaletteRole } from "@/lib/data";

// A deterministic, stylized "screenshot" built from a record's palette.
// Stands in for a real homepage capture while staying visually intentional.
export default function SitePreview({
  palette,
  label,
  className = "",
}: {
  palette: PaletteRole[];
  label?: string;
  className?: string;
}) {
  const [surface, primary, deep, ink] = [
    palette[0]?.hex ?? "#F4F2EC",
    palette[1]?.hex ?? "#FF6112",
    palette[2]?.hex ?? "#141414",
    palette[3]?.hex ?? "#141414",
  ];

  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden ${className}`}
      style={{ backgroundColor: surface }}
    >
      {/* browser chrome */}
      <div
        className="flex shrink-0 items-center gap-1.5 px-3.5 py-2.5"
        style={{ backgroundColor: ink }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
        {label && (
          <span className="ml-2 truncate text-[9px] font-medium uppercase tracking-[0.12em] text-white/55">
            {label}
          </span>
        )}
      </div>

      {/* faux mobile layout — fills a 9:16 frame */}
      <div className="flex min-h-0 flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          <div className="flex items-center justify-between">
            <div className="h-2 w-9" style={{ backgroundColor: primary }} />
            <div className="flex gap-1.5">
              <div className="h-1.5 w-5" style={{ backgroundColor: ink, opacity: 0.2 }} />
              <div className="h-1.5 w-5" style={{ backgroundColor: ink, opacity: 0.2 }} />
              <div className="h-1.5 w-5" style={{ backgroundColor: primary }} />
            </div>
          </div>

          <div className="pt-5">
            <div className="h-3.5 w-4/5" style={{ backgroundColor: ink, opacity: 0.88 }} />
            <div className="mt-2 h-3.5 w-1/2" style={{ backgroundColor: ink, opacity: 0.88 }} />
            <div className="mt-4 h-1.5 w-2/3" style={{ backgroundColor: ink, opacity: 0.3 }} />
            <div className="mt-1.5 h-1.5 w-1/2" style={{ backgroundColor: ink, opacity: 0.2 }} />
            <div className="mt-4 h-6 w-20" style={{ backgroundColor: primary }} />
          </div>
        </div>

        <div className="mt-4 grid flex-1 grid-rows-3 gap-2 pt-2">
          <div className="rounded-sm" style={{ backgroundColor: primary, opacity: 0.92 }} />
          <div className="rounded-sm" style={{ backgroundColor: deep, opacity: 0.85 }} />
          <div className="rounded-sm" style={{ backgroundColor: ink, opacity: 0.12 }} />
        </div>
      </div>
    </div>
  );
}

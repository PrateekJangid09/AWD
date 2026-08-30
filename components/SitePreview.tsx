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
      className={`relative overflow-hidden ${className}`}
      style={{ backgroundColor: surface }}
    >
      {/* browser chrome */}
      <div
        className="flex items-center gap-1.5 px-3.5 py-2.5"
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

      {/* faux layout */}
      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <div className="h-2 w-9" style={{ backgroundColor: primary }} />
          <div className="flex gap-1.5">
            <div className="h-1.5 w-6" style={{ backgroundColor: ink, opacity: 0.2 }} />
            <div className="h-1.5 w-6" style={{ backgroundColor: ink, opacity: 0.2 }} />
            <div className="h-1.5 w-6" style={{ backgroundColor: primary }} />
          </div>
        </div>

        <div className="pt-3">
          <div className="h-4 w-4/5" style={{ backgroundColor: ink, opacity: 0.88 }} />
          <div className="mt-2 h-4 w-2/5" style={{ backgroundColor: ink, opacity: 0.88 }} />
          <div className="mt-4 h-1.5 w-2/3" style={{ backgroundColor: ink, opacity: 0.3 }} />
          <div className="mt-4 inline-block h-6 w-20" style={{ backgroundColor: primary }} />
        </div>

        <div className="grid grid-cols-3 gap-2.5 pt-3">
          <div className="h-10" style={{ backgroundColor: primary, opacity: 0.92 }} />
          <div className="h-10" style={{ backgroundColor: deep, opacity: 0.85 }} />
          <div className="h-10" style={{ backgroundColor: ink, opacity: 0.12 }} />
        </div>
      </div>
    </div>
  );
}

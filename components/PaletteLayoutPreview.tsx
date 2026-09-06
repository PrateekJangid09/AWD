type Roles = {
  primary: string;
  secondary: string;
  accent: string;
  dark: string;
};

export default function PaletteLayoutPreview({
  roles,
  name,
}: {
  roles: Roles;
  name: string;
}) {
  return (
    <div
      className="overflow-hidden border border-ink bg-paper"
      aria-label={`${name} static website layout preview`}
    >
      <div className="flex items-center justify-between px-5 py-3" style={{ background: roles.dark, color: "#fff" }}>
        <span className="text-[13px] font-semibold">{name}</span>
        <span className="flex gap-2 text-[11px] uppercase tracking-widest opacity-80">
          <span>Work</span>
          <span>Notes</span>
          <span>Contact</span>
        </span>
      </div>
      <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="p-6" style={{ background: roles.primary, color: "#fff" }}>
          <p className="font-mono text-[11px] uppercase tracking-widest opacity-80">Hero</p>
          <p className="mega mt-2 text-3xl leading-none">A page, not a swatch row.</p>
          <p className="mt-3 max-w-md text-[14px] leading-relaxed opacity-90">
            Primary fills the opening surface. Accent is reserved for the action.
          </p>
          <span
            className="mt-5 inline-block px-4 py-2 text-[13px] font-semibold"
            style={{ background: roles.accent, color: "#141414" }}
          >
            Primary action
          </span>
        </div>
        <div className="p-6" style={{ background: roles.secondary, color: "#141414" }}>
          <p className="font-mono text-[11px] uppercase tracking-widest opacity-70">Support</p>
          <p className="mt-3 text-[15px] leading-relaxed">
            Secondary holds supporting copy, cards and quieter bands so the
            primary color does not have to do every job.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-3 text-center text-[12px] font-medium">
        <div className="px-3 py-4" style={{ background: roles.primary, color: "#fff" }}>
          Primary {roles.primary}
        </div>
        <div className="px-3 py-4" style={{ background: roles.secondary, color: "#141414" }}>
          Secondary {roles.secondary}
        </div>
        <div className="px-3 py-4" style={{ background: roles.accent, color: "#141414" }}>
          Accent {roles.accent}
        </div>
      </div>
      <div className="px-5 py-4 text-[12px]" style={{ background: roles.dark, color: "#fff" }}>
        Dark grounds the footer and keeps the four roles readable as a system.
      </div>
    </div>
  );
}

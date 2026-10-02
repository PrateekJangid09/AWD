// A small, fixed library of hand-authored marks. Decorative only: every
// export is aria-hidden and never replaces a functional icon.
//
// Each arrow has its own curvature so two in one viewport never look stamped.

type Props = { className?: string; style?: React.CSSProperties };

const ink = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Curves down and to the left, as if pointing at something below a note. */
export function ArrowDownLeft({ className = "", style }: Props) {
  return (
    <svg aria-hidden viewBox="0 0 80 64" className={className} style={style}>
      <path {...ink} d="M74 6c-4 14-14 27-30 35-9 4.6-19 6.6-31 7.4" />
      <path {...ink} d="M21 40.5 12.4 48.6l10.4 5.6" />
    </svg>
  );
}

/** Long loose sweep to the right with a small loop. */
export function ArrowLoopRight({ className = "", style }: Props) {
  return (
    <svg aria-hidden viewBox="0 0 120 54" className={className} style={style}>
      <path
        {...ink}
        d="M4 40c14-2 24-8 29-17 3.4-6.2.2-12-5-10.6-6.4 1.7-5.6 12.4 2.4 17.4 14 8.8 44 5.6 80-7.8"
      />
      <path {...ink} d="M100 13.8l10.4 8.6-11.6 5" />
    </svg>
  );
}

/** Short arrow bending downward. */
export function ArrowDown({ className = "", style }: Props) {
  return (
    <svg aria-hidden viewBox="0 0 40 70" className={className} style={style}>
      <path {...ink} d="M14 4c-5 15-4 33 6 58" />
      <path {...ink} d="M11.6 52.4 20 63l6.6-11.4" />
    </svg>
  );
}

/** Up and to the right, slightly wobbly. */
export function ArrowUpRight({ className = "", style }: Props) {
  return (
    <svg aria-hidden viewBox="0 0 70 60" className={className} style={style}>
      <path {...ink} d="M6 54c8-5 14-12 21-22 7-9.6 16-18.4 33-25" />
      <path {...ink} d="M48.4 4.6 61 6.2 55.6 17" />
    </svg>
  );
}

/** Four-point spark, orange by default. */
export function Spark({ className = "", style }: Props) {
  return (
    <svg aria-hidden viewBox="0 0 40 40" className={className} style={style}>
      <path
        d="M20.4 2.6c.9 9.4 4.6 14.6 16.4 17.2-11.4 2.2-15.6 7.4-16.8 17.6-1.4-10-5.4-15.2-17.4-17.4 11.6-2.4 16.2-7.8 17.8-17.4Z"
        fill="#FF6112"
      />
    </svg>
  );
}

/** Rough circle to mark a word or object. */
export function ScribbleCircle({ className = "", style }: Props) {
  return (
    <svg aria-hidden viewBox="0 0 200 80" preserveAspectRatio="none" className={className} style={style}>
      <path
        fill="none"
        stroke="#FF6112"
        strokeWidth="2.2"
        strokeLinecap="round"
        d="M120 7C70 3 14 12 8 38c-5 22 44 37 103 34 52-2.6 85-17 82-36C190 14 140 4 84 9"
      />
    </svg>
  );
}

/** Corner bracket used to frame a screenshot. */
export function Bracket({ className = "", style }: Props) {
  return (
    <svg aria-hidden viewBox="0 0 30 30" className={className} style={style}>
      <path {...ink} d="M3 27c-.6-8-.4-15.4.6-23.4 7.6-.6 15-.8 23.4-.2" />
    </svg>
  );
}

/** Rough check mark. */
export function Check({ className = "", style }: Props) {
  return (
    <svg aria-hidden viewBox="0 0 30 26" className={className} style={style}>
      <path {...ink} stroke="#FF6112" strokeWidth={2.4} d="M3 14c3.4 2.6 6 5.6 8.4 9.4C15 14.6 20.4 7.4 27 3" />
    </svg>
  );
}

/**
 * A margin note in the handwriting face. Short phrases only; the note is
 * decorative, so the meaning must also exist in the real copy nearby.
 */
export function Note({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none select-none font-hand text-[22px] leading-none text-ink ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}

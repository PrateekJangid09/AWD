export default function Marquee({
  items,
  reverse = false,
  className = "",
}: {
  items: string[];
  reverse?: boolean;
  className?: string;
}) {
  const row = [...items, ...items];
  return (
    <div
      className={`flex overflow-hidden border-y border-line bg-bone py-4 ${className}`}
      aria-hidden="true"
    >
      <div
        className={`flex shrink-0 items-center gap-10 pr-10 ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
      >
        {row.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-10 text-[13px] font-semibold uppercase tracking-[0.18em] text-ink"
          >
            {item}
            <span className="h-1.5 w-1.5 rounded-full bg-orange" />
          </span>
        ))}
      </div>
    </div>
  );
}

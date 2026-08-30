// CSS-only entrance. Avoids client JS, layout reads, and delayed LCP.
export default function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: React.ElementType;
}) {
  const Comp = Tag as React.ElementType;
  return (
    <Comp
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
      className={`anim-up ${className}`}
    >
      {children}
    </Comp>
  );
}

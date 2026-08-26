import Image from "next/image";
import Link from "next/link";

export default function Logo({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      aria-label="AllWebsites.Design — home"
      className={`group inline-flex items-center gap-2.5 ${className}`}
    >
      <Image
        src="/logo.png"
        alt=""
        width={26}
        height={26}
        className="h-[26px] w-[26px] object-contain transition-transform duration-300 group-hover:-translate-y-0.5"
        priority
      />
      {!compact && (
        <span className="text-[16px] font-bold tracking-tight">
          AllWebsites
          <span className="text-muted">.design</span>
        </span>
      )}
    </Link>
  );
}

import Image from "next/image";
import Link from "next/link";

/**
 * Editorial wordmark: "allwebsites" in the serif, ".design" in orange with a
 * small hand-drawn underline. The underline is the one handmade mark allowed
 * to repeat on every page.
 */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-serif leading-none tracking-[-0.02em] ${className}`}>
      allwebsites
      <span className="relative inline-block text-orange">
        .design
        <svg
          aria-hidden
          viewBox="0 0 60 8"
          preserveAspectRatio="none"
          className="absolute -bottom-[0.18em] left-[6%] h-[0.2em] w-[92%]"
        >
          <path
            d="M2 5.6c12-2.6 27-3.4 41-2.8 5 .2 9.6.8 15 1.6"
            fill="none"
            stroke="#FF6112"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </span>
    </span>
  );
}

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
      aria-label="AllWebsites.Design home"
      className={`inline-flex items-center gap-2.5 text-ink ${className}`}
    >
      <Image
        src="/logo.png"
        alt=""
        width={30}
        height={30}
        className="h-[26px] w-[26px] object-contain"
        priority
      />
      {!compact && <Wordmark className="text-[25px]" />}
    </Link>
  );
}

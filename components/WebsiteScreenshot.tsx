import Image from "next/image";

/**
 * Renders a pre-generated capture from /sites/<slug>/.
 *
 * These files are already WebP at the size they are displayed, so they are
 * served straight from /public rather than through /_next/image. Routing them
 * through the optimizer produced one transformation per record per width per
 * format — several thousand in total — which exhausted the hosting image quota
 * and made the optimizer answer 402 for whichever variants were not already
 * cached. Google saw that as "resource couldn't be loaded" on random archive
 * pages. Nothing is gained by re-encoding a file that is already the right
 * format and size, so `unoptimized` keeps the request on the static asset.
 *
 * Optimization stays on for everything else; this component is only for the
 * generated /sites/ assets.
 */
type Common = {
  src: string;
  alt: string;
  className?: string;
  /** Above-the-fold only. Everything else stays lazy. */
  priority?: boolean;
};

type Props =
  | (Common & { fill: true; width?: never; height?: never })
  | (Common & { fill?: false; width: number; height: number });

export default function WebsiteScreenshot({
  src,
  alt,
  className,
  priority = false,
  fill,
  width,
  height,
}: Props) {
  if (fill) {
    return (
      <Image src={src} alt={alt} fill unoptimized priority={priority} className={className} />
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      unoptimized
      priority={priority}
      className={className}
    />
  );
}

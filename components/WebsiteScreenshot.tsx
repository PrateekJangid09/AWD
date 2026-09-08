import Image from "next/image";

type FillShot = {
  src: string;
  alt: string;
  fill: true;
  width?: never;
  height?: never;
  sizes: string;
  priority?: boolean;
  className?: string;
};

type SizedShot = {
  src: string;
  alt: string;
  fill?: false;
  width: number;
  height: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
};

/**
 * Archive screenshots are already generated WebP under /sites/{slug}/.
 * Serve them directly so crawlers request /sites/... instead of /_next/image.
 */
export default function WebsiteScreenshot(props: FillShot | SizedShot) {
  const { src, alt, sizes, priority = false, className } = props;

  if (props.fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        unoptimized
        priority={priority}
        className={className}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={props.width}
      height={props.height}
      sizes={sizes}
      unoptimized
      priority={priority}
      loading={priority ? undefined : "lazy"}
      className={className}
    />
  );
}

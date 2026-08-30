import { ogContentType, ogImage, ogSize } from "@/lib/og";

export const alt = "AllWebsites.Design manifesto";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({
    kicker: "AllWebsites.Design · Manifesto",
    title: "Useful inspiration needs context.",
    subtitle: "The philosophy behind the archive.",
  });
}

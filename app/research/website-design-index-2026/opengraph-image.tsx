import { ogContentType, ogImage, ogSize } from "@/lib/og";

export const alt = "2026 Website Design Index";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({
    kicker: "AllWebsites.Design · Research",
    title: "The 2026 Website Design Index.",
    subtitle: "A transparent snapshot of the archive — by category and count.",
  });
}

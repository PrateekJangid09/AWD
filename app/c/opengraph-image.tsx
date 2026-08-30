import { ogContentType, ogImage, ogSize } from "@/lib/og";

export const alt = "Explore website design by category";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({
    kicker: "AllWebsites.Design · Categories",
    title: "Explore by category.",
    subtitle: "See how each industry approaches type, colour and layout.",
  });
}

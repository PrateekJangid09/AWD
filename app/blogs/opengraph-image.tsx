import { ogContentType, ogImage, ogSize } from "@/lib/og";

export const alt = "Notes on how the web is designed";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({
    kicker: "AllWebsites.Design · Journal",
    title: "Notes on how the web is designed.",
    subtitle: "Essays on colour, typography, technology and archive findings.",
  });
}

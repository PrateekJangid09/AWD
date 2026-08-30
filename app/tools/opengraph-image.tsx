import { ogContentType, ogImage, ogSize } from "@/lib/og";

export const alt = "Free colour tools — AllWebsites.Design";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({
    kicker: "AllWebsites.Design · Tools",
    title: "Tools for studying colour.",
    subtitle: "Find, transform, build, preview and interpolate — free, in the browser.",
  });
}

import { ogContentType, ogImage, ogSize } from "@/lib/og";

export const alt = "Cookie preferences — AllWebsites.Design";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({
    kicker: "AllWebsites.Design · Cookies",
    title: "Cookie preferences.",
    subtitle: "Essential cookies stay on. Everything else is opt-in.",
  });
}

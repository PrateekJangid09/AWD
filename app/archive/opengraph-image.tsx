import { ogContentType, ogImage, ogSize } from "@/lib/og";

export const alt = "Search the AllWebsites.Design archive";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({
    kicker: "AllWebsites.Design · Archive",
    title: "Search every website.",
    subtitle: "Filter real sites by name, category, style and technology.",
  });
}

import { ogContentType, ogImage, ogSize } from "@/lib/og";

export const alt = "About AllWebsites.Design";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({
    kicker: "AllWebsites.Design · About",
    title: "A design-research layer for the public web.",
    subtitle: "How the archive, intelligence engine and workflow layer fit together.",
  });
}

import { ogContentType, ogImage, ogSize } from "@/lib/og";

export const alt = "Privacy policy — AllWebsites.Design";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({
    kicker: "AllWebsites.Design · Privacy",
    title: "What we collect, and why.",
    subtitle: "A short policy for a research archive that aims to collect little.",
  });
}

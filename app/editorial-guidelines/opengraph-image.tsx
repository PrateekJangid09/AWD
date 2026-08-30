import { ogContentType, ogImage, ogSize } from "@/lib/og";

export const alt = "Editorial guidelines — AllWebsites.Design";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({
    kicker: "AllWebsites.Design · Editorial",
    title: "How records get into the archive.",
    subtitle: "Inclusion, classification and correction policy.",
  });
}

import { ogContentType, ogImage, ogSize } from "@/lib/og";

export const alt = "Contact AllWebsites.Design editorial";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({
    kicker: "AllWebsites.Design · Contact",
    title: "Corrections and editorial questions.",
    subtitle: "Tell us if a record is wrong, outdated or miscategorised.",
  });
}

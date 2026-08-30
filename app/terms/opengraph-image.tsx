import { ogContentType, ogImage, ogSize } from "@/lib/og";

export const alt = "Terms & conditions — AllWebsites.Design";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({
    kicker: "AllWebsites.Design · Terms",
    title: "Terms that govern the archive.",
    subtitle: "Third-party ownership, accuracy limits and how the catalogue is used.",
  });
}

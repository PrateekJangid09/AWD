import { ogContentType, ogImage, ogSize } from "@/lib/og";

export const alt = "Submit a site to AllWebsites.Design";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({
    kicker: "AllWebsites.Design · Submit",
    title: "Nominate a website for the archive.",
    subtitle: "Every submission is reviewed against our editorial guidelines.",
  });
}

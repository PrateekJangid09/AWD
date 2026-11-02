import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

const title = "Website Components";
const description =
  "Free website sections and buttons. Copy for Framer or Cursor, copy or download the complete code, or open a piece in Website Builder. Free, in the browser.";

export const metadata: Metadata = pageMeta({
  title,
  description,
  path: "/components",
});

export default function ComponentsPage() {
  return (
    <>
      <h1 className="sr-only">Website Components</h1>
      <iframe
        title="Website Components"
        src="/webpalette/components.html"
        className="block h-[calc(100dvh-4rem)] w-full border-0 bg-white"
      />
    </>
  );
}

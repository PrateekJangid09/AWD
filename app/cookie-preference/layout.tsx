import type { Metadata } from "next";
import ExploreMore from "@/components/ExploreMore";
import JsonLd from "@/components/JsonLd";
import { pageJsonLd, pageMeta } from "@/lib/seo";

const title = "Cookie Preferences";
const description =
  "Essential cookies keep the archive running. Everything else is opt-in and saved in your browser.";

export const metadata: Metadata = pageMeta({
  title,
  description,
  path: "/cookie-preference",
});

export default function CookiePreferenceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd
        data={pageJsonLd({
          name: title,
          description,
          path: "/cookie-preference",
          crumbs: [
            { name: "Home", path: "/" },
            { name: "Cookies", path: "/cookie-preference" },
          ],
        })}
      />
      {children}
      <ExploreMore />
    </>
  );
}

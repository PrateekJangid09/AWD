import type { Metadata } from "next";
import ExploreMore from "@/components/ExploreMore";
import JsonLd from "@/components/JsonLd";
import { pageMeta, typedPageGraph } from "@/lib/seo";

const title = "Cookie Preferences";
const description =
  "Essential cookies keep the archive running. Analytics, functional and marketing cookies are opt-in, saved only in your browser, and changeable here at any time.";

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
        data={typedPageGraph({
          type: "WebPage",
          path: "/cookie-preference",
          name: title,
          description,
          crumbs: [
            { name: "Home", path: "/" },
            { name: "Cookies" },
          ],
        })}
      />
      {children}
      <ExploreMore />
    </>
  );
}

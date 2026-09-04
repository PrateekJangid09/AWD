import type { Metadata } from "next";
import StatusPage from "@/components/StatusPage";
import { CANONICAL } from "@/lib/canonical";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "404 — Page Not Found",
  description: "This route isn't in the archive.",
  path: "/404",
  index: false,
});

export default function NotFound() {
  return (
    <StatusPage
      code="404"
      tag="Not found"
      title="This reference isn't in the archive."
      message={`The page you're after moved, changed slug, or never existed. The archive, however, is very much alive — ${CANONICAL.length.toLocaleString()} references and counting.`}
      actions={[
        { href: "/archive", label: "Browse archive", primary: true },
        { href: "/c", label: "All categories" },
        { href: "/", label: "Back home" },
      ]}
    />
  );
}

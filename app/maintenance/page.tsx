import type { Metadata } from "next";
import StatusPage from "@/components/StatusPage";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Down for Maintenance",
  description: "The archive is being updated. Back shortly.",
  path: "/maintenance",
  index: false,
});

export default function MaintenancePage() {
  return (
    <StatusPage
      code="503"
      tag="Maintenance"
      title="Re-indexing the archive."
      message="We're running a batch import and quality pass — new references, cleaner taxonomy, fresher captures. The archive will be back in a few minutes."
      accent="#2536FF"
      actions={[
        { href: "/", label: "Try again", primary: true },
        { href: "/research/website-design-index-2026", label: "Read the 2026 Index" },
      ]}
    />
  );
}

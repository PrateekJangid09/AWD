import type { Metadata } from "next";
import StatusPage from "@/components/StatusPage";

export const metadata: Metadata = {
  title: "404 — Page Not Found",
  description: "This route isn't in the archive.",
};

export default function NotFound() {
  return (
    <StatusPage
      code="404"
      tag="ROUTE_NOT_FOUND"
      title="This reference isn't in the archive."
      message="The page you're after moved, changed slug, or never existed. The archive, however, is very much alive — 5,896 references and counting."
      actions={[
        { href: "/archive", label: "Browse archive", primary: true },
        { href: "/c", label: "All categories" },
        { href: "/", label: "Back home" },
      ]}
    />
  );
}

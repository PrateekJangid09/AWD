import type { Metadata } from "next";
import StatusPage from "@/components/StatusPage";

export const metadata: Metadata = {
  title: "403 — Access Denied",
  description: "You don't have permission to view this resource.",
  robots: { index: false, follow: false },
};

export default function AccessDeniedPage() {
  return (
    <StatusPage
      code="403"
      tag="ACCESS_DENIED"
      title="This area is off-limits."
      message="You don't have permission to view this resource. Admin and internal intelligence surfaces are kept strictly separate from the public archive. If you think this is a mistake, get in touch."
      accent="#0A0A0A"
      actions={[
        { href: "/", label: "Back to safety", primary: true },
        { href: "/contact", label: "Contact editorial" },
      ]}
    />
  );
}

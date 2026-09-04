import Link from "next/link";

export const POLICY_LINKS = [
  { href: "/pricing", label: "Pricing" },
  { href: "/terms", label: "Terms of service" },
  { href: "/privacy-policy", label: "Privacy policy" },
  { href: "/refund-policy", label: "Refund policy" },
] as const;

# Canonical public URLs for policy pages.
export const PUBLIC_POLICY_URLS = {
  pricing: "https://allwebsites.design/pricing",
  terms: "https://allwebsites.design/terms",
  privacy: "https://allwebsites.design/privacy-policy",
  refunds: "https://allwebsites.design/refund-policy",
} as const;

export default function PolicyNav({ current }: { current?: string }) {
  return (
    <nav aria-label="Terms and policies" className="mt-6 flex flex-wrap gap-2">
      {POLICY_LINKS.map((link) => {
        const active = current === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={
              active
                ? "rounded-full bg-ink px-3 py-1.5 text-[12px] font-medium text-paper"
                : "rounded-full border border-line px-3 py-1.5 text-[12px] font-medium text-soft hover:border-ink hover:text-ink"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import DocumentHero from "@/components/DocumentHero";
import ExploreMore from "@/components/ExploreMore";
import JsonLd from "@/components/JsonLd";
import PolicyNav from "@/components/PolicyNav";
import { CONTACT_EMAIL, pageMeta, typedPageGraph } from "@/lib/seo";

const title = "Terms of service";
const description =
  "Terms of service for AllWebsites.Design: the archive, free browser tools, and Figma plugin subscriptions billed by Paddle at $3 a month or $30 a year.";

export const metadata: Metadata = pageMeta({
  title,
  description,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <JsonLd
        data={typedPageGraph({
          type: "WebPage",
          path: "/terms",
          name: title,
          description,
          crumbs: [
            { name: "Home", path: "/" },
            { name: "Terms" },
          ],
        })}
      />
      <DocumentHero
        title="Terms of service"
        description="The agreement that covers the archive, the free browser tools, and paid Figma plugin access."
        updated="4 September 2026"
        breadcrumb={[{ href: "/", label: "Home" }, { label: "Terms" }]}
      />

      <section className="py-14 sm:py-20">
        <div className="wrap grid gap-12 lg:grid-cols-[0.28fr_0.72fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="font-mono text-[11px] uppercase tracking-widest text-ink/45">
              On this page
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                ["who", "Who we are"],
                ["product", "What we sell"],
                ["plugins", "Figma plugins"],
                ["billing", "Billing"],
                ["licence", "Licence"],
                ["archive", "Archive and tools"],
                ["prohibited", "Prohibited use"],
                ["liability", "Liability"],
                ["law", "Contact"],
              ].map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`} className="text-ink/60 hover:text-orange">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <PolicyNav current="/terms" />
          </aside>

          <article className="prose max-w-2xl">
            <p>
              By using AllWebsites.Design you agree to these terms of service. If you
              buy a plugin subscription, Paddle's buyer terms also apply to that
              purchase.
            </p>

            <h2 id="who">Who we are</h2>
            <p>
              These terms are published by Prateek Jangid, operating AllWebsites.Design
              as a sole proprietor. Contact:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Website:{" "}
              <a href="https://allwebsites.design">https://allwebsites.design</a>.
            </p>
            <p>
              Merchant of record for paid plugin subscriptions is Paddle.com Market
              Limited (and its affiliates). Paddle handles checkout, invoices, sales
              tax / VAT where applicable, and appears on your payment statement.
            </p>

            <h2 id="product">What we sell</h2>
            <p>
              AllWebsites.Design is a website-design research archive and a set of
              colour tools. The website archive and the in-browser tools are free.
              What we sell through Paddle is paid access to four Figma plugins that
              use the same engines:
            </p>
            <ul>
              <li>Chromary (colour name finder)</li>
              <li>Colorhyme (colour harmony generator)</li>
              <li>TrueGradient (OKLCH gradient generator)</li>
              <li>WebPalette (website colour palette generator)</li>
            </ul>
            <p>
              Current prices are listed on the{" "}
              <Link href="/pricing">pricing page</Link>: $3 per month or $30 per year
              for the suite. One subscription unlocks all four plugins.
            </p>

            <h2 id="plugins">Figma plugins</h2>
            <p>
              Each plugin includes three free uses per Figma account (apply a fill,
              create a paint style, or drop labelled swatches). After that, a
              subscription is required. Free uses are counted per plugin, not shared
              across plugins. We identify your Figma account by Figma's user id; we
              do not read your canvas except when you run the plugin.
            </p>
            <p>
              Plugins require the Figma desktop app. They are delivered digitally. We
              do not ship physical goods.
            </p>

            <h2 id="billing">Billing, renewal, and cancellation</h2>
            <p>
              Subscriptions renew automatically at the end of each month or year until
              you cancel. Cancel at any time. You keep access until the end of the
              period you already paid for. After that, each plugin returns to three
              free uses. See the{" "}
              <Link href="/refund-policy">refund and cancellation policy</Link>.
            </p>
            <p>
              Paddle sends receipts and cancellation links to the email you use at
              checkout. You can also email {CONTACT_EMAIL}.
            </p>

            <h2 id="licence">Licence</h2>
            <p>
              A paid subscription lets you use the four plugins in your own Figma
              files for the duration of the subscription. You may not resell, rent,
              or redistribute the plugins, or remove our branding from the plugin UI.
              Palettes, colours, and files you create with the plugins remain yours.
            </p>

            <h2 id="archive">Archive and browser tools</h2>
            <p>
              The archive is a reference layer for design research. It is not the
              authoritative source for any third-party company it mentions. Browser
              tools (including Mockupalettes) run in your browser and are free. Third-party
              names, screenshots, and trademarks remain the property of their owners.
              Inclusion does not imply endorsement.
            </p>
            <ul>
              <li>Browse the archive and follow source links</li>
              <li>Use references to inform your own original design work</li>
              <li>Do not scrape the site in a way that harms availability</li>
              <li>Do not claim third-party work as your own</li>
            </ul>

            <h2 id="prohibited">Prohibited use</h2>
            <ul>
              <li>Misusing or disrupting the service</li>
              <li>Sharing a paid subscription in a way that bypasses the paywall</li>
              <li>Using the plugins or archive for unlawful work</li>
            </ul>

            <h2 id="liability">Liability</h2>
            <p>
              Tools and palettes are offered as-is. We do not guarantee that any
              colour combination meets accessibility, brand, or regulatory
              requirements for your project. To the extent permitted by law, we are
              not liable for indirect or consequential loss arising from use of this
              site or the plugins.
            </p>

            <h2 id="law">Contact</h2>
            <p>
              Questions:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or the{" "}
              <Link href="/contact">contact page</Link>. Related policies:{" "}
              <Link href="/privacy-policy">privacy</Link>,{" "}
              <Link href="/refund-policy">refunds</Link>,{" "}
              <Link href="/pricing">pricing</Link>.
            </p>
          </article>
        </div>
      </section>
      <ExploreMore />
    </>
  );
}

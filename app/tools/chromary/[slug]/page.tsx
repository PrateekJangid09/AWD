import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import ExploreMore from "@/components/ExploreMore";
import JsonLd from "@/components/JsonLd";
import {
  NAMED_COLORS,
  getNamedColor,
  namedColorH1,
  namedColorPath,
  namedColorTitle,
  similarNamedColors,
  type NamedColor,
} from "@/lib/named-colors";
import {
  absUrl,
  colorPageGraph,
  fitDescription,
  pageMeta,
} from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return NAMED_COLORS.map((color) => ({ slug: color.slug }));
}

function colorDescription(color: NamedColor) {
  const aliases = color.aliases.map((alias) => alias.name).slice(0, 3);
  return fitDescription(
    `${color.name} is ${color.hex}. Find the color name, HEX, source group and similar named colors.`,
    [
      aliases.length ? ` Also listed as ${aliases.join(", ")}.` : "",
      ` Source group: ${color.group}.`,
      " Use it in Colorhyme or WebPalette.",
    ],
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const color = getNamedColor(slug);
  if (!color) return { title: "Color not found" };
  const path = namedColorPath(color.slug);
  return pageMeta({
    title: namedColorTitle(color),
    description: colorDescription(color),
    path,
    image: {
      url: `${path}/opengraph-image`,
      width: 1200,
      height: 630,
      alt: `${color.name} ${color.hex} color swatch`,
    },
  });
}

function contrastInk(hex: string) {
  const raw = hex.replace("#", "");
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#141414" : "#ffffff";
}

export default async function NamedColorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const color = getNamedColor(slug);
  if (!color) notFound();

  const path = namedColorPath(color.slug);
  const neighbors = similarNamedColors(color, 6);
  const description = colorDescription(color);
  const aliases = color.aliases;
  const faqs = [
    {
      question: "What is this color called?",
      answer: `This HEX is most often called ${color.name}. Chromary keeps the source group attached because the same name can mean different shades.`,
    },
    {
      question: "HEX to color name",
      answer: `${color.hex} maps to ${color.name} on this page. Paste the same HEX in Chromary to compare CSS, survey and curated names.`,
    },
    {
      question: "How do I use this HEX in a palette?",
      answer: "Open Colorhyme to build related colors from this HEX, or WebPalette to keep it as a brand color in a full website system.",
    },
  ];

  return (
    <>
      <JsonLd
        data={colorPageGraph({
          path,
          name: namedColorTitle(color),
          description,
          crumbs: [
            { name: "Home", path: "/" },
            { name: "Tools", path: "/tools" },
            { name: "Chromary", path: "/tools/chromary" },
            { name: color.name },
          ],
          neighbors: neighbors.map((item) => ({
            name: item.name,
            url: absUrl(namedColorPath(item.slug)),
          })),
          faqs,
        })}
      />

      <article>
        <header className="border-b border-line bg-paper">
          <div className="wrap py-10 sm:py-14">
            <Breadcrumb
              items={[
                { href: "/", label: "Home" },
                { href: "/tools", label: "Tools" },
                { href: "/tools/chromary", label: "Chromary" },
                { label: color.name },
              ]}
            />
            <p className="eyebrow mt-8 text-orange">{color.group}</p>
            <h1 className="mega mt-4 text-4xl sm:text-5xl">{namedColorH1(color)}</h1>
            <p className="mt-4 max-w-2xl text-pretty text-[17px] leading-relaxed text-ink/80">
              {color.name} is the primary name for {color.hex}. This page lists
              the HEX, the source group, other names for the same value, and
              nearby named colors.
            </p>
          </div>
        </header>

        <div className="wrap py-12 sm:py-16">
          <div
            className="flex min-h-[220px] items-end border border-ink p-6"
            style={{ background: color.hex, color: contrastInk(color.hex) }}
          >
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest opacity-80">
                Swatch
              </p>
              <p className="mega mt-2 text-4xl">{color.name}</p>
              <p className="mt-2 font-mono text-sm">{color.hex}</p>
            </div>
          </div>

          <section className="mt-12">
            <h2 className="display text-2xl sm:text-3xl">Names and values</h2>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="border border-line bg-paper p-5">
                <dt className="font-mono text-[11px] uppercase tracking-widest text-muted">
                  Primary name
                </dt>
                <dd className="mt-2 text-[16px] font-medium">{color.name}</dd>
              </div>
              <div className="border border-line bg-paper p-5">
                <dt className="font-mono text-[11px] uppercase tracking-widest text-muted">
                  HEX
                </dt>
                <dd className="mt-2 font-mono text-[16px]">{color.hex}</dd>
              </div>
              <div className="border border-line bg-paper p-5">
                <dt className="font-mono text-[11px] uppercase tracking-widest text-muted">
                  Source group
                </dt>
                <dd className="mt-2 text-[16px]">{color.group}</dd>
              </div>
              <div className="border border-line bg-paper p-5">
                <dt className="font-mono text-[11px] uppercase tracking-widest text-muted">
                  Other names for this HEX
                </dt>
                <dd className="mt-2 text-[16px]">
                  {aliases.length
                    ? aliases.map((alias) => `${alias.name} (${alias.group})`).join(", ")
                    : "No other names in the Chromary library."}
                </dd>
              </div>
            </dl>
          </section>

          <section className="mt-12">
            <h2 className="display text-2xl sm:text-3xl">Similar colors</h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-soft">
              Nearby named colors, ranked in Oklab. Each link is a unique HEX
              page, not a duplicate name URL.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {neighbors.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={namedColorPath(item.slug)}
                    className="flex items-center gap-3 border border-line bg-paper p-3 transition-colors hover:border-ink"
                  >
                    <span
                      className="h-12 w-12 shrink-0 border border-line"
                      style={{ background: item.hex }}
                      aria-hidden
                    />
                    <span>
                      <span className="block text-[15px] font-medium">{item.name}</span>
                      <span className="block font-mono text-[12px] text-muted">{item.hex}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12">
            <h2 className="display text-2xl sm:text-3xl">Use this color</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/tools/colorhyme?base=${color.hex.slice(1)}`}
                className="btn-primary"
              >
                Use in Colorhyme
              </Link>
              <Link
                href={`/tools/webpalette?hex=${color.hex.slice(1)}`}
                className="btn-ghost"
              >
                Use in WebPalette
              </Link>
              <Link href="/tools/chromary" className="btn-ghost">
                Open Chromary
              </Link>
            </div>
          </section>

          <section className="mt-16 border-t border-line pt-12" id="faq">
            <h2 className="display text-2xl sm:text-3xl">Questions people also ask</h2>
            <div className="mt-8 divide-y divide-line border-y border-line">
              {faqs.map((faq) => (
                <details key={faq.question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-[16px] font-medium text-ink">
                    {faq.question}
                    <span className="mt-1 shrink-0 text-orange" aria-hidden>+</span>
                  </summary>
                  <p className="mt-3 text-pretty text-[15px] leading-relaxed text-soft">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </article>
      <ExploreMore except={["/tools"]} />
    </>
  );
}

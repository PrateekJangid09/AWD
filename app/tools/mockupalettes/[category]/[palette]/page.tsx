import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import ExploreMore from "@/components/ExploreMore";
import JsonLd from "@/components/JsonLd";
import PaletteLayoutPreview from "@/components/PaletteLayoutPreview";
import {
  WEBSITE_PALETTES,
  getWebsitePalette,
  mapPaletteRoles,
  paletteCategoryPath,
  palettePath,
  paletteTitle,
} from "@/lib/mockupalettes";
import { fitDescription, pageMeta, palettePageGraph } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return WEBSITE_PALETTES.map((palette) => ({
    category: palette.categorySlug,
    palette: palette.slug,
  }));
}

function paletteDescription(name: string, category: string, colors: string[]) {
  return fitDescription(
    `${name} is a ${category.toLowerCase()} website palette using ${colors.join(", ")} on a real page.`,
    [
      " See the four roles on a static layout.",
      " Then open the same preset live in Mockupalettes.",
    ],
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; palette: string }>;
}): Promise<Metadata> {
  const { category, palette: slug } = await params;
  const palette = getWebsitePalette(category, slug);
  if (!palette) return { title: "Palette not found" };
  const path = palettePath(palette);
  return pageMeta({
    title: paletteTitle(palette.name),
    description: paletteDescription(palette.name, palette.category, palette.colors),
    path,
    image: {
      url: `${path}/opengraph-image`,
      width: 1200,
      height: 630,
      alt: `${palette.name} four-color website palette`,
    },
  });
}

export default async function PalettePage({
  params,
}: {
  params: Promise<{ category: string; palette: string }>;
}) {
  const { category, palette: slug } = await params;
  const palette = getWebsitePalette(category, slug);
  if (!palette) notFound();

  const path = palettePath(palette);
  const roles = mapPaletteRoles(palette.colors);
  const description = paletteDescription(palette.name, palette.category, palette.colors);
  const faqs = [
    {
      question: `Why does ${palette.name} fit ${palette.category.toLowerCase()} sites?`,
      answer: `${palette.description} The four HEX values stay unique to this page so you can judge the system before opening the live tool.`,
    },
    {
      question: "How do I preview this palette on a real layout?",
      answer: "Use the static preview on this page, then open it live in Mockupalettes with the palette query parameter.",
    },
  ];

  return (
    <>
      <JsonLd
        data={palettePageGraph({
          path,
          name: paletteTitle(palette.name),
          description,
          crumbs: [
            { name: "Home", path: "/" },
            { name: "Tools", path: "/tools" },
            { name: "Mockupalettes", path: "/tools/mockupalettes" },
            { name: palette.category, path: paletteCategoryPath(palette.categorySlug) },
            { name: palette.name },
          ],
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
                { href: "/tools/mockupalettes", label: "Mockupalettes" },
                { href: paletteCategoryPath(palette.categorySlug), label: palette.category },
                { label: palette.name },
              ]}
            />
            <p className="eyebrow mt-8 text-orange">{palette.category}</p>
            <h1 className="mega mt-4 text-4xl sm:text-5xl">{palette.name}</h1>
            <p className="mt-4 max-w-2xl text-pretty text-[17px] leading-relaxed text-ink/80">
              {palette.description} These four HEX values stay on this page so
              you can read the system before opening the live mockup.
            </p>
          </div>
        </header>

        <div className="wrap py-12 sm:py-16">
          <section>
            <h2 className="display text-2xl sm:text-3xl">Four HEX values</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {palette.colors.map((hex) => (
                <li key={hex} className="border border-line">
                  <span className="block h-24" style={{ background: hex }} />
                  <span className="block px-3 py-2 font-mono text-[13px]">{hex}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12">
            <h2 className="display text-2xl sm:text-3xl">Role mapping</h2>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              {Object.entries(roles).map(([role, hex]) => (
                <div key={role} className="flex items-center gap-3 border border-line bg-paper p-4">
                  <span className="h-10 w-10 border border-line" style={{ background: hex }} />
                  <div>
                    <dt className="font-mono text-[11px] uppercase tracking-widest text-muted">
                      {role}
                    </dt>
                    <dd className="font-mono text-[15px]">{hex}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-12">
            <h2 className="display text-2xl sm:text-3xl">
              Why this fits {palette.category.toLowerCase()} work
            </h2>
            <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-ink/80">
              {palette.description} Primary, secondary, accent and dark are
              assigned with the same luminance and saturation heuristic the live
              tool uses, so this page and the mockup stay aligned.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="display text-2xl sm:text-3xl">Static layout preview</h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-soft">
              A fixed composition, not a second copy of the Mockupalettes tool.
            </p>
            <div className="mt-6">
              <PaletteLayoutPreview roles={roles} name={palette.name} />
            </div>
            <div className="mt-6">
              <Link
                href={`/tools/mockupalettes?palette=${palette.slug}`}
                className="btn-primary"
              >
                Open live in Mockupalettes
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

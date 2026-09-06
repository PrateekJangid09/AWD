import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import ExploreMore from "@/components/ExploreMore";
import JsonLd from "@/components/JsonLd";
import {
  PALETTE_CATEGORIES,
  getPaletteCategory,
  paletteCategoryPath,
  paletteCategoryTitle,
  palettePath,
  palettesInCategory,
} from "@/lib/mockupalettes";
import {
  absUrl,
  collectionPageGraph,
  fitDescription,
  pageMeta,
} from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return PALETTE_CATEGORIES.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = getPaletteCategory(category);
  if (!cat) return { title: "Category not found" };
  const palettes = palettesInCategory(cat.slug);
  return pageMeta({
    title: paletteCategoryTitle(cat.name),
    description: fitDescription(
      `${cat.name} website color palettes you can preview on a real page layout.`,
      [
        ` ${palettes.length} four-color systems sit in this category.`,
        " Open a palette page, then load the same preset live in Mockupalettes.",
        " Browse them free.",
      ],
    ),
    path: paletteCategoryPath(cat.slug),
  });
}

export default async function PaletteCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = getPaletteCategory(category);
  if (!cat) notFound();
  const palettes = palettesInCategory(cat.slug);
  const path = paletteCategoryPath(cat.slug);
  const description = `${cat.name} color palettes you can see on a real page. Each card links to a unique four-hex system.`;

  return (
    <>
      <JsonLd
        data={collectionPageGraph({
          path,
          name: paletteCategoryTitle(cat.name),
          description,
          crumbs: [
            { name: "Home", path: "/" },
            { name: "Tools", path: "/tools" },
            { name: "Mockupalettes", path: "/tools/mockupalettes" },
            { name: cat.name },
          ],
          listName: `${cat.name} website palettes`,
          items: palettes.map((palette) => ({
            name: palette.name,
            url: absUrl(palettePath(palette)),
          })),
        })}
      />

      <section className="border-b border-line bg-paper">
        <div className="wrap py-10 sm:py-14">
          <Breadcrumb
            items={[
              { href: "/", label: "Home" },
              { href: "/tools", label: "Tools" },
              { href: "/tools/mockupalettes", label: "Mockupalettes" },
              { label: cat.name },
            ]}
          />
          <h1 className="display mt-8 text-4xl sm:text-5xl">
            {cat.name} color palettes you can see on a real page
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-[17px] leading-relaxed text-ink/80">
            {palettes.length} {cat.name.toLowerCase()} palettes. Each one keeps
            four HEX values and opens in Mockupalettes with a live layout.
          </p>
        </div>
      </section>

      <section className="wrap py-12 sm:py-16">
        <ul className="grid gap-4 sm:grid-cols-2">
          {palettes.map((palette) => (
            <li key={palette.slug}>
              <Link
                href={palettePath(palette)}
                className="block border border-line bg-paper p-5 transition-colors hover:border-ink"
              >
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
                  {palette.category}
                </span>
                <strong className="mt-2 block text-[18px]">{palette.name}</strong>
                <span className="mt-2 block text-[14px] leading-relaxed text-soft">
                  {palette.description}
                </span>
                <span className="mt-4 flex h-12 overflow-hidden border border-line">
                  {palette.colors.map((hex) => (
                    <span key={hex} className="flex-1" style={{ background: hex }} />
                  ))}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex flex-wrap gap-3">
          {PALETTE_CATEGORIES.filter((item) => item.slug !== cat.slug).map((item) => (
            <Link key={item.slug} href={paletteCategoryPath(item.slug)} className="btn-ghost">
              {item.name}
            </Link>
          ))}
          <Link href="/tools/mockupalettes" className="btn-primary">
            Open live Mockupalettes
          </Link>
        </div>
      </section>
      <ExploreMore except={["/tools"]} />
    </>
  );
}

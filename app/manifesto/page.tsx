import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import ExploreMore from "@/components/ExploreMore";
import JsonLd from "@/components/JsonLd";
import { pageMeta, typedPageGraph } from "@/lib/seo";

const title = "Manifesto";
const description =
  "Useful inspiration needs context. Why every website here is studied with its palette, typography and detected technology, not shown as a bare thumbnail.";

export const metadata: Metadata = pageMeta({
  title,
  description,
  path: "/manifesto",
});

export default function ManifestoPage() {
  return (
    <>
      <JsonLd
        data={typedPageGraph({
          type: "WebPage",
          path: "/manifesto",
          name: title,
          description,
          crumbs: [
            { name: "Home", path: "/" },
            { name: "Manifesto" },
          ],
        })}
      />
      <PageHero
        eyebrow="PHILOSOPHY"
        title="Useful inspiration needs context."
        breadcrumb={[{ href: "/", label: "Home" }, { label: "Manifesto" }]}
      />

      <section className="py-16 sm:py-24">
        <div className="wrap max-w-3xl">
          <div className="space-y-8">
            {[
              "A design archive should help you compare decisions — not manufacture facts or disguise unfinished products.",
              "We preserve source links. We expose the limits of automated classification. We remove placeholder records. We keep public counts tied to a single source of truth.",
              "We don't tell designers what to copy. We make strong digital work easier to discover, study and understand.",
            ].map((line, i) => (
              <p
                key={i}
                className="text-balance font-display text-2xl font-semibold leading-snug tracking-tight sm:text-4xl"
              >
                {line.split("—").map((part, j) =>
                  j === 0 ? (
                    part
                  ) : (
                    <span key={j}>
                      <span className="text-orange">—</span>
                      {part}
                    </span>
                  ),
                )}
              </p>
            ))}
          </div>

          <div className="mt-14 flex flex-wrap gap-3">
            <Link href="/archive" className="btn-primary">
              Explore the archive
            </Link>
            <Link href="/about" className="btn-ghost">
              About the project
            </Link>
          </div>
        </div>
      </section>
      <ExploreMore except={["/about"]} />
    </>
  );
}

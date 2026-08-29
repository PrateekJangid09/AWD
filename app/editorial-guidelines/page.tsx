import type { Metadata } from "next";
import Link from "next/link";
import DocumentHero from "@/components/DocumentHero";

export const metadata: Metadata = {
  title: "Editorial Guidelines",
  description:
    "The inclusion, integrity and taxonomy policy behind the AllWebsites.Design archive.",
};

export default function EditorialGuidelinesPage() {
  return (
    <>
      <DocumentHero
        title="Editorial Guidelines"
        description="How records get in, how they're classified, and how we keep the archive honest."
        updated="11 August 2026"
        breadcrumb={[{ href: "/", label: "Home" }, { label: "Editorial Guidelines" }]}
      />

      <section className="py-14 sm:py-20">
        <div className="wrap max-w-2xl">
          <article className="prose">
            <h2>Selection criteria</h2>
            <p>To be included, a record should have:</p>
            <ul>
              <li>A real, reachable official destination</li>
              <li>A usable design capture</li>
              <li>Enough visual or structural reference value</li>
            </ul>

            <h2>Integrity rules</h2>
            <p>The catalogue excludes or removes records that are:</p>
            <ul>
              <li>Hidden or placeholder</li>
              <li>Duplicate</li>
              <li>Platform-hosted rather than a valid destination</li>
              <li>Obviously inferred or invalid</li>
            </ul>
            <p>
              Unsupported imported product claims are replaced with neutral archive
              language. We don&apos;t manufacture facts about a business the source
              doesn&apos;t establish.
            </p>

            <h2>Taxonomy policy</h2>
            <ul>
              <li>Source tags can be retained for transparency</li>
              <li>Source tags are mapped into a governed category system</li>
              <li>Automated classifications are labelled as such</li>
              <li>Reviewed corrections override automated mapping</li>
            </ul>

            <h2>Corrections</h2>
            <p>
              Websites and businesses change; the official website is always the
              authority for current facts. Anyone can{" "}
              <Link href="/contact">request a correction</Link> and we prioritise them.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}

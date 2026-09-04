import Link from "next/link";
import {
  DataTable,
  Figure,
  Method,
  P,
  Q,
  Related,
} from "@/components/journal/ArticleParts";
import { archiveStats, typographyStats } from "@/lib/insights";

export default function HeadingSizes() {
  const type = typographyStats();
  const archive = archiveStats();

  const agency = type.categories.find((c) => c.name === "Agency & Studio");
  const saas = type.categories.find((c) => c.name === "Technology & SaaS");
  const portfolio = type.categories.find((c) => c.name === "Portfolio");
  const topFace = type.topFaces[0];
  const gap =
    (agency?.medianLargestType ?? 0) - (saas?.medianLargestType ?? 0);

  return (
    <>
      <P>
        Every type scale article you have read was written from taste. This one
        is written from measurement. We recorded the rendered type sizes on{" "}
        {type.sample} websites, took the largest heading on each, and grouped
        the results by industry to see whether the number moves.
      </P>
      <P>It moves a lot, and in a direction that says more about sales than style.</P>

      <Q id="median">What is the median website headline size?</Q>
      <P>
        {type.archiveMedian}px, across {type.sample} sites where type sizes
        could be captured at desktop width. That is the number to argue against,
        not the number to copy. Half the archive sets its largest heading below
        it and half above, and which half you belong in is mostly decided by
        what your homepage is trying to do.
      </P>

      <Figure
        value={`${type.archiveMedian}px`}
        label="Median largest heading across the archive"
        note={`n=${type.sample} sites with captured type sizes, out of ${archive.records} records.`}
      />

      <Q id="industry">Which industries use the biggest type?</Q>
      <P>
        Retail and agency work sit at the top; utility interfaces sit at the
        bottom. The cleanest comparison in the table is also the one with the
        two largest samples: agency and studio sites run a{" "}
        {agency?.medianLargestType ?? 0}px median across {agency?.count ?? 0}{" "}
        records, while technology and SaaS sites run{" "}
        {saas?.medianLargestType ?? 0}px across {saas?.count ?? 0}. A{" "}
        {gap}px gap between the two largest groups in the archive is not noise.
      </P>

      <DataTable
        caption={`Median largest heading by industry, for categories with at least ten records. Smaller categories are excluded because a single oversized hero can move a median built from five sites.`}
        columns={[
          { key: "name", head: "Industry" },
          { key: "size", head: "Median largest type", align: "right" },
          { key: "count", head: "Sites", align: "right" },
        ]}
        rows={type.categories.map((c) => ({
          key: c.slug,
          href: `/c/${c.slug}`,
          name: c.name,
          size: `${c.medianLargestType}px`,
          count: c.count,
        }))}
      />

      <Q id="why">Why do agencies set larger headlines than SaaS companies?</Q>
      <P>
        Because they are selling different things in the same rectangle. An
        agency homepage sells taste, so the headline is not describing the
        product, it is the product demonstration. Setting it at{" "}
        {agency?.medianLargestType ?? 0}px is the argument.
      </P>
      <P>
        A SaaS homepage sells a task. The headline has to share the fold with a
        product screenshot, a signup field, a logo wall and usually a secondary
        link, and every pixel the headline takes is one the proof does not get.
        At {saas?.medianLargestType ?? 0}px it states the value and moves out of
        the way. Portfolio sites land between the two at{" "}
        {portfolio?.medianLargestType ?? 0}px across {portfolio?.count ?? 0}{" "}
        records, which fits: the work is the evidence, so the name does not have
        to shout as hard as an agency's does.
      </P>

      <Q id="faces">How many typefaces does a typical website use?</Q>
      <P>
        {type.medianFontsPerSite}, as a median. The archive holds{" "}
        {type.distinctFaces} distinct families in total, which sounds like
        variety until you look at the distribution.{" "}
        {topFace?.name ?? "One family"} alone appears on {topFace?.count ?? 0}{" "}
        sites, {topFace?.share ?? 0}% of the {archive.records} records. The
        common pattern is one workhorse sans doing almost all the work, joined
        by either a display face for headings or a mono for code and labels.
      </P>

      <DataTable
        caption={`The ten most frequently used typeface families. A family is counted once per site even when it appears in several roles, so the count is sites rather than declarations.`}
        columns={[
          { key: "name", head: "Typeface" },
          { key: "count", head: "Sites", align: "right" },
          { key: "share", head: "Share of archive", align: "right" },
        ]}
        rows={type.topFaces.map((face) => ({
          key: face.name,
          name: face.name,
          count: face.count,
          share: `${face.share}%`,
        }))}
      />

      <Q id="use">How should you use these numbers?</Q>
      <P>
        As a positioning check, not a specification. Find your industry in the
        table, then decide whether you want to sit at its median or deliberately
        break from it. A SaaS site at {agency?.medianLargestType ?? 0}px is
        making a claim about being design-led, and it had better be true,
        because the rest of the page will be read against that promise. A
        directory at the same size is just harder to scan.
      </P>
      <P>
        The other honest caveat: these are desktop measurements of the largest
        heading, not a full type scale. A {agency?.medianLargestType ?? 0}px
        hero says nothing about whether the body text is comfortable, and body
        text is what people actually read. You can see the full recorded scale,
        weights and sizes included, on any record in{" "}
        <Link
          href="/archive"
          className="underline decoration-orange decoration-2 underline-offset-2"
        >
          the archive
        </Link>
        .
      </P>

      <Method>
        <p>
          Type sizes are read from the rendered page at desktop width and stored
          per typeface with the weights and sizes observed. The largest recorded
          size on a site is taken as its headline size.
        </p>
        <p>
          Sites where no type size could be captured are excluded from the
          medians rather than counted as zero, which is why the sample is{" "}
          {type.sample} rather than the full {archive.records}. Categories with
          fewer than ten records are left out of the industry table entirely.
        </p>
        <p>
          Medians are used rather than averages throughout. A single site with a
          200px display hero would drag an average several pixels; it moves a
          median by one position.
        </p>
      </Method>

      <Related
        links={[
          { href: "/archive", label: "Browse all studied websites" },
          { href: "/blogs/framer-vs-webflow-vs-nextjs-vs-astro", label: "What the stack predicts about design" },
          { href: "/blogs/how-many-accent-colours-websites-use", label: "How many accent colours sites use" },
          { href: "/c/agency-and-studio", label: "Agency and studio websites" },
          { href: "/c/technology-and-saas", label: "Technology and SaaS websites" },
          { href: "/c/portfolio", label: "Portfolio websites" },
        ]}
      />
    </>
  );
}

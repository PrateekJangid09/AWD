import Link from "next/link";
import {
  DataTable,
  Figure,
  Method,
  P,
  Q,
  Related,
} from "@/components/journal/ArticleParts";
import { archiveStats, colourStats, platformStats } from "@/lib/insights";

export default function AccentColours() {
  const colour = colourStats();
  const archive = archiveStats();
  const { platforms } = platformStats();

  return (
    <>
      <P>
        The advice to use one accent colour is everywhere, and it is always
        asserted rather than shown. So we counted. Across {colour.sample}{" "}
        website palettes recorded from the rendered page, we measured how many
        swatches are genuinely saturated rather than a neutral wearing a tint.
      </P>
      <P>
        The advice holds up better than most design rules do.
      </P>

      <Figure
        value={`${colour.restrainedShare}%`}
        label="of studied websites use one saturated colour or none at all"
        note={`n=${colour.sample} palettes. ${colour.noneShare}% use no saturated colour, ${colour.oneShare}% use exactly one.`}
      />

      <Q id="count">How many accent colours do websites actually use?</Q>
      <P>
        One or none, overwhelmingly. {colour.none} of {colour.sample} sites,{" "}
        {colour.noneShare}% of the archive, carry no saturated swatch at all:
        their entire recorded palette is neutral. Another {colour.one} sites,{" "}
        {colour.oneShare}%, carry exactly one. Together that is{" "}
        {colour.restrainedShare}% of everything studied. Only{" "}
        {colour.manyShare}% reach three or more.
      </P>

      <DataTable
        caption={`Distribution of saturated swatches per palette across ${colour.sample} records. A swatch counts as saturated when the gap between its highest and lowest RGB channel is at least ${colour.accentChromaThreshold}.`}
        columns={[
          { key: "accents", head: "Saturated colours" },
          { key: "count", head: "Sites", align: "right" },
          { key: "share", head: "Share", align: "right" },
        ]}
        rows={colour.distribution.map((row) => ({
          key: row.label,
          accents: row.label,
          count: row.count,
          share: `${row.share}%`,
        }))}
      />

      <Q id="palette-size">
        If most sites use one accent, why is the median palette six colours?
      </Q>
      <P>
        Because most of a palette is not decoration, it is structure. The median
        palette here holds {colour.medianPalette} colours, and in a typical
        record those roles are a page background, a raised surface, a border, a
        primary text colour, a muted text colour, and then the accent. Five of
        the six are doing quiet structural work. Only one is trying to be
        noticed.
      </P>
      <P>
        This is why counting colours is a bad proxy for restraint. A six-colour
        palette with one accent reads as disciplined. A four-colour palette with
        three accents reads as chaos. The number that matters is how many
        elements are competing to be the brightest thing on screen.
      </P>

      <Q id="zero">Can a website work with no accent colour at all?</Q>
      <P>
        {colour.noneShare}% of this archive says yes. Fully neutral palettes
        push the emphasis work onto other tools: weight, scale, whitespace and
        the sharpness of a border. That is harder to do well, and it is why
        fully neutral sites cluster in editorial, portfolio and brutalist work
        where the layout is already carrying the personality.
      </P>
      <P>
        The trade is real, though. Without an accent, a call to action has
        nothing to distinguish it from a heading except position and size. If
        you go neutral, the interface has to be unambiguous in its structure,
        because colour is not going to rescue it.
      </P>

      <Q id="many">When do three or more bright colours make sense?</Q>
      <P>
        When the colour is the brand rather than a highlight on it. The{" "}
        {colour.manyShare}% of sites carrying three or more saturated swatches
        concentrate in playful and maximalist work: creator tools, community
        products and design software where a spectrum signals range. In those
        cases the palette is the positioning, and reducing it to one accent
        would make the product look like everything else.
      </P>
      <P>
        Outside that, more than one accent usually means the page has stopped
        telling you which action matters. If two things are the brightest thing
        on screen, neither is.
      </P>

      <Q id="stack">Does the technology a site uses change its palette?</Q>
      <P>
        No. Every platform we measured lands on the same median palette size of{" "}
        {platforms[0]?.medianPalette ?? colour.medianPalette} colours, whether
        the site is built in Framer, Webflow, Next.js or Astro. Build tools
        reshape motion and typographic scale, as we found when comparing{" "}
        <Link
          href="/blogs/framer-vs-webflow-vs-nextjs-vs-astro"
          className="underline decoration-orange decoration-2 underline-offset-2"
        >
          what the stack predicts about a site
        </Link>
        , but colour discipline survives the choice of technology intact. It is
        set by the brand, upstream of any of this.
      </P>

      <Method>
        <p>
          Palettes are extracted from the rendered page and stored with a role
          and a coverage share per swatch. A swatch counts as saturated when its
          chroma, measured as the gap between its highest and lowest RGB
          channel, is at least {colour.accentChromaThreshold}. That threshold
          separates a real brand colour from a warm grey or a tinted off-white.
        </p>
        <p>
          The same threshold is applied to all {colour.sample} palettes, so
          comparisons between sites are consistent even though the absolute
          cutoff is a judgement call. Records with no recorded palette are
          excluded rather than counted as neutral.
        </p>
        <p>
          Counts describe this catalogue of {archive.records} studied websites,
          not the web as a whole. The archive is curated toward design-led work,
          which almost certainly makes it more restrained than a random sample
          would be.
        </p>
      </Method>

      <Related
        links={[
          { href: "/tools/webpalette", label: "Build a role-based palette" },
          { href: "/tools/chromary", label: "Find and name a colour" },
          { href: "/archive", label: "Browse all studied websites" },
          { href: "/blogs/framer-vs-webflow-vs-nextjs-vs-astro", label: "What the stack predicts about design" },
          { href: "/blogs/website-heading-sizes-by-industry", label: "Heading sizes by industry" },
          { href: "/research/website-design-index-2026", label: "The 2026 Design Index" },
        ]}
      />
    </>
  );
}

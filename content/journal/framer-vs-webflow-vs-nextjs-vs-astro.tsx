import Link from "next/link";
import {
  DataTable,
  Figure,
  Method,
  P,
  Q,
  Related,
} from "@/components/journal/ArticleParts";
import { archiveStats, platformStats } from "@/lib/insights";

export default function StackAndStyle() {
  const { platforms, attributed, unattributed } = platformStats();
  const archive = archiveStats();

  const framer = platforms.find((p) => p.name === "Framer");
  const next = platforms.find((p) => p.name === "Next.js");
  const webflow = platforms.find((p) => p.name === "Webflow");
  const astro = platforms.find((p) => p.name === "Astro");

  return (
    <>
      <P>
        A build tool is supposed to be an implementation detail. In practice it
        is a set of defaults, and defaults are design decisions that nobody
        revisits. So we took every record in the archive where a platform could
        be identified from public signals, {attributed} sites in all, and asked
        a narrow question: does the tool a site is built with predict what it
        looks like?
      </P>
      <P>
        It does, and not subtly.
      </P>

      <Q id="motion">Which platform produces the most animated websites?</Q>
      <P>
        Framer, by a distance that is hard to read as anything other than the
        tool shaping the work.{" "}
        {framer?.motionShare ?? 0}% of the {framer?.count ?? 0} Framer sites in
        the archive carry a motion-driven style tag. On Next.js the same tag
        appears on {next?.motionShare ?? 0}% of {next?.count ?? 0} sites.
      </P>

      <Figure
        value={`${framer?.motionShare ?? 0}% vs ${next?.motionShare ?? 0}%`}
        label="Share of sites tagged motion-driven, Framer against Next.js"
        note={`Framer n=${framer?.count ?? 0}. Next.js n=${next?.count ?? 0}. Style tags are assigned during record review.`}
      />

      <P>
        The mechanism is not mysterious. Framer ships a timeline and scroll
        effects in the editor, so animation is the cheapest thing a designer can
        add. In a React codebase, motion is a library, a bundle cost and a
        performance conversation, so it gets added when someone argues for it.
        Webflow sits between the two at {webflow?.motionShare ?? 0}%, which
        matches its position as a visual editor with an interactions panel that
        you have to go and open.
      </P>

      <Q id="type">Do some platforms encourage bigger headlines?</Q>
      <P>
        Yes. Webflow sites run the largest type in the set, with a median
        largest heading of {webflow?.medianLargestType ?? 0}px across{" "}
        {webflow?.typeSample ?? 0} sites. Next.js sites run the smallest at{" "}
        {next?.medianLargestType ?? 0}px. That is a{" "}
        {(webflow?.medianLargestType ?? 0) - (next?.medianLargestType ?? 0)}px
        gap between the loudest and quietest platform, on a measure where the
        whole archive only spans about thirty pixels of median.
      </P>

      <DataTable
        caption={`Every archive record where a platform could be identified. Medians, not averages, so one outlier hero cannot move the row. ${unattributed} of ${archive.records} records carry no usable platform signal and are excluded.`}
        columns={[
          { key: "name", head: "Platform" },
          { key: "count", head: "Sites", align: "right" },
          { key: "motion", head: "Motion-driven", align: "right" },
          { key: "type", head: "Median largest type", align: "right" },
          { key: "palette", head: "Median palette", align: "right" },
          { key: "style", head: "Most common style" },
        ]}
        rows={platforms.map((p) => ({
          key: p.name,
          name: p.name,
          count: p.count,
          motion: `${p.motionShare}%`,
          type: `${p.medianLargestType}px`,
          palette: p.medianPalette,
          style: p.topStyle
            ? `${p.topStyle.tag} (${p.topStyle.share}%)`
            : "None recorded",
        }))}
      />

      <Q id="palette">Does the stack change how many colours a site uses?</Q>
      <P>
        No, and that is the most interesting null result here. Every platform
        lands on the same median palette size of{" "}
        {platforms[0]?.medianPalette ?? 0} colours. Whatever a build tool does
        to motion and type, it leaves colour alone. Palette discipline appears
        to be a brand decision that survives the choice of technology, which is
        also what we found when we looked at{" "}
        <Link
          href="/blogs/how-many-accent-colours-websites-use"
          className="underline decoration-orange decoration-2 underline-offset-2"
        >
          how many accent colours websites actually use
        </Link>
        .
      </P>

      <Q id="astro">What kind of site gets built with Astro?</Q>
      <P>
        Content-first ones. Astro is the smallest bucket at {astro?.count ?? 0}{" "}
        sites, so this is a signal rather than a finding, but{" "}
        {astro?.topStyle?.share ?? 0}% of them carry a{" "}
        {astro?.topStyle?.tag.toLowerCase() ?? "minimal"} tag, the highest
        concentration of any platform here, and only {astro?.motionShare ?? 0}%
        are motion-driven. Astro exists to ship less JavaScript, and the sites
        that choose it appear to want the aesthetic that comes with that
        constraint.
      </P>

      <Q id="choose">Which platform should you choose?</Q>
      <P>
        The honest answer is that these numbers describe what teams already
        chose, not what works. A studio that wants motion picks Framer, so
        Framer sites move. That is selection, not causation, and no crawl can
        separate the two.
      </P>
      <P>
        What the data does support is narrower and still useful. If you want
        heavy motion without a front-end team, Framer is where that is normal
        rather than exceptional. If you want typographic scale and editable
        content structure, Webflow is where the largest headlines live. If your
        site is really an application with a marketing surface attached, Next.js
        is where {next?.topCategory?.name ?? "product"} sites cluster. And if
        the page is mostly words, Astro carries the least ceremony.
      </P>

      <Method>
        <p>
          Each site is attributed to exactly one platform. Managed hosting is
          checked first, because a site served from Webflow or Framer hosting is
          definitively built there. Framework markers are checked second, so a
          self-hosted Next.js or Astro site is caught even without a managed
          host.
        </p>
        <p>
          Sites with no platform signal are excluded rather than guessed at.
          That leaves {attributed} of {archive.records} records in this
          analysis. Medians are used throughout, and every row shows its sample
          size so you can judge how much weight it carries. Astro at{" "}
          {astro?.count ?? 0} sites deserves less weight than Next.js at{" "}
          {next?.count ?? 0}.
        </p>
        <p>
          Style tags are assigned during record review, not by the platform
          vendor. They describe the rendered page, which is why a motion-driven
          tag means an animation was observed rather than a library was
          detected.
        </p>
      </Method>

      <Related
        links={[
          { href: "/archive", label: "Browse all studied websites" },
          { href: "/blogs/website-heading-sizes-by-industry", label: "Heading sizes by industry" },
          { href: "/blogs/how-many-accent-colours-websites-use", label: "How many accent colours sites use" },
          { href: "/c/technology-and-saas", label: "Technology and SaaS websites" },
          { href: "/c/agency-and-studio", label: "Agency and studio websites" },
          { href: "/research/website-design-index-2026", label: "The 2026 Design Index" },
        ]}
      />
    </>
  );
}

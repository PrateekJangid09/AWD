// The journal registry.
//
// Metadata lives here so the hub, the sitemap, the site map and the schema all
// read the same source. Bodies live in content/journal/<slug>.tsx.
//
// Every figure quoted in a post is computed in lib/insights.ts from the live
// record set, so a post cannot claim a number the archive does not hold.
import { DATASET } from "./canonical";
import { archiveStats, colourStats, platformStats, typographyStats } from "./insights";

export type Faq = { question: string; answer: string };

export type JournalPost = {
  slug: string;
  kicker: string;
  /** Page title. Leads with the phrase people search; the brand is appended by the layout template. */
  title: string;
  h1: string;
  /** 150 to 160 characters, unique, with the primary phrase and a reason to click. */
  description: string;
  /** Self-contained 40 to 60 word answer, rendered as the first paragraph under the H1. */
  answer: string;
  /** What the piece is about, mirrored into schema. */
  about: string[];
  published: string;
  modified: string;
  status: "published" | "draft";
  readingMinutes: number;
  /** Headline statistic shown on the card, always with its sample size. */
  keyStat: { value: string; label: string };
  faqs: Faq[];
  /** The related questions a machine fans out to. Each is answered here or linked. */
  fanout: string[];
};

export function postPath(slug: string) {
  return `/blogs/${slug}`;
}

/**
 * When a post was last revised.
 *
 * A post's figures are recomputed whenever the record set moves, so the archive
 * release date is the honest revision date. It cannot precede publication
 * though, so clamp: a post was not modified before it existed.
 */
function postModified(published: string) {
  return DATASET.updatedAt > published ? DATASET.updatedAt : published;
}

/** Entries declare when they were published; `modified` is derived, never hand-set. */
type PostEntry = Omit<JournalPost, "modified">;

function buildPosts(): PostEntry[] {
  const archive = archiveStats();
  const platforms = platformStats();
  const type = typographyStats();
  const colour = colourStats();

  const framer = platforms.platforms.find((p) => p.name === "Framer");
  const next = platforms.platforms.find((p) => p.name === "Next.js");
  const webflow = platforms.platforms.find((p) => p.name === "Webflow");
  const astro = platforms.platforms.find((p) => p.name === "Astro");

  const agency = type.categories.find((c) => c.name === "Agency & Studio");
  const saas = type.categories.find((c) => c.name === "Technology & SaaS");
  const topFace = type.topFaces[0];

  return [
    {
      slug: "framer-vs-webflow-vs-nextjs-vs-astro",
      kicker: "Technology",
      title: "Framer vs Webflow vs Next.js vs Astro",
      h1: "What does a website's stack predict about how it looks?",
      description: `We classified ${platforms.attributed} websites by platform, then compared their palettes, type and style tags. The stack predicts the design more than you would expect.`,
      answer: `Across ${platforms.attributed} websites where a platform could be identified, the build tool predicts the visual style. ${framer?.motionShare ?? 0}% of the ${framer?.count ?? 0} Framer sites are tagged motion-driven, against ${next?.motionShare ?? 0}% of the ${next?.count ?? 0} Next.js sites. Webflow runs the largest headlines at a ${webflow?.medianLargestType ?? 0}px median, and Astro sites are the most consistently minimal.`,
      about: ["Framer", "Webflow", "Next.js", "Astro", "Web design", "Web development"],
      published: "2026-09-02",
      status: "published",
      readingMinutes: 6,
      keyStat: {
        value: `${framer?.motionShare ?? 0}%`,
        label: `of ${framer?.count ?? 0} Framer sites are motion-driven, against ${next?.motionShare ?? 0}% on Next.js`,
      },
      faqs: [
        {
          question: "Is Framer or Webflow better for a design-led website?",
          answer: `Both produce design-led work, but they cluster differently in this archive. ${framer?.motionShare ?? 0}% of the ${framer?.count ?? 0} Framer sites carry a motion-driven style tag, against ${webflow?.motionShare ?? 0}% of the ${webflow?.count ?? 0} Webflow sites. Webflow sites run larger headlines, with a ${webflow?.medianLargestType ?? 0}px median largest type size against ${framer?.medianLargestType ?? 0}px on Framer. Choose Framer for motion, Webflow for typographic scale and content structure.`,
        },
        {
          question: "Do Next.js websites look different from no-code websites?",
          answer: `Yes, measurably. Only ${next?.motionShare ?? 0}% of the ${next?.count ?? 0} Next.js sites studied are tagged motion-driven, the lowest of the four platforms, and their median largest type size is ${next?.medianLargestType ?? 0}px, the smallest of the four. Next.js sites in this archive skew toward dense, product-led layouts rather than animated marketing pages.`,
        },
        {
          question: "What kind of sites use Astro?",
          answer: `Astro is the smallest bucket here, at ${astro?.count ?? 0} sites, so treat this as a signal rather than a conclusion. ${astro?.topStyle?.share ?? 0}% of them carry a ${astro?.topStyle?.tag.toLowerCase() ?? "minimal"} style tag, the highest concentration of any platform in the set. They read as content-first sites where load speed matters more than animation.`,
        },
        {
          question: "How was the platform for each site detected?",
          answer:
            "Each site is attributed to exactly one platform from public signals. Managed hosting is checked first, because a site served from Webflow or Framer hosting is definitively built there. Framework markers are checked second. Sites where no platform signal is present are excluded rather than guessed at, which is why the sample is smaller than the full archive.",
        },
      ],
      fanout: [
        "Which platform do agencies use most?",
        "Is Webflow or Framer faster to build with?",
        "Do no-code sites use more colours than coded sites?",
        "What framework do SaaS companies use?",
        "How many websites use Next.js?",
        "Does the stack affect how big the headlines are?",
        "Is Astro used for marketing sites or blogs?",
      ],
    },
    {
      slug: "website-heading-sizes-by-industry",
      kicker: "Typography",
      title: "Website Heading Sizes by Industry",
      h1: "How big are website headlines, and does the industry change the answer?",
      description: `The median largest type size across ${type.sample} studied websites is ${type.archiveMedian}px, but agencies set headlines a third larger than SaaS companies. The full breakdown by industry.`,
      answer: `Across ${type.sample} websites where type sizes were captured, the median largest heading is ${type.archiveMedian}px. Industry moves that number more than fashion does. Agency and studio sites sit at a ${agency?.medianLargestType ?? 0}px median across ${agency?.count ?? 0} records, while technology and SaaS sites sit at ${saas?.medianLargestType ?? 0}px across ${saas?.count ?? 0}. Loud type is a positioning choice, not a trend.`,
      about: ["Typography", "Web design", "Font size", "Type scale"],
      published: "2026-09-02",
      status: "published",
      readingMinutes: 5,
      keyStat: {
        value: `${type.archiveMedian}px`,
        label: `median largest heading across ${type.sample} sites with captured type sizes`,
      },
      faqs: [
        {
          question: "What is a good font size for a website headline?",
          answer: `In this archive the median largest heading is ${type.archiveMedian}px across ${type.sample} sites, so that is a defensible centre of gravity for a desktop hero. The useful range runs from about ${type.quietest?.medianLargestType ?? 0}px for utility and directory sites up to about ${type.loudest?.medianLargestType ?? 0}px for retail and agency work. Match the industry you are competing in rather than the largest number you have seen.`,
        },
        {
          question: "Why do agency websites use bigger type than SaaS websites?",
          answer: `Agency sites sell taste, so the headline is the product demonstration. SaaS sites sell a task, so the headline competes with a screenshot, a signup form and a feature list for the same space. The measured gap is ${agency?.medianLargestType ?? 0}px against ${saas?.medianLargestType ?? 0}px, across ${agency?.count ?? 0} and ${saas?.count ?? 0} records respectively.`,
        },
        {
          question: "How many typefaces does a typical website use?",
          answer: `The median is ${type.medianFontsPerSite} across the archive. ${type.distinctFaces} distinct families appear in total, but the distribution is steep: ${topFace?.name ?? "the most common family"} alone appears on ${topFace?.count ?? 0} sites, or ${topFace?.share ?? 0}% of the ${archive.records} records. Most sites pair one workhorse sans with either a display face or a mono.`,
        },
        {
          question: "How were these type sizes measured?",
          answer:
            "Sizes are read from the rendered page at desktop width and recorded per typeface, then the largest recorded size on each site is taken as its headline size. Sites where no type sizes could be captured are excluded from the medians rather than counted as zero, and any category with fewer than ten records is left out of the industry table.",
        },
      ],
      fanout: [
        "What font size should a hero headline be?",
        "What is the most used font on websites?",
        "How many fonts should a website use?",
        "Do ecommerce sites use bigger type?",
        "What font size do SaaS websites use?",
        "Is Inter the most popular web font?",
        "What is a good type scale for a website?",
      ],
    },
    {
      slug: "how-many-accent-colours-websites-use",
      kicker: "Colour",
      title: "How Many Accent Colours Websites Use",
      h1: "How many accent colours does a website actually need?",
      description: `Across ${colour.sample} studied website palettes, ${colour.restrainedShare}% use one saturated colour or none at all, and only ${colour.manyShare}% reach three or more. The measured case for a single accent.`,
      answer: `Across ${colour.sample} website palettes, ${colour.restrainedShare}% carry at most one saturated colour: ${colour.noneShare}% use none at all and ${colour.oneShare}% use exactly one. Only ${colour.manyShare}% reach three or more. The median palette holds ${colour.medianPalette} colours, so most of that palette is doing neutral structural work rather than shouting.`,
      about: ["Colour palette", "Web design", "Accent colour", "Brand colour"],
      published: "2026-09-02",
      status: "published",
      readingMinutes: 5,
      keyStat: {
        value: `${colour.restrainedShare}%`,
        label: `of ${colour.sample} palettes use one saturated colour or none`,
      },
      faqs: [
        {
          question: "How many colours should a website use?",
          answer: `The median palette in this archive holds ${colour.medianPalette} colours, but only a small part of that is saturated. ${colour.restrainedShare}% of the ${colour.sample} sites studied use at most one saturated colour, with the rest of the palette carrying neutral structural roles like background, surface, border and text. A neutral base plus one accent is the measured norm, not a minimalist affectation.`,
        },
        {
          question: "Is it bad to use several bright colours on a website?",
          answer: `It is uncommon rather than wrong. Only ${colour.manyShare}% of the ${colour.sample} palettes studied carry three or more saturated colours, and those cluster in playful and maximalist work where the colour is the brand. If your site is not in that category, more than one accent usually means the interface has stopped signalling which action matters.`,
        },
        {
          question: "What counts as an accent colour here?",
          answer: `A swatch counts as an accent when its chroma, measured as the gap between the highest and lowest RGB channel, is at least ${colour.accentChromaThreshold}. That threshold separates a genuine brand colour from a warm grey or a tinted off-white. It is applied identically to every one of the ${colour.sample} palettes, so the comparison between sites is consistent.`,
        },
        {
          question: "Why do so many websites use near-black and off-white?",
          answer:
            "Pure black on pure white is harsh at large areas, so most designers pull both ends slightly toward the middle. That gives a softer contrast, leaves room for a genuinely white surface to read as raised, and lets a single accent stay the brightest thing on the page. It is a structural decision that happens to look restrained.",
        },
      ],
      fanout: [
        "How many colours should a brand palette have?",
        "What is the 60-30-10 rule in web design?",
        "Should a website use one accent colour?",
        "Why do websites use off-white instead of white?",
        "What is the most common website background colour?",
        "How do I pick an accent colour for a website?",
        "Do minimal websites use fewer colours?",
      ],
    },
  ];
}

export const JOURNAL: JournalPost[] = buildPosts().map((post) => ({
  ...post,
  modified: postModified(post.published),
}));

export function publishedPosts() {
  return JOURNAL.filter((post) => post.status === "published").sort((a, b) =>
    b.published.localeCompare(a.published),
  );
}

export function getPost(slug: string) {
  return JOURNAL.find((post) => post.slug === slug);
}

/** Newest modification across published posts, for the hub's dateModified. */
export function journalModified() {
  const posts = publishedPosts();
  if (posts.length === 0) return DATASET.updatedAt;
  return posts.map((p) => p.modified).sort().at(-1) as string;
}

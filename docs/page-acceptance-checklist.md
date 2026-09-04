# Page acceptance checklist

Every page ships against this contract. It exists because the first SEO and AEO
audit was fixed by hand on a few flagship pages, and the 304 page archive
template silently missed the same fixes. A checklist that only lives in a
document repeats that failure, so the machine checkable parts are enforced by
`npm run seo:check`.

## Definition of done

Every item must be true before a page is published.

| Area | Requirement | Enforced by |
| --- | --- | --- |
| Robots | `index, follow` for real content, `noindex, follow` for genuine placeholders. Never `nofollow` on our own pages. | `seo:check` |
| Canonical | Self referencing, bare domain, derived from `metadataBase`. Never a `www` URL. | `seo:check` |
| Title | Leads with a phrase a real person would search, brand last. Visible portion short enough that the rendered title stays under about 70 characters. | `seo:check` (warning) |
| Description | Unique, 150 to 165 characters, includes the primary phrase and a reason to click. | `seo:check` (warning) |
| Headings | Exactly one H1 in plain words. H2s phrased as the questions people actually ask. | `seo:check` (H1 count) |
| Answer block | A self contained 40 to 60 word answer directly under the H1, quotable with no surrounding context. | Review |
| Data | At least one original statistic with its sample size. Every borrowed claim links its source. | Review |
| Freshness | A visible last updated date, mirrored in `datePublished` and `dateModified`. Only bump it when the content actually changes. | `seo:check` (ordering) |
| Author and org | An editorial line linking `/editorial-guidelines`, plus sitewide `Organization` schema. | `seo:check` (Organization) |
| Schema | The right type (`Article`, `BlogPosting`, `Dataset`, `FAQPage`, `CollectionPage`, `ItemPage`) describing only what is visible. | `seo:check` (parses, FAQ visibility) |
| Schema graph | Each `@id` declared once per page, and every `@id` a page references resolves in that page or is one of the sitewide nodes. | `seo:check` |
| Internal links | At least three descriptive links to related archive, category or guide pages. | `seo:check` |
| Images | Real alt text, WebP, sized for the layout. | `seo:check` (alt present) |
| Cluster | The five to ten fan out questions listed, each answered on the page or linked. | Review |
| Open Graph | `og:title`, `og:description`, `og:url`, `og:image` and `twitter:card` complete, image matches the content. | `seo:check` |

## Running the gate

```bash
npm run build
npm start &                       # or: npm start -- -p 4360
npm run seo:check                 # sampled, one page per route shape
npm run seo:check -- --all        # every URL in sitemap.xml
npm run seo:check -- --base http://localhost:4360
```

It also asserts, site wide, that every URL in `sitemap.xml` resolves with a 200
rather than a redirect, and that the sitemap lists only HTML pages. A text file
such as `llms.txt` is served and linked by convention, not advertised as an
indexable page, so it must not appear there.

The script exits non zero on any failure, so it can gate a deploy. It also
checks that `robots.txt` names and permits `GPTBot`, `ClaudeBot`,
`PerplexityBot` and `Google-Extended`, that it references `sitemap.xml`, and
that `llms.txt` resolves.

## Where the numbers come from

Never type a statistic into prose. `lib/insights.ts` computes every figure the
journal quotes from the canonical record set at build time, and each helper
returns its sample size alongside the value. A post interpolates those values,
so a claim cannot drift away from the archive that supports it, and a record
added tomorrow updates the article automatically.

If a number cannot be computed from `content/sites/*.json`, it does not belong
in a post.

## Honest dates

`recordDates()` returns an `exact` flag. It is true only when a record carries
its own `extraction.extracted_at`. When it is false the dates come from the
archive release the record shipped in, and the page says "Archive revision"
rather than "Last checked". Do not present a release date as a per record
verification.

## Standing instruction for page generation

Paste this into any blog, guide or study generation skill.

```
When you generate any blog, guide or study page for allwebsites.design,
satisfy this contract before returning:

STRUCTURE
- Emit metadata via the shared pageMeta() helper in lib/seo.ts.
- robots: index+follow for real content, noindex+follow for stubs.
- canonical: self referencing, bare domain, from metadataBase.

ON PAGE
- Title leads with a real search phrase, brand last.
- Unique 150 to 165 character description with the primary phrase.
- Exactly one H1 in plain words. H2s phrased as real questions.

ANSWER ENGINE
- First paragraph is a 40 to 60 word answer that stands alone.
- Include at least one original statistic with its sample size, computed
  in lib/insights.ts rather than written into the prose.
- Add a 3 to 5 item FAQ with FAQPage schema, and render every question
  and answer visibly on the page.
- Add the correct schema describing only what is visible.

TRUST AND FRESHNESS
- Visible "Last updated" date mirrored in dateModified.
- Editorial line linked to /editorial-guidelines.
- State how each number was measured, on the page.

LINKS AND MEDIA
- At least three descriptive internal links.
- Real, descriptive alt text on every image.

FINALLY
- List the 5 to 10 fan out questions and confirm each is answered or
  linked. Run npm run seo:check and fix every failure before returning.
  Do not use the em dash character.
```

## After shipping: reindex checklist

Search engines will not see an improvement until they recrawl, and that is on
our timeline to nudge. Work through this after any change worth ranking.

1. Confirm `https://allwebsites.design/sitemap.xml` returns 200 and that
   `lastModified` on changed URLs reflects the change. The sitemap is dated from
   the record set and from each post, not from the build, so an unrelated deploy
   does not tell crawlers every URL is new.
2. In Google Search Console, open **Sitemaps** and resubmit `sitemap.xml`.
3. Open **URL Inspection** and request indexing for the priority URLs, in this
   order:
   - `https://allwebsites.design/`
   - `https://allwebsites.design/archive`
   - `https://allwebsites.design/blogs`
   - each published post under `/blogs/`
   - `https://allwebsites.design/research/website-design-index-2026`
   - the three or four largest category pages under `/c/`
4. Run **Test Live URL** on one archive record and one journal post. Confirm the
   page renders, the breadcrumb is detected, and no third party resource errors
   appear. Third party scripts are consent gated and skipped for crawlers, so a
   live test should not fetch analytics or ad resources at all.
5. Paste one journal post URL into Google's Rich Results Test and confirm
   `BlogPosting` and `FAQPage` are both detected, and that any `numberOfItems`
   matches the count visible on the page.
6. Repeat step 5 for `https://allwebsites.design/archive` and confirm
   `numberOfItems` reads the live record count.

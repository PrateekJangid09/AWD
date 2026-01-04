import Header from "@/components/Header"
import Hero from "@/components/Hero"
import FeaturedWebsites from "@/components/FeaturedWebsites"
import BrowseTemplates from "@/components/BrowseTemplates"
import DetailsSection from "@/components/DetailsSection"
import FAQSection from "@/components/FAQSection"
import Footer from "@/components/Footer"

export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <Header
        brandName="AllWebsiteTemplates"
        navItems={[
          { label: "Templates", href: "/templates" },
          { label: "Categories", href: "/categories" },
          { label: "Freebies", href: "/freebies" },
          { label: "Pricing", href: "/pricing" },
          { label: "Blog", href: "/blog" },
        ]}
        primaryCtaLabel="Get Started"
        primaryCtaHref="/get-started"
        secondaryCtaLabel="Browse"
        secondaryCtaHref="/browse"
      />
      <Hero
        badgeText="Curated website templates"
        title="Discover beautiful website templates for your next project."
        highlightText="website templates"
        subtitle="Browse free and paid templates by category, color, popularity, and newest releases. Built for founders and designers shipping weekly."
        searchLabel="Search templates and resources"
        searchPlaceholder="Search: dashboards, landing pages, UI kits, icons..."
        searchLinkBase="/templates"
        showSearchHint={true}
        searchHintText='Tip: try "purple dashboard", "pricing page", or "UI kit".'
        chips={[
          { label: "Free", preset: "free", defaultActive: true },
          { label: "Paid", preset: "paid", defaultActive: false },
          { label: "Popular", preset: "popular", defaultActive: false },
          { label: "New", preset: "new", defaultActive: true },
          {
            label: "Purple",
            preset: "color",
            colorValue: "#A855F7",
            defaultActive: true,
          },
          { label: "Figma", preset: "tool", defaultActive: true },
          { label: "Framer", preset: "tool", defaultActive: false },
        ]}
        primaryCtaLabel="Browse Templates"
        primaryCtaHref="/templates"
        showSecondaryCta={true}
        secondaryCtaLabel="Get Free Pack"
        secondaryCtaHref="/freebies"
        showStats={true}
        stat1="200+ curated templates"
        stat2="Weekly drops"
        stat3="Commercial-ready licenses"
        showPreviews={true}
        cards={[
          {
            title: "Neo Noir SaaS Dashboard",
            subtitle: "Figma + Framer. Dark mode + purple glow.",
            badge: "Popular",
            price: "$29",
            imageUrl:
              "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=70",
          },
          {
            title: "Landing Page Kit",
            subtitle: "High-converting sections. Fully responsive.",
            badge: "New",
            price: "Free",
            imageUrl:
              "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1600&q=70",
          },
          {
            title: "Component Library",
            subtitle: "Buttons, nav, pricing, FAQ. Ready to paste.",
            badge: "Staff Pick",
            price: "$49",
            imageUrl:
              "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=70",
          },
        ]}
      />
      <FeaturedWebsites
        title="Featured collections"
        subtitle="Popular picks, latest drops, and free resources. Filter by what you need and start building."
        showViewAll={true}
        viewAllLabel="View all templates"
        viewAllHref="/templates"
        defaultTab="popular"
        tabs={[
          { label: "Popular", key: "popular", icon: "🔥" },
          { label: "New", key: "new", icon: "🆕" },
          { label: "Free", key: "free", icon: "🆓" },
          { label: "Staff Picks", key: "staff", icon: "⭐" },
          { label: "Purple", key: "purple", icon: "🎨" },
        ]}
        cards={[
          {
            title: "Neo Noir Dashboard",
            subtitle: "Figma + Framer. Dark mode ready.",
            imageUrl:
              "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=70",
            href: "/templates/neo-noir-dashboard",
            toolTag: "Figma + Framer",
            colorTag: "Purple Neon",
            price: "$29",
            badge: "Popular",
            isFree: false,
            isNew: false,
            isPopular: true,
            isStaffPick: true,
            isPurple: true,
          },
          {
            title: "Landing Page Kit",
            subtitle: "Conversion-first sections. Responsive.",
            imageUrl:
              "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1600&q=70",
            href: "/templates/landing-kit",
            toolTag: "Framer",
            colorTag: "White + Neon",
            price: "Free",
            badge: "New",
            isFree: true,
            isNew: true,
            isPopular: true,
            isStaffPick: false,
            isPurple: true,
          },
          {
            title: "UI Component Library",
            subtitle: "Buttons, nav, pricing, FAQ, cards.",
            imageUrl:
              "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=70",
            href: "/templates/component-library",
            toolTag: "Figma",
            colorTag: "Purple",
            price: "$49",
            badge: "Staff Pick",
            isFree: false,
            isNew: true,
            isPopular: false,
            isStaffPick: true,
            isPurple: true,
          },
          {
            title: "Mobile App UI Kit",
            subtitle: "Modern screens + components.",
            imageUrl:
              "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1600&q=70",
            href: "/templates/mobile-ui-kit",
            toolTag: "Figma",
            colorTag: "Clean",
            price: "$19",
            badge: "Popular",
            isFree: false,
            isNew: false,
            isPopular: true,
            isStaffPick: false,
            isPurple: false,
          },
          {
            title: "Pricing Page Pack",
            subtitle: "High-converting pricing sections.",
            imageUrl:
              "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1600&q=70",
            href: "/templates/pricing-pack",
            toolTag: "Framer",
            colorTag: "Purple Neon",
            price: "$15",
            badge: "New",
            isFree: false,
            isNew: true,
            isPopular: false,
            isStaffPick: false,
            isPurple: true,
          },
          {
            title: "Free Icon Set",
            subtitle: "Crisp icons for SaaS + apps.",
            imageUrl:
              "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=70",
            href: "/freebies/icons",
            toolTag: "Figma",
            colorTag: "Monochrome",
            price: "Free",
            badge: "Free",
            isFree: true,
            isNew: false,
            isPopular: true,
            isStaffPick: true,
            isPurple: false,
          },
        ]}
      />
      <BrowseTemplates
        title="Browse templates"
        subtitle="Filter by category, color, tool, and pricing. Find your next purple-neon UI in seconds."
        showHeader={true}
        showSearch={true}
        showSort={true}
        showToolToggle={true}
        showPriceToggle={true}
        showColorFilter={true}
        showCategoryFilter={true}
        showClearButton={true}
        maxResults={12}
        defaultSort="popular"
        defaultTool="All"
        defaultPrice="All"
        defaultCategory="all"
        defaultColor="all"
        categories={[
          { label: "Landing Pages", key: "landing", icon: "🚀" },
          { label: "Dashboards", key: "dashboard", icon: "📊" },
          { label: "UI Kits", key: "uikits", icon: "🧩" },
          { label: "Pricing", key: "pricing", icon: "💳" },
          { label: "Icons", key: "icons", icon: "✨" },
          { label: "Illustrations", key: "illustrations", icon: "🖼️" },
        ]}
        colors={[
          { label: "Purple Neon", value: "#A855F7" },
          { label: "Violet", value: "#7C3AED" },
          { label: "Pink", value: "#EC4899" },
          { label: "Cyan", value: "#22D3EE" },
          { label: "Black", value: "#0B0B12" },
          { label: "White", value: "#FFFFFF" },
        ]}
        templates={[
          {
            title: "Neo Noir Dashboard",
            subtitle: "Figma + Framer. Dark mode ready.",
            imageUrl:
              "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=70",
            href: "/templates/neo-noir-dashboard",
            categoryKey: "dashboard",
            tool: "Both",
            color: "#A855F7",
            priceLabel: "$29",
            priceValue: 29,
            isFree: false,
            isPaid: true,
            isPopular: true,
            isNew: false,
            badge: "Popular",
            tag1: "Purple Neon",
            tag2: "SaaS",
          },
          {
            title: "Landing Page Kit",
            subtitle: "Conversion-first sections. Responsive.",
            imageUrl:
              "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1600&q=70",
            href: "/templates/landing-kit",
            categoryKey: "landing",
            tool: "Framer",
            color: "#7C3AED",
            priceLabel: "Free",
            priceValue: 0,
            isFree: true,
            isPaid: false,
            isPopular: true,
            isNew: true,
            badge: "New",
            tag1: "Free",
            tag2: "Hero + Pricing",
          },
          {
            title: "UI Component Library",
            subtitle: "Buttons, nav, pricing, FAQ, cards.",
            imageUrl:
              "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=70",
            href: "/templates/component-library",
            categoryKey: "uikits",
            tool: "Figma",
            color: "#A855F7",
            priceLabel: "$49",
            priceValue: 49,
            isFree: false,
            isPaid: true,
            isPopular: false,
            isNew: true,
            badge: "Staff Pick",
            tag1: "Purple",
            tag2: "Tokens",
          },
          {
            title: "Pricing Page Pack",
            subtitle: "High-converting pricing layouts.",
            imageUrl:
              "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1600&q=70",
            href: "/templates/pricing-pack",
            categoryKey: "pricing",
            tool: "Framer",
            color: "#EC4899",
            priceLabel: "$15",
            priceValue: 15,
            isFree: false,
            isPaid: true,
            isPopular: false,
            isNew: true,
            badge: "New",
            tag1: "Pricing",
            tag2: "SaaS",
          },
          {
            title: "Free Icon Set",
            subtitle: "Crisp icons for SaaS + apps.",
            imageUrl:
              "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=70",
            href: "/freebies/icons",
            categoryKey: "icons",
            tool: "Figma",
            color: "#FFFFFF",
            priceLabel: "Free",
            priceValue: 0,
            isFree: true,
            isPaid: false,
            isPopular: true,
            isNew: false,
            badge: "Free",
            tag1: "Icons",
            tag2: "Monochrome",
          },
          {
            title: "Illustration Pack",
            subtitle: "Purple neon illustrations for landing pages.",
            imageUrl:
              "https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=1600&q=70",
            href: "/templates/illustration-pack",
            categoryKey: "illustrations",
            tool: "Figma",
            color: "#A855F7",
            priceLabel: "$19",
            priceValue: 19,
            isFree: false,
            isPaid: true,
            isPopular: true,
            isNew: true,
            badge: "Popular",
            tag1: "Illustrations",
            tag2: "Purple",
          },
        ]}
      />
      <DetailsSection
        title="Built for creators who ship fast"
        subtitle="A curated marketplace of Framer + Figma templates and resources. Filter instantly, customize deeply, and publish with confidence."
        maxFeatures={6}
        features={[
          {
            icon: "⚡",
            title: "Curated quality, not clutter",
            body: "Only production-ready kits. Clean layers, sensible components, and consistent tokens.",
            showLink: true,
            linkLabel: "See guidelines",
            linkHref: "/guidelines",
            linkNewTab: false,
          },
          {
            icon: "🎛️",
            title: "Filters that actually work",
            body: "Browse by category, color, tool, pricing, and what's trending — with zero friction.",
            showLink: true,
            linkLabel: "Browse templates",
            linkHref: "/templates",
            linkNewTab: false,
          },
          {
            icon: "🧬",
            title: "Design-to-build consistency",
            body: "Figma components map cleanly to Framer sections so your edits stay predictable.",
            showLink: true,
            linkLabel: "Learn workflow",
            linkHref: "/workflow",
            linkNewTab: false,
          },
          {
            icon: "🛡️",
            title: "Licensing made simple",
            body: "Clear personal/commercial licenses for every asset. No surprises, ever.",
            showLink: false,
            linkLabel: "View licenses",
            linkHref: "/licenses",
            linkNewTab: false,
          },
          {
            icon: "💜",
            title: "Purple-neon by default",
            body: "A cohesive neon + white aesthetic with editable tokens to match your brand in minutes.",
            showLink: false,
            linkLabel: "Customize",
            linkHref: "/",
            linkNewTab: false,
          },
          {
            icon: "🚀",
            title: "Ship faster",
            body: "Drop sections in, swap content, publish. Ideal for founders, designers, and agencies.",
            showLink: false,
            linkLabel: "Get started",
            linkHref: "/pricing",
            linkNewTab: false,
          },
        ]}
        showIntegrations={true}
        integrationsTitle="Works with"
        maxIntegrations={10}
        integrations={[
          {
            name: "Figma",
            logoUrl: "https://www.svgrepo.com/show/303210/figma-1-logo.svg",
            href: "https://www.figma.com",
            newTab: true,
          },
          {
            name: "Framer",
            logoUrl: "https://www.svgrepo.com/show/353936/framer.svg",
            href: "https://www.framer.com",
            newTab: true,
          },
          {
            name: "Notion",
            logoUrl: "https://www.svgrepo.com/show/504290/notion.svg",
            href: "https://www.notion.so",
            newTab: true,
          },
          {
            name: "Slack",
            logoUrl: "https://www.svgrepo.com/show/452102/slack.svg",
            href: "https://slack.com",
            newTab: true,
          },
          {
            name: "Zapier",
            logoUrl: "https://www.svgrepo.com/show/354345/zapier.svg",
            href: "https://zapier.com",
            newTab: true,
          },
        ]}
        showCTA={true}
        ctaTitle="Start with free templates today"
        ctaBody="Grab the free pack or upgrade for full access to premium templates and resource drops."
        primaryLabel="Get Access"
        primaryHref="/pricing"
        primaryNewTab={false}
        secondaryLabel="Explore Freebies"
        secondaryHref="/freebies"
        secondaryNewTab={false}
        showSecondary={true}
      />
      <FAQSection
        showHeader={true}
        title="Frequently asked questions"
        subtitle="Everything you need to know about templates, licensing, and updates."
        maxItems={10}
        allowMultipleOpen={true}
        openFirstByDefault={true}
        items={[
          {
            icon: "🧩",
            question: "Do templates include both Figma and Framer files?",
            answer: "Some packs include both. Each template card clearly shows whether it includes Figma, Framer, or both.",
            badge: "Files",
            showLink: true,
            linkLabel: "See file types",
            linkHref: "/templates",
            linkNewTab: false,
          },
          {
            icon: "💎",
            question: "What's the difference between Free and Pro?",
            answer: "Free gives you curated freebies. Pro unlocks premium templates, early drops, and commercial licensing for client work.",
            badge: "Pricing",
            showLink: true,
            linkLabel: "Compare plans",
            linkHref: "/pricing",
            linkNewTab: false,
          },
          {
            icon: "🛡️",
            question: "Can I use templates for client projects?",
            answer: "Yes — Pro/Studio plans include commercial usage. Always check the license section on each asset for specifics.",
            badge: "License",
            showLink: true,
            linkLabel: "View licenses",
            linkHref: "/licenses",
            linkNewTab: false,
          },
          {
            icon: "⚡",
            question: "How often do you add new templates?",
            answer: "We ship new drops weekly, with early access for Pro members and highlighted \"New\" badges across the library.",
            badge: "Updates",
            showLink: false,
            linkLabel: "Updates",
            linkHref: "/blog",
            linkNewTab: false,
          },
          {
            icon: "🎨",
            question: "Can I filter by color and category?",
            answer: "Yes — browse by category, color, tool, pricing, and sort by Popular/New so you can find the right kit fast.",
            badge: "Filters",
            showLink: false,
            linkLabel: "Filters",
            linkHref: "/templates",
            linkNewTab: false,
          },
        ]}
        showSupportCTA={true}
        supportTitle="Still have questions?"
        supportBody="Talk to support or check the docs — we're fast and friendly."
        supportPrimaryLabel="Contact support"
        supportPrimaryHref="/contact"
        supportPrimaryNewTab={false}
        supportSecondaryLabel="Read docs"
        supportSecondaryHref="/docs"
        supportSecondaryNewTab={false}
        showSupportSecondary={true}
      />
      <Footer
        brandName="AllWebsiteTemplates"
        brandTagline="Purple-neon website templates and design resources — curated for fast shipping."
        showLogoImage={false}
        brandHref="/"
        showNewsletter={true}
        newsletterTitle="Newsletter"
        newsletterBody="Weekly drops: new templates, freebies, and design tool resources. No spam."
        emailPlaceholder="you@company.com"
        buttonLabel="Join"
        buttonHref="/subscribe"
        buttonNewTab={false}
        showSecondaryLink={true}
        secondaryLinkLabel="Browse Freebies"
        secondaryLinkHref="/freebies"
        secondaryLinkNewTab={false}
        maxColumns={4}
        maxLinksPerColumn={8}
        columns={[
          {
            title: "Library",
            links: [
              { label: "All Templates", href: "/templates" },
              { label: "Categories", href: "/categories" },
              { label: "Popular", href: "/templates?sort=popular" },
              { label: "New", href: "/templates?sort=new" },
            ],
          },
          {
            title: "Free",
            links: [
              { label: "Freebies", href: "/freebies" },
              {
                label: "Free Figma",
                href: "/templates?price=free&tool=figma",
              },
              {
                label: "Free Framer",
                href: "/templates?price=free&tool=framer",
              },
            ],
          },
          {
            title: "Company",
            links: [
              { label: "Pricing", href: "/pricing" },
              { label: "Blog", href: "/blog" },
              { label: "Contact", href: "/contact" },
            ],
          },
          {
            title: "Legal",
            links: [
              { label: "Licenses", href: "/licenses" },
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
            ],
          },
        ]}
        maxSocial={6}
        socialLinks={[
          { label: "X", icon: "𝕏", href: "https://x.com", newTab: true },
          {
            label: "YouTube",
            icon: "▶︎",
            href: "https://youtube.com",
            newTab: true,
          },
          {
            label: "Discord",
            icon: "💬",
            href: "https://discord.com",
            newTab: true,
          },
        ]}
        maxLegal={6}
        legalLinks={[
          { label: "Privacy", href: "/privacy" },
          { label: "Terms", href: "/terms" },
          { label: "Licenses", href: "/licenses" },
        ]}
        copyrightText="© 2026 AllWebsiteTemplates. All rights reserved."
        showGlowStrip={true}
      />
    </main>
  )
}

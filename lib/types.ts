export interface EnginePaletteColor {
	hex: string;
	role?: string | null;
}

export interface EngineFont {
	name: string;
	role?: string | null;
	weights?: number[];
}

export interface EngineTech {
	summary?: string | null;
	builder_cms?: string[];
	framework?: string[];
	language?: string[];
	frontend?: string[];
	web_server?: string[];
	hosting?: string[];
	cdn?: string[];
	storage?: string[];
	ecommerce?: string[];
}

/** Allowlisted public record produced by the local intelligence engine. */
export interface EnginePublicSite {
	domain: string;
	url: string | null;
	name: string | null;
	description: string | null;
	category: string | null;
	subcategory: string | null;
	website_type: string | null;
	audience: string[];
	palette: EnginePaletteColor[];
	fonts: EngineFont[];
	style: string[];
	favicon: string | null;
	screenshot: string | null;
	linkedin: string | null;
	x: string | null;
	contact_email: string | null;
	contact_address: string | null;
	date_added: string | null;
	last_checked: string | null;
	tech_summary: string | null;
	tech: EngineTech | null;
	key_pages: Record<string, { url: string }>;
	page_shots: Array<{ label: string | null; url: string | null; path: string | null }>;
	slug?: string;
}

export interface Website {
	id: string;
	name: string;
	url: string;
	category: string;
	description: string;
	screenshotUrl: string;
	slug: string;
	/** Broad, canonical grouping for filtering (e.g., "SaaS", "Agency/Studio") */
	displayCategory?: string;
	/** Full-page WebP capture served from public/fullshots/{slug}.webp */
	fullScreenshotUrl?: string;
	/** Optional score used for featured/popular sorting */
	qualityScore?: number;
	/** Whether this website is featured (shown at top on homepage) */
	featured?: boolean;
	/** Whether this website is hidden from the directory */
	hidden?: boolean;
	/** True when this record came from the local engine export. */
	fromEngine?: boolean;
	subcategory?: string;
	websiteType?: string;
	audience?: string[];
	style?: string[];
	palette?: EnginePaletteColor[];
	fonts?: EngineFont[];
	techSummary?: string;
	tech?: EngineTech | null;
	keyPages?: Record<string, { url: string }>;
	contactEmail?: string;
	linkedin?: string;
	x?: string;
	faviconUrl?: string;
	domain?: string;
}



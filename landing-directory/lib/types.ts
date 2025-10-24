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
}



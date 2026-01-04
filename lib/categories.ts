export function getCategoryColor(category: string): string {
	// Handle undefined/null category
	if (!category) {
		return '#ADADAD'; // Light gray default
	}

	// Dark mode highlight palette
  // Distinct bright palette for all categories (no repeats)
  const colors: Record<string, string> = {
    'SaaS': '#4F46E5',        // Indigo
    'Agency/Studio': '#EC4899',// Pink
    'Portfolio': '#10B981',    // Emerald
    'Fintech': '#0D9488',      // Teal
    'E-commerce': '#F59E0B',   // Amber
    'Developer': '#8B5CF6',    // Violet
    'AI': '#06B6D4',           // Cyan
    'AI Agent': '#FF6B6B',     // Coral
    'Crypto/Web3': '#F97316',  // Orange
    'Health': '#84CC16',       // Lime
    'Education': '#2563EB',    // Blue (deeper)
    'Template': '#9CA3AF',     // Gray
    'Other': '#64748B',        // Slate
  };

	return colors[category] || '#ADADAD'; // Light gray default
}

// Map noisy/compound CSV categories into one of a small set of macro categories
export function mapToMacroCategory(inputCategory: string): string {
    const c = inputCategory.toLowerCase();

    // PRIORITY: classify AI Agents and AI before the broad 'tool/platform' bucket
    if (c.includes('ai tool / agents') || c.includes('ai agent')) return 'AI Agent';
    if (c.includes('ai')) return 'AI';

    if (c.includes('saas') || c.includes('software') || c.includes('tool') || c.includes('platform')) return 'SaaS';
    if (c.includes('fintech') || c.includes('finance') || c.includes('payments') || c.includes('bank')) return 'Fintech';
    if (c.includes('e-commerce') || c.includes('ecommerce') || c.includes('store') || c.includes('shop')) return 'E-commerce';
    if (c.includes('agency') || c.includes('design studio') || c.includes('studio') || c.includes('creative')) return 'Agency/Studio';
    if (c.includes('portfolio')) return 'Portfolio';
    if (c.includes('devtool') || c.includes('developer') || c.includes('docs') || c.includes('library')) return 'Developer';
    if (c.includes('crypto') || c.includes('web3') || c.includes('defi') || c.includes('nft')) return 'Crypto/Web3';
    if (c.includes('health') || c.includes('wellness') || c.includes('fitness') || c.includes('medical')) return 'Health';
    if (c.includes('education') || c.includes('course')) return 'Education';
    if (c.includes('template')) return 'Template';
    return 'Other';
}

export const MACRO_CATEGORIES: string[] = [
	'Browse All',
	'SaaS',
	'Agency/Studio',
	'Portfolio',
	'Fintech',
	'E-commerce',
	'Developer',
	'AI',
	'AI Agent',
	'Crypto/Web3',
	'Health',
	'Education',
	'Template',
	'Other',
];

// Slug helpers for category routes
export function slugifyCategory(name: string): string {
  const map: Record<string, string> = {
    'SaaS': 'saas',
    'Agency/Studio': 'agency-studio',
    'Portfolio': 'portfolio',
    'Fintech': 'fintech',
    'E-commerce': 'e-commerce',
    'Developer': 'developer',
    'AI': 'ai',
    'AI Agent': 'ai-agent',
    'Crypto/Web3': 'crypto-web3',
    'Health': 'health',
    'Education': 'education',
    'Template': 'template',
    'Other': 'other',
    'Browse All': 'all'
  };
  return map[name] || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

export function categoryFromSlug(slug: string): string | null {
  const reverse: Record<string, string> = {
    'saas': 'SaaS',
    'agency-studio': 'Agency/Studio',
    'portfolio': 'Portfolio',
    'fintech': 'Fintech',
    'e-commerce': 'E-commerce',
    'developer': 'Developer',
    'ai': 'AI',
    'ai-agent': 'AI Agent',
    'crypto-web3': 'Crypto/Web3',
    'health': 'Health',
    'education': 'Education',
    'template': 'Template',
    'other': 'Other',
    'all': 'Browse All'
  };
  return reverse[slug] || null;
}

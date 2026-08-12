export const MACRO_CATEGORIES = [
  'Browse All', 'SaaS', 'Agency/Studio', 'Portfolio', 'Fintech', 'E-commerce',
  'Developer', 'AI', 'AI Agent', 'Crypto/Web3', 'Health', 'Education',
  'Media/Entertainment', 'Architecture/Real Estate', 'Food & Beverage',
  'Travel/Hospitality', 'Nonprofit', 'Fashion/Retail', 'Music/Audio',
  'Photography', 'Typography', 'Template', 'Other',
] as const;

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    SaaS: '#4F46E5', 'Agency/Studio': '#EC4899', Portfolio: '#10B981',
    Fintech: '#0D9488', 'E-commerce': '#F59E0B', Developer: '#8B5CF6',
    AI: '#06B6D4', 'AI Agent': '#FF6B6B', 'Crypto/Web3': '#F97316',
    Health: '#84CC16', Education: '#2563EB', 'Media/Entertainment': '#DB2777',
    'Architecture/Real Estate': '#A16207', 'Food & Beverage': '#DC2626',
    'Travel/Hospitality': '#0284C7', Nonprofit: '#059669',
    'Fashion/Retail': '#C026D3', 'Music/Audio': '#7C3AED',
    Photography: '#475569', Typography: '#9333EA', Template: '#9CA3AF', Other: '#64748B',
  };
  return colors[category] || '#ADADAD';
}

export function mapToMacroCategory(inputCategory: string): string {
  const c = inputCategory.toLowerCase().replace(/[_-]+/g, ' ');
  const has = (...terms: string[]) => terms.some((term) => c.includes(term));
  const hasWord = (term: string) => new RegExp(`(^|[^a-z0-9])${term}([^a-z0-9]|$)`, 'i').test(c);

  if (has('ai agent', 'agents', 'agentic')) return 'AI Agent';
  if (hasWord('ai') || has('artificial intelligence', 'machine learning')) return 'AI';
  if (has('fintech', 'finance', 'payment', 'banking', 'investment')) return 'Fintech';
  if (has('fashion', 'apparel', 'beauty', 'jewelry')) return 'Fashion/Retail';
  if (has('e commerce', 'ecommerce', 'retail', 'store', 'shop', 'marketplace')) return 'E-commerce';
  if (has('agency', 'design studio', 'creative studio', 'studio', 'creative')) return 'Agency/Studio';
  if (has('portfolio', 'personal')) return 'Portfolio';
  if (has('developer', 'devtool', 'developer tool', 'documentation', 'library')) return 'Developer';
  if (has('crypto', 'web3', 'defi', 'nft', 'blockchain')) return 'Crypto/Web3';
  if (has('health', 'wellness', 'fitness', 'medical', 'healthcare')) return 'Health';
  if (has('education', 'course', 'learning', 'school', 'university')) return 'Education';
  if (has('media', 'entertainment', 'film', 'publishing', 'magazine')) return 'Media/Entertainment';
  if (has('architecture', 'real estate', 'property', 'interior')) return 'Architecture/Real Estate';
  if (has('food', 'beverage', 'restaurant', 'coffee', 'bakery')) return 'Food & Beverage';
  if (has('travel', 'hospitality', 'hotel', 'tourism')) return 'Travel/Hospitality';
  if (has('nonprofit', 'non profit', 'charity', 'foundation', 'conservation')) return 'Nonprofit';
  if (has('music', 'audio', 'podcast')) return 'Music/Audio';
  if (has('photography', 'photo')) return 'Photography';
  if (has('typography', 'typeface', 'font')) return 'Typography';
  if (has('template', 'ui kit')) return 'Template';
  if (hasWord('saas') || has('software', 'tool', 'platform', 'productivity', 'business')) return 'SaaS';
  return 'Other';
}

const SLUGS: Record<string, string> = {
  SaaS: 'saas', 'Agency/Studio': 'agency-studio', Portfolio: 'portfolio', Fintech: 'fintech',
  'E-commerce': 'e-commerce', Developer: 'developer', AI: 'ai', 'AI Agent': 'ai-agent',
  'Crypto/Web3': 'crypto-web3', Health: 'health', Education: 'education',
  'Media/Entertainment': 'media-entertainment', 'Architecture/Real Estate': 'architecture-real-estate',
  'Food & Beverage': 'food-beverage', 'Travel/Hospitality': 'travel-hospitality', Nonprofit: 'nonprofit',
  'Fashion/Retail': 'fashion-retail', 'Music/Audio': 'music-audio', Photography: 'photography',
  Typography: 'typography', Template: 'template', Other: 'other', 'Browse All': 'all',
};

export function slugifyCategory(name: string): string {
  return SLUGS[name] || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

export function categoryFromSlug(slug: string): string | null {
  return Object.entries(SLUGS).find(([, value]) => value === slug)?.[0] || null;
}

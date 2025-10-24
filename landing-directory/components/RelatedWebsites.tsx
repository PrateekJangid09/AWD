import { Website } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { getCategoryColor } from '@/lib/categories';

interface RelatedWebsitesProps {
  websites: Website[];
  currentCategory: string;
}

export default function RelatedWebsites({ websites, currentCategory }: RelatedWebsitesProps) {
  if (websites.length === 0) {
    return null;
  }

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-text-primary mb-2">
              More from {currentCategory}
            </h2>
            <p className="text-text-secondary">
              Discover similar websites in this category
            </p>
          </div>
          
          <Link
            href={`/?category=${encodeURIComponent(currentCategory)}`}
            className="hidden sm:inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-dark-teal/10 to-deep-pink/10 hover:from-dark-teal/20 hover:to-deep-pink/20 border border-dark-teal/20 rounded-xl text-sm font-semibold text-dark-teal transition-all duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dark-teal focus-visible:ring-offset-2"
          >
            <span>View All</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Related Websites Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {websites.map((website) => (
            <RelatedWebsiteCard key={website.id} website={website} />
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-8 sm:hidden">
          <Link
            href={`/?category=${encodeURIComponent(currentCategory)}`}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-dark-teal/10 to-deep-pink/10 border border-dark-teal/20 rounded-xl text-sm font-semibold text-dark-teal transition-all duration-200 hover:scale-105"
          >
            <span>View All {currentCategory}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Smaller card variant for related websites
function RelatedWebsiteCard({ website }: { website: Website }) {
  const categoryColor = getCategoryColor(website.displayCategory || website.category);
  const displayCategory = website.displayCategory || website.category;

  return (
    <Link
      href={`/sites/${website.slug}`}
      className="group relative block overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-pink focus-visible:ring-offset-2"
    >
      {/* Card Container */}
      <div className="relative h-[280px] overflow-hidden">
        {/* Glass Morphism Background */}
        <div 
          className="absolute inset-0 backdrop-blur-xl bg-white/10 border border-white/20"
          style={{
            background: `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)`,
            boxShadow: `0 4px 16px rgba(0,0,0,0.1)`
          }}
        />

        {/* Screenshot */}
        <div className="relative h-[180px] w-full overflow-hidden">
          <Image
            src={website.screenshotUrl}
            alt={`${website.name} screenshot`}
            fill
            className="object-cover object-top transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 left-3 z-10">
          <div 
            className="px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/20 text-xs font-medium text-white shadow-lg"
            style={{ backgroundColor: `${categoryColor}CC` }}
          >
            {displayCategory}
          </div>
        </div>

        {/* Content Section */}
        <div className="relative p-4 bg-gradient-to-br from-white via-white to-gray-50/50">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />
          
          <div className="relative z-10">
            <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-deep-pink transition-colors duration-300">
              {website.name}
            </h3>
            
            <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
              {website.description}
            </p>
          </div>
        </div>

        {/* Hover Indicator */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <div className="flex items-center justify-center w-8 h-8 bg-deep-pink rounded-full shadow-lg">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

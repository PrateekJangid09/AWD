import { getWebsites } from '@/lib/data';
import { MACRO_CATEGORIES } from '@/lib/categories';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomePageContent from '@/components/HomePageContent';

export const metadata = {
  title: 'FigFiles - Design Inspiration & Resources',
  description: 'Discover amazing design resources, landing pages, and UI inspiration. Curated collection of 750+ websites for designers and developers.',
};

export default async function HomePage() {
  const websites = await getWebsites();
  const categories = MACRO_CATEGORIES;

  // Calculate stats
  const totalWebsites = websites.length;
  const totalCategories = categories.length - 1; // Exclude "Browse All"
  
  // Get featured websites
  const featuredWebsites = websites.filter(w => w.featured).slice(0, 20);

  return (
    <>
      <Header />
      
      <main className="min-h-screen">
        <HomePageContent
          websites={websites}
          categories={categories}
          totalWebsites={totalWebsites}
          totalCategories={totalCategories}
          featuredWebsites={featuredWebsites}
        />
        
      </main>

      <Footer />
    </>
  );
}
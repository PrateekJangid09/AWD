import { NextResponse } from 'next/server';
import { getWebsites, getCategories } from '@/lib/data';
import { MACRO_CATEGORIES } from '@/lib/categories';

export async function GET() {
  try {
    const websites = await getWebsites();
    const categories = await getCategories();
    
    return NextResponse.json({
      websites,
      categories, // original/raw categories
      macroCategories: MACRO_CATEGORIES,
    });
  } catch (error) {
    console.error('Error fetching websites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch websites' },
      { status: 500 }
    );
  }
}


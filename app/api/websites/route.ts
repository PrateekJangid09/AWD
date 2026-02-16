import { NextResponse } from 'next/server';
import { getWebsites } from '@/lib/data';
import { MACRO_CATEGORIES } from '@/lib/categories';

export async function GET() {
  try {
    const websites = await getWebsites();
    
    const response = NextResponse.json({
      websites,
      macroCategories: MACRO_CATEGORIES,
    });
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=60'
    );
    return response;
  } catch (error) {
    console.error('Error fetching websites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch websites' },
      { status: 500 }
    );
  }
}


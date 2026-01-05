import { NextRequest, NextResponse } from 'next/server';

/**
 * IndexNow API endpoint for Bing indexing
 * 
 * To use this endpoint, you need to:
 * 1. Get an API key from Bing Webmaster Tools (optional - IndexNow doesn't require authentication for public sites)
 * 2. Add INDEXNOW_API_KEY to your .env.local file (optional)
 * 3. Submit URLs to this endpoint when content is created/updated
 * 
 * Usage example:
 * POST /api/indexnow
 * Body: { "urls": ["https://www.allwebsites.design/sites/example"] }
 * 
 * IndexNow specification: https://www.indexnow.org/
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { urls } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'URLs array is required' },
        { status: 400 }
      );
    }

    // Validate URLs
    const baseUrl = 'https://www.allwebsites.design';
    const validUrls = urls.filter((url: string) => {
      try {
        const urlObj = new URL(url);
        return urlObj.origin === baseUrl || urlObj.hostname === 'allwebsites.design';
      } catch {
        return false;
      }
    });

    if (validUrls.length === 0) {
      return NextResponse.json(
        { error: 'No valid URLs provided' },
        { status: 400 }
      );
    }

    // IndexNow API endpoint for Bing
    const indexNowUrl = 'https://api.indexnow.org/IndexNow';
    
    // IndexNow key (optional - can be configured via environment variable)
    // For public sites, IndexNow doesn't require authentication
    const apiKey = process.env.INDEXNOW_API_KEY;

    // Prepare the request body for IndexNow
    const indexNowBody = {
      host: new URL(baseUrl).hostname,
      key: apiKey || undefined,
      keyLocation: apiKey ? `${baseUrl}/api/indexnow/key` : undefined,
      urlList: validUrls,
    };

    // Submit to IndexNow
    const response = await fetch(indexNowUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(indexNowBody),
    });

    if (!response.ok) {
      console.error('IndexNow submission failed:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to submit to IndexNow', status: response.status },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      submitted: validUrls.length,
      urls: validUrls,
    });
  } catch (error) {
    console.error('IndexNow API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to return the IndexNow key file (if using key-based authentication)
 * This endpoint should return a text file with the API key
 */
export async function GET() {
  const apiKey = process.env.INDEXNOW_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'IndexNow API key not configured' },
      { status: 404 }
    );
  }

  return new NextResponse(apiKey, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}

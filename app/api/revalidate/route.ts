import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

/**
 * On-demand revalidation (ISR).
 * Secured by REVALIDATE_SECRET. Call after updating CSV/SEO to refresh cached pages.
 *
 * GET or POST:
 *   ?secret=REVALIDATE_SECRET&path=/           — revalidate homepage
 *   ?secret=REVALIDATE_SECRET&path=/sites/foo  — revalidate one site
 *   ?secret=REVALIDATE_SECRET&path=all         — revalidate entire site (layout)
 *
 * POST body (JSON): { "secret": "...", "path": "/" } or { "paths": ["/", "/c"] }
 */
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  const pathParam = request.nextUrl.searchParams.get('path');

  if (process.env.REVALIDATE_SECRET == null || process.env.REVALIDATE_SECRET === '') {
    return NextResponse.json(
      { message: 'Revalidation is not configured (missing REVALIDATE_SECRET).' },
      { status: 503 }
    );
  }

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  if (pathParam == null || pathParam === '') {
    return NextResponse.json(
      { message: 'Missing path. Use path=/ or path=/sites/slug or path=all' },
      { status: 400 }
    );
  }

  try {
    if (pathParam === 'all') {
      revalidatePath('/', 'layout');
      return NextResponse.json({ revalidated: true, path: '/' });
    }

    revalidatePath(pathParam);
    return NextResponse.json({ revalidated: true, path: pathParam });
  } catch (err) {
    console.error('Error revalidating:', err);
    return NextResponse.json(
      { message: 'Error revalidating', error: String(err) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const urlSecret = request.nextUrl.searchParams.get('secret');
  const urlPath = request.nextUrl.searchParams.get('path');

  if (process.env.REVALIDATE_SECRET == null || process.env.REVALIDATE_SECRET === '') {
    return NextResponse.json(
      { message: 'Revalidation is not configured (missing REVALIDATE_SECRET).' },
      { status: 503 }
    );
  }

  const secret = urlSecret ?? (await request.json().catch(() => ({}))).secret;
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  let paths: string[] = [];
  if (urlPath) {
    paths = [urlPath];
  } else {
    const body = await request.json().catch(() => ({}));
    if (body.path != null) paths = Array.isArray(body.path) ? body.path : [body.path];
    else if (Array.isArray(body.paths)) paths = body.paths;
  }

  if (paths.length === 0) {
    return NextResponse.json(
      { message: 'Missing path or paths. Use path=/ or paths=["/", "/c"] or path=all' },
      { status: 400 }
    );
  }

  const revalidated: string[] = [];
  try {
    for (const p of paths) {
      if (p === 'all') {
        revalidatePath('/', 'layout');
        revalidated.push('/');
      } else {
        revalidatePath(p);
        revalidated.push(p);
      }
    }
    return NextResponse.json({ revalidated: true, paths: revalidated });
  } catch (err) {
    console.error('Error revalidating:', err);
    return NextResponse.json(
      { message: 'Error revalidating', error: String(err) },
      { status: 500 }
    );
  }
}

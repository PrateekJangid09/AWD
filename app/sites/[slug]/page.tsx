import { redirect, notFound } from 'next/navigation';
import { getWebsiteBySlug } from '@/lib/data';
import { siteHref } from '@/lib/paths';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Legacy /sites/:slug → /category/saas/rankbeaver */
export default async function LegacySiteRedirect({ params }: PageProps) {
  const { slug } = await params;
  const website = await getWebsiteBySlug(slug);
  if (!website) notFound();
  redirect(siteHref(website));
}

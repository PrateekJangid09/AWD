import type { Metadata } from 'next'; import { redirect } from 'next/navigation';
export const metadata: Metadata = { title: 'Website Templates — Not Yet Available', robots: { index: false, follow: true } };
export default function WebsiteTemplatesPage() { redirect('/archive'); }

import { NextResponse } from 'next/server';
import { email, forwardForm, text } from '@/lib/form-webhooks';
export async function POST(request: Request) { const body = await request.json().catch(() => ({})); if (text(body.company)) return NextResponse.json({ ok: true }); const address = email(body.email); if (!address) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 }); return forwardForm('NEWSLETTER_WEBHOOK_URL', { type: 'newsletter', email: address, submittedAt: new Date().toISOString() }); }

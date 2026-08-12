import { NextResponse } from 'next/server';

export function text(value: unknown, max = 2000) { return typeof value === 'string' ? value.trim().slice(0, max) : ''; }
export function email(value: unknown) { const clean = text(value, 254).toLowerCase(); return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean) ? clean : ''; }

export async function forwardForm(envName: string, payload: Record<string, unknown>) {
  const url = process.env[envName];
  if (!url) return NextResponse.json({ error: 'This form is temporarily unavailable. Please try again later.' }, { status: 503 });
  try {
    const response = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error('Receiver rejected submission');
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: 'We could not send this submission. Please try again.' }, { status: 502 }); }
}

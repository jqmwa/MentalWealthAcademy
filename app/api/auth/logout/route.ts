import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: 'mwa_session',
    value: '',
    path: '/',
    maxAge: 0,
  });
  return response;
}

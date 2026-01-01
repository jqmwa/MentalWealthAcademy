import { NextResponse } from 'next/server';
import { ensureForumSchema } from '@/lib/ensureForumSchema';
import { getCurrentUserFromRequestCookie } from '@/lib/auth';
import { isDbConfigured } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Redirect to the new X auth check endpoint
export async function POST(request: Request) {
  // Forward to the new X auth check endpoint
  const response = await fetch(new URL('/api/x-auth/check-follow', request.url), {
    method: 'POST',
    headers: request.headers,
  });
  
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}


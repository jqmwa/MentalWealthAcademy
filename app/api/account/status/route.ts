import { NextResponse } from 'next/server';
import { ensureForumSchema } from '@/lib/ensureForumSchema';
import { getCurrentUserFromRequestCookie } from '@/lib/auth';
import { isDbConfigured, sqlQuery } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/account/status
 * Checks if the current user has a linked blockchain account
 */
export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: 'Database is not configured on the server.' },
      { status: 503 }
    );
  }
  await ensureForumSchema();

  // Get our internal user record (authenticated via wallet address)
  const user = await getCurrentUserFromRequestCookie();
  if (!user) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }

  try {
    const hasLinkedAccount = !!user.walletAddress;

    return NextResponse.json({
      hasLinkedAccount,
      walletAddress: user.walletAddress || undefined,
    });
  } catch (err: any) {
    console.error('Error checking account status:', err);
    return NextResponse.json(
      { error: 'Failed to check account status.' },
      { status: 500 }
    );
  }
}


/**
 * GET /api/profile/check-username
 * 
 * Checks if a username is available.
 * Used during onboarding to provide real-time feedback.
 */

import { NextResponse } from 'next/server';
import { ensureForumSchema } from '@/lib/ensureForumSchema';
import { isDbConfigured, sqlQuery } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  // Validate username parameter
  if (!username || username.length < 3) {
    return NextResponse.json(
      { error: 'Username must be at least 3 characters.' },
      { status: 400 }
    );
  }

  // Database check
  if (!isDbConfigured()) {
    // If DB not configured, assume available (will fail on create anyway)
    return NextResponse.json({ available: true, username });
  }

  try {
    await ensureForumSchema();

    // Check if username exists
    const existing = await sqlQuery<Array<{ id: string }>>(
      `SELECT id FROM users WHERE username = :username LIMIT 1`,
      { username: username.toLowerCase() }
    );

    return NextResponse.json({
      available: existing.length === 0,
      username,
    });
  } catch (error) {
    console.error('Error checking username:', error);
    return NextResponse.json(
      { error: 'Failed to check username.' },
      { status: 500 }
    );
  }
}


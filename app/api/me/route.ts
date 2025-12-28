import { NextResponse } from 'next/server';
import { ensureForumSchema } from '@/lib/ensureForumSchema';
import { getCurrentUserFromRequestCookie } from '@/lib/auth';
import { isDbConfigured, sqlQuery } from '@/lib/db';
import { getPrivyUserFromRequest } from '@/lib/privy-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json({ user: null, dbConfigured: false });
  }
  await ensureForumSchema();

  const user = await getCurrentUserFromRequestCookie();
  if (!user) {
    return NextResponse.json({ user: null, dbConfigured: true });
  }

  // Get shard count from database
  const shardRows = await sqlQuery<Array<{ shard_count: number }>>(
    `SELECT shard_count FROM users WHERE id = :id LIMIT 1`,
    { id: user.id }
  );
  const shardCount = shardRows[0]?.shard_count ?? 0;

  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      shardCount,
      createdAt: user.createdAt,
    },
    dbConfigured: true,
  });
}

function isValidUsername(username: unknown): username is string {
  if (typeof username !== 'string') return false;
  const trimmed = username.trim();
  if (trimmed.length < 3 || trimmed.length > 32) return false;
  return /^[a-zA-Z0-9_]+$/.test(trimmed);
}

export async function PUT(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: 'Database is not configured on the server.' },
      { status: 503 }
    );
  }
  await ensureForumSchema();

  // Verify Privy authentication
  const privyUser = await getPrivyUserFromRequest();
  if (!privyUser) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }

  // Get our internal user record
  const user = await getCurrentUserFromRequestCookie();
  if (!user) {
    return NextResponse.json({ error: 'User account not found. Please complete signup.' }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const username = body?.username;
  const avatarUrl = typeof body?.avatarUrl === 'string' ? body.avatarUrl : null;

  if (username !== undefined && !isValidUsername(username)) {
    return NextResponse.json(
      {
        error:
          'Invalid username. Use 3-32 chars, letters/numbers/underscore only.',
      },
      { status: 400 }
    );
  }

  try {
    await sqlQuery(
      `UPDATE users
       SET username = COALESCE(:username, username),
           avatar_url = :avatarUrl
       WHERE id = :id`,
      {
        id: user.id,
        username: username === undefined ? null : String(username).trim(),
        avatarUrl,
      }
    );
  } catch (err: any) {
    // PostgreSQL error code 23505 for unique constraint violations
    if (err?.code === '23505' || err?.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Username already taken.' }, { status: 409 });
    }
    throw err;
  }

  return NextResponse.json({ ok: true });
}

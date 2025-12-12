import { NextResponse } from 'next/server';
import { ensureForumSchema } from '@/lib/ensureForumSchema';
import { getCurrentUserFromRequestCookie } from '@/lib/auth';
import { isDbConfigured, sqlQuery } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json({ user: null, dbConfigured: false });
  }
  await ensureForumSchema();

  const user = await getCurrentUserFromRequestCookie();
  return NextResponse.json({
    user: user
      ? {
          ...user,
          shardCount: 0,
        }
      : null,
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

  const user = await getCurrentUserFromRequestCookie();
  if (!user) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
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
    if (err?.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Username already taken.' }, { status: 409 });
    }
    throw err;
  }

  return NextResponse.json({ ok: true });
}

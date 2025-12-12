import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { ensureForumSchema } from '@/lib/ensureForumSchema';
import { createSessionForUser, setSessionCookie } from '@/lib/auth';
import { isDbConfigured, sqlQuery } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isValidUsername(username: unknown): username is string {
  if (typeof username !== 'string') return false;
  const trimmed = username.trim();
  if (trimmed.length < 3 || trimmed.length > 32) return false;
  return /^[a-zA-Z0-9_]+$/.test(trimmed);
}

export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: 'Database is not configured on the server.' },
      { status: 503 }
    );
  }
  await ensureForumSchema();

  const body = await request.json().catch(() => ({}));
  const username = body?.username;
  const avatarUrl = typeof body?.avatarUrl === 'string' ? body.avatarUrl : null;

  if (!isValidUsername(username)) {
    return NextResponse.json(
      {
        error:
          'Invalid username. Use 3-32 chars, letters/numbers/underscore only.',
      },
      { status: 400 }
    );
  }

  const id = uuidv4();

  try {
    await sqlQuery(
      `INSERT INTO users (id, username, avatar_url)
       VALUES (:id, :username, :avatarUrl)`,
      { id, username: username.trim(), avatarUrl }
    );
  } catch (err: any) {
    // Duplicate username
    if (err?.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Username already taken.' }, { status: 409 });
    }
    throw err;
  }

  const session = await createSessionForUser(id);
  const response = NextResponse.json({ ok: true });
  setSessionCookie(response, session.token);
  return response;
}

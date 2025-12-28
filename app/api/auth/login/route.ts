import { NextResponse } from 'next/server';
import { ensureForumSchema } from '@/lib/ensureForumSchema';
import { createSessionForUser, setSessionCookie } from '@/lib/auth';
import { isDbConfigured, sqlQuery } from '@/lib/db';
import { verifyPassword } from '@/lib/password';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isValidEmail(email: unknown): email is string {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
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
  const email = body?.email;
  const password = body?.password;

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: 'Valid email is required.' },
      { status: 400 }
    );
  }

  if (!password || typeof password !== 'string') {
    return NextResponse.json(
      { error: 'Password is required.' },
      { status: 400 }
    );
  }

  try {
    // Find user by email
    const users = await sqlQuery<Array<{ id: string; password_hash: string | null; username: string }>>(
      `SELECT id, password_hash, username FROM users WHERE email = :email LIMIT 1`,
      { email: email.trim().toLowerCase() }
    );

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const user = users[0];
      
    // Check if user has a password (email/password account)
    if (!user.password_hash) {
          return NextResponse.json(
        { error: 'This account was created with a different method. Please use the appropriate login method.' },
        { status: 401 }
          );
        }

    // Verify password
    if (!verifyPassword(password, user.password_hash)) {
        return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Create session
    const session = await createSessionForUser(user.id);
    const response = NextResponse.json({ ok: true, userId: user.id, username: user.username });
    setSessionCookie(response, session.token);
    return response;
  } catch (err: any) {
    console.error('Login error:', err);
      return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
      );
  }
}

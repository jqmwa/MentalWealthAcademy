import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { ensureForumSchema } from '@/lib/ensureForumSchema';
import { createSessionForUser, setSessionCookie } from '@/lib/auth';
import { isDbConfigured, sqlQuery } from '@/lib/db';
import { hashPassword } from '@/lib/password';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isValidEmail(email: unknown): email is string {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

function isValidPassword(password: unknown): password is string {
  if (typeof password !== 'string') return false;
  return password.length >= 8;
}

export async function POST(request: Request) {
  try {
    if (!isDbConfigured()) {
      return NextResponse.json(
        { error: 'Database is not configured on the server.' },
        { status: 503 }
      );
    }

    // Ensure schema is set up, handle connection errors gracefully
    try {
      await ensureForumSchema();
    } catch (error: any) {
      console.error('Schema setup error:', error);
      // Check if this is a database connection error
      if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND' || error?.code === 'ETIMEDOUT' || error?.message?.includes('connection')) {
        return NextResponse.json(
          { 
            error: 'Database connection failed.',
            message: 'Unable to connect to the database. Please check your database configuration.'
          },
          { status: 503 }
        );
      }
      // Re-throw other errors to be caught by outer try-catch
      throw error;
    }

    const body = await request.json().catch(() => ({}));
    const email = body?.email;
    const password = body?.password;

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Valid email is required.' },
        { status: 400 }
      );
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters.' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await sqlQuery<Array<{ id: string }>>(
      `SELECT id FROM users WHERE email = :email LIMIT 1`,
      { email: email.trim().toLowerCase() }
    );

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    // Create new user with email/password
    const userId = uuidv4();
    const passwordHash = hashPassword(password);

    await sqlQuery(
      `INSERT INTO users (id, email, password_hash, username)
       VALUES (:id, :email, :passwordHash, :username)`,
      { 
        id: userId, 
        email: email.trim().toLowerCase(), 
        passwordHash,
        username: `user_${userId.substring(0, 8)}` // Temporary username, user sets it in onboarding
      }
    );

    // Create session
    const session = await createSessionForUser(userId);
    const response = NextResponse.json({ ok: true, userId });
    setSessionCookie(response, session.token);
    return response;
  } catch (err: any) {
    console.error('Signup error:', err);
    
    // Duplicate email or other constraint violation (PostgreSQL error code 23505)
    if (err?.code === '23505' || err?.code === 'ER_DUP_ENTRY') {
      const constraint = err?.constraint || '';
      const message = err?.message || '';
      
      if (constraint.includes('email') || message.includes('email')) {
        return NextResponse.json({ error: 'Email already taken.' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Account creation failed due to duplicate data.' }, { status: 409 });
    }
    
    // Ensure we always return JSON, even on unexpected errors
    return NextResponse.json(
      { 
        error: 'Failed to create account.',
        message: process.env.NODE_ENV === 'development' ? err?.message : undefined
      },
      { status: 500 }
    );
  }
}

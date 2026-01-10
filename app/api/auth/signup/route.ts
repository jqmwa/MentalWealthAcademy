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
  
  // SECURITY: Stronger password requirements
  // At least 8 characters, with at least one uppercase, one lowercase, one number
  if (password.length < 8) return false;
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  return hasUpperCase && hasLowerCase && hasNumber;
}

export async function POST(request: Request) {
  try {
    // SECURITY: Rate limiting for signups
    const { checkRateLimit, getClientIdentifier, getRateLimitHeaders } = await import('@/lib/rate-limit');
    
    const rateLimitResult = checkRateLimit({
      max: 3, // Only 3 signups per hour per IP
      windowMs: 60 * 60 * 1000, // 1 hour
      identifier: getClientIdentifier(request),
    });
    
    if (!rateLimitResult.allowed) {
      const resetDate = new Date(rateLimitResult.resetAt);
      return NextResponse.json(
        { error: `Too many signup attempts. Try again after ${resetDate.toLocaleTimeString()}` },
        { 
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

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
      // SECURITY: Only log detailed errors in development
      if (process.env.NODE_ENV === 'development') {
      console.error('Schema setup error:', error);
      console.error('Error details:', {
        code: error?.code,
        message: error?.message,
      });
      } else {
        console.error('Schema setup error:', error?.code || 'Unknown error');
      }
      
      // Handle password authentication failures (28P01) - this is a critical error
      if (error?.code === '28P01' || error?.message?.includes('password authentication failed')) {
        return NextResponse.json(
          { 
            error: 'Database authentication failed.',
            message: error?.message || 'Password authentication failed. Please check your DATABASE_URL connection string.',
            code: error?.code || '28P01',
            details: process.env.NODE_ENV === 'development' ? error?.message : undefined
          },
          { status: 503 }
        );
      }
      
      // Check if this is a database connection error
      if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND' || error?.code === 'ETIMEDOUT' || error?.message?.includes('connection')) {
        const isDirectConnection = process.env.DATABASE_URL?.includes('db.') && process.env.DATABASE_URL?.includes('.supabase.co');
        const isVercel = process.env.VERCEL === '1';
        
        let message = 'Unable to connect to the database.';
        if (error?.code === 'ENOTFOUND' && isDirectConnection && isVercel) {
          message += ' Direct connections to Supabase often fail on Vercel. Please use the pooler connection string instead (see Supabase Dashboard → Database → Connection Pooling).';
        }
        
        return NextResponse.json(
          { 
            error: 'Database connection failed.',
            message: message,
            code: error?.code,
            details: process.env.NODE_ENV === 'development' ? error?.message : undefined
          },
          { status: 503 }
        );
      }
      
      // Handle pooler authentication errors - these are expected with pooler connections
      // The extension creation fails but schema tables should still be accessible
      if (error?.code === 'XX000' || error?.message?.includes('Tenant or user not found')) {
        console.warn('Schema setup warning (pooler connection), continuing:', error?.message);
        // Continue - the schema tables should still be accessible, extension creation just failed
      } else {
        // Re-throw other errors to be caught by outer try-catch
        throw error;
      }
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
        { error: 'Password must be at least 8 characters and include uppercase, lowercase, and a number.' },
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
    
    // Handle password authentication failures
    if (err?.code === '28P01' || err?.message?.includes('password authentication failed')) {
      return NextResponse.json(
        { 
          error: 'Database authentication failed.',
          // SECURITY: Don't expose internal error details in production
          message: process.env.NODE_ENV === 'development' 
            ? (err?.message || 'Password authentication failed. Please check your DATABASE_URL connection string.')
            : 'A database error occurred. Please contact support.',
          code: process.env.NODE_ENV === 'development' ? err?.code : undefined
        },
        { status: 503 }
      );
    }
    
    // Handle pooler authentication errors
    if (err?.code === 'XX000' || err?.message?.includes('Tenant or user not found')) {
      return NextResponse.json(
        { 
          error: 'Database authentication failed.',
          message: 'Please check your database connection string. For pooler connections, ensure the username format is correct (postgres.[PROJECT-REF]).'
        },
        { status: 503 }
      );
    }
    
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

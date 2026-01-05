import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { ensureForumSchema } from '@/lib/ensureForumSchema';
import { createSessionForUser, setSessionCookie } from '@/lib/auth';
import { isDbConfigured, sqlQuery } from '@/lib/db';
import { getWalletAddressFromRequest } from '@/lib/wallet-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    if (!isDbConfigured()) {
      return NextResponse.json(
        { error: 'Database is not configured on the server.' },
        { status: 503 }
      );
    }

    // Ensure schema is set up
    try {
      await ensureForumSchema();
    } catch (error: any) {
      console.error('Schema setup error:', error);
      // Continue with signup even if schema setup has warnings
      if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND' || error?.code === 'ETIMEDOUT') {
        return NextResponse.json(
          { error: 'Database connection failed.' },
          { status: 503 }
        );
      }
    }

    // Get wallet address from Authorization header
    const walletAddress = await getWalletAddressFromRequest();
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required.' },
        { status: 400 }
      );
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format.' },
        { status: 400 }
      );
    }

    // Check if wallet address already exists
    const existingUser = await sqlQuery<Array<{ id: string }>>(
      `SELECT id FROM users WHERE LOWER(wallet_address) = LOWER(:walletAddress) LIMIT 1`,
      { walletAddress: walletAddress.toLowerCase() }
    );

    if (existingUser.length > 0) {
      // User already exists - clear any old sessions and create new session
      const userId = existingUser[0].id;
      
      // Clear any existing sessions for this user to prevent conflicts
      try {
        await sqlQuery(
          `DELETE FROM sessions WHERE user_id = :userId`,
          { userId }
        );
      } catch (err) {
        // Ignore errors - sessions might not exist
        console.warn('Failed to clear existing sessions:', err);
      }
      
      const session = await createSessionForUser(userId);
      const response = NextResponse.json({ ok: true, userId, existing: true });
      setSessionCookie(response, session.token);
      return response;
    }

    // Create new user with wallet address only (no email/password required)
    const userId = uuidv4();
    const tempUsername = `user_${userId.substring(0, 8)}`;

    // Use a placeholder email to satisfy unique constraint if email is still NOT NULL
    // In PostgreSQL, we can use a unique value based on wallet address
    const placeholderEmail = `wallet_${walletAddress.toLowerCase()}@wallet.local`;

    await sqlQuery(
      `INSERT INTO users (id, wallet_address, username, email, password_hash)
       VALUES (:id, :walletAddress, :username, :email, :passwordHash)`,
      { 
        id: userId, 
        walletAddress: walletAddress.toLowerCase(),
        username: tempUsername,
        email: placeholderEmail, // Placeholder email for wallet signup
        passwordHash: null, // No password required for wallet signup
      }
    );

    // Clear any existing sessions before creating new one (safety measure)
    try {
      await sqlQuery(
        `DELETE FROM sessions WHERE user_id = :userId`,
        { userId }
      );
    } catch (err) {
      // Ignore errors - this is a new user, so no sessions should exist
    }

    // Create session
    const session = await createSessionForUser(userId);
    const response = NextResponse.json({ ok: true, userId, existing: false });
    setSessionCookie(response, session.token);
    return response;
  } catch (err: any) {
    console.error('Wallet signup error:', err);
    console.error('Error details:', {
      code: err?.code,
      message: err?.message,
      constraint: err?.constraint,
      stack: err?.stack,
    });
    
    // Duplicate wallet address or other constraint violation
    if (err?.code === '23505' || err?.code === 'ER_DUP_ENTRY') {
      const constraint = err?.constraint || '';
      const message = err?.message || '';
      
      if (constraint.includes('wallet_address') || message.includes('wallet_address')) {
        return NextResponse.json({ error: 'Wallet address already registered.' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Account creation failed due to duplicate data.' }, { status: 409 });
    }
    
    // Handle database connection errors
    if (err?.code === 'ECONNREFUSED' || err?.code === 'ENOTFOUND' || err?.code === 'ETIMEDOUT') {
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create account.',
        message: process.env.NODE_ENV === 'development' ? err?.message : undefined,
        details: process.env.NODE_ENV === 'development' ? {
          code: err?.code,
          constraint: err?.constraint,
        } : undefined
      },
      { status: 500 }
    );
  }
}

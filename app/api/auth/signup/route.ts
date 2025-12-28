import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { ensureForumSchema } from '@/lib/ensureForumSchema';
import { createSessionForUser, setSessionCookie } from '@/lib/auth';
import { isDbConfigured, sqlQuery } from '@/lib/db';
import { getPrivyUserFromRequest } from '@/lib/privy-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isValidUsername(username: unknown): username is string {
  if (typeof username !== 'string') return false;
  const trimmed = username.trim();
  if (trimmed.length < 3 || trimmed.length > 32) return false;
  return /^[a-zA-Z0-9_]+$/.test(trimmed);
}

function isValidEmail(email: unknown): email is string {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

function isValidWalletAddress(address: unknown): address is string {
  if (typeof address !== 'string') return false;
  // Basic Ethereum address validation (0x followed by 40 hex characters)
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
}

export async function POST(request: Request) {
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
    return NextResponse.json(
      { error: 'Authentication required. Please sign in with Privy.' },
      { status: 401 }
    );
  }

  // Get wallet address from Privy user
  // Privy user object structure may vary - try multiple approaches
  let walletAddress: string | null = null;
  
  // Try linkedAccounts first
  if ((privyUser as any).linkedAccounts) {
    const wallet = (privyUser as any).linkedAccounts.find(
      (account: any) => account.type === 'wallet' || account.walletClientType
    );
    if (wallet?.address) {
      walletAddress = wallet.address.toLowerCase();
    }
  }
  
  // Try wallet property directly
  if (!walletAddress && (privyUser as any).wallet) {
    walletAddress = (privyUser as any).wallet.address?.toLowerCase();
  }
  
  // Try wallets array
  if (!walletAddress && (privyUser as any).wallets && Array.isArray((privyUser as any).wallets)) {
    const wallet = (privyUser as any).wallets[0];
    if (wallet?.address) {
      walletAddress = wallet.address.toLowerCase();
    }
  }
  
  if (!walletAddress || !isValidWalletAddress(walletAddress)) {
    return NextResponse.json(
      { error: 'Wallet address is required. Please connect a wallet.' },
      { status: 400 }
    );
  }

  // Get email from Privy user (optional but preferred)
  let email: string | null = null;
  
  // Try linkedAccounts first
  if ((privyUser as any).linkedAccounts) {
    const emailAccount = (privyUser as any).linkedAccounts.find(
      (account: any) => account.type === 'email'
    );
    if (emailAccount?.address) {
      email = emailAccount.address;
    }
  }
  
  // Try email property directly
  if (!email && (privyUser as any).email) {
    email = (privyUser as any).email;
  }

  // Validate email if provided
  if (email && !isValidEmail(email)) {
    return NextResponse.json(
      { error: 'Invalid email format.' },
      { status: 400 }
    );
  }

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

  const privyUserId = (privyUser as any).userId || (privyUser as any).id;
  const id = uuidv4();

  // Check if user already exists with this Privy ID
  let existingUser: Array<{ id: string }> = [];
  let finalUserId = id;

  try {
    existingUser = await sqlQuery<Array<{ id: string }>>(
      `SELECT id FROM users WHERE privy_user_id = :privyUserId LIMIT 1`,
      { privyUserId }
    );

    if (existingUser.length > 0) {
      // User already exists, update their profile
      finalUserId = existingUser[0].id;
      await sqlQuery(
        `UPDATE users 
         SET username = :username, 
             avatar_url = COALESCE(:avatarUrl, avatar_url),
             email = COALESCE(:email, email),
             wallet_address = :walletAddress
         WHERE privy_user_id = :privyUserId`,
        { 
          privyUserId, 
          username: username.trim(), 
          avatarUrl,
          email,
          walletAddress
        }
      );
    } else {
      // Check for duplicate email
      if (email) {
        const emailCheck = await sqlQuery<Array<{ id: string }>>(
          `SELECT id FROM users WHERE email = :email LIMIT 1`,
          { email }
        );
        if (emailCheck.length > 0) {
          return NextResponse.json(
            { error: 'An account with this email already exists.' },
            { status: 409 }
          );
        }
      }

      // Check for duplicate wallet
      const walletCheck = await sqlQuery<Array<{ id: string }>>(
        `SELECT id FROM users WHERE wallet_address = :walletAddress LIMIT 1`,
        { walletAddress }
      );
      if (walletCheck.length > 0) {
        return NextResponse.json(
          { error: 'This wallet is already linked to another account.' },
          { status: 409 }
        );
      }

      // Create new user
      await sqlQuery(
        `INSERT INTO users (id, privy_user_id, email, wallet_address, username, avatar_url)
         VALUES (:id, :privyUserId, :email, :walletAddress, :username, :avatarUrl)`,
        { id, privyUserId, email, walletAddress, username: username.trim(), avatarUrl }
      );
    }
  } catch (err: any) {
    // Duplicate username or other constraint violation (PostgreSQL error code 23505)
    if (err?.code === '23505' || err?.code === 'ER_DUP_ENTRY') {
      const constraint = err?.constraint || '';
      const message = err?.message || '';
      
      if (constraint.includes('username') || message.includes('username')) {
        return NextResponse.json({ error: 'Username already taken.' }, { status: 409 });
      }
      if (constraint.includes('email') || message.includes('email')) {
        return NextResponse.json({ error: 'Email already taken.' }, { status: 409 });
      }
      if (constraint.includes('wallet_address') || message.includes('wallet_address')) {
        return NextResponse.json({ error: 'Wallet already linked to another account.' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Account creation failed due to duplicate data.' }, { status: 409 });
    }
    throw err;
  }

  // Create session for backward compatibility (optional, since we're using Privy)
  const session = await createSessionForUser(finalUserId);
  const response = NextResponse.json({ ok: true });
  setSessionCookie(response, session.token);
  return response;
}

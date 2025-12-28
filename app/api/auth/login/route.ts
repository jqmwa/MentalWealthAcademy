import { NextResponse } from 'next/server';
import { ensureForumSchema } from '@/lib/ensureForumSchema';
import { createSessionForUser, setSessionCookie } from '@/lib/auth';
import { isDbConfigured, sqlQuery } from '@/lib/db';
import { getPrivyUserFromRequest } from '@/lib/privy-auth';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isValidEmail(email: unknown): email is string {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

function isValidWalletAddress(address: unknown): address is string {
  if (typeof address !== 'string') return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
}

/**
 * Login/sync endpoint.
 * This endpoint is called after a user authenticates with Privy to:
 * 1. Verify the Privy token
 * 2. Create or update the user record in our database
 * 3. Create a session for backward compatibility
 */
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

  // Get email from Privy user (optional)
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

  const privyUserId = (privyUser as any).userId || (privyUser as any).id;

  try {
    // Check if user already exists
    const existingUser = await sqlQuery<Array<{ id: string; username: string }>>(
      `SELECT id, username FROM users WHERE privy_user_id = :privyUserId LIMIT 1`,
      { privyUserId }
    );

    let userId: string;

    if (existingUser.length > 0) {
      // User exists, update their wallet/email if needed
      userId = existingUser[0].id;
      await sqlQuery(
        `UPDATE users 
         SET email = COALESCE(:email, email),
             wallet_address = :walletAddress
         WHERE privy_user_id = :privyUserId`,
        { privyUserId, email, walletAddress }
      );
    } else {
      // Create new user with a temporary username (user can set it later)
      userId = uuidv4();
      const tempUsername = `user_${privyUserId.substring(0, 8)}`;
      
      // Check for duplicate email/wallet
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

      await sqlQuery(
        `INSERT INTO users (id, privy_user_id, email, wallet_address, username)
         VALUES (:id, :privyUserId, :email, :walletAddress, :username)`,
        { id: userId, privyUserId, email, walletAddress, username: tempUsername }
      );
    }

    // Create session for backward compatibility
    const session = await createSessionForUser(userId);
    const response = NextResponse.json({ ok: true, userId });
    setSessionCookie(response, session.token);
    return response;
  } catch (err: any) {
    // PostgreSQL error code 23505 for unique constraint violations
    if (err?.code === '23505' || err?.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Account creation failed due to duplicate data.' },
        { status: 409 }
      );
    }
    throw err;
  }
}


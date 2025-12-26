import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { sqlQuery } from './db';
import { getPrivyUserFromRequest } from './privy-auth';

const SESSION_COOKIE_NAME = 'mwa_session';
const SESSION_DAYS = 30;

export type CurrentUser = {
  id: string;
  username: string;
  avatarUrl: string | null;
  createdAt: string;
  email: string | null;
  walletAddress: string;
  shardCount: number;
};

export async function getSessionTokenFromCookies() {
  // Support both legacy and new session cookie names
  const cookieStore = await import('next/headers').then(m => m.cookies());
  return cookieStore.get('session_token')?.value || cookieStore.get(SESSION_COOKIE_NAME)?.value || null;
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function createSessionForUser(userId: string) {
  const sessionId = uuidv4();
  const token = uuidv4();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);

  await sqlQuery(
    `INSERT INTO sessions (id, user_id, token, expires_at)
     VALUES (:id, :userId, :token, :expiresAt)`,
    { id: sessionId, userId, token, expiresAt }
  );

  return { token, expiresAt };
}

/**
 * Gets the current user from the request, using Privy authentication.
 * Falls back to legacy session-based auth for backward compatibility.
 */
export async function getCurrentUserFromRequestCookie(): Promise<CurrentUser | null> {
  // First, try to get user from Privy token
  try {
    const privyUser = await getPrivyUserFromRequest();
    if (privyUser) {
      // Look up our internal user record by Privy user ID
      const rows = await sqlQuery<
        Array<{ 
          id: string; 
          username: string; 
          avatar_url: string | null; 
          created_at: string;
          email: string | null;
          wallet_address: string;
          shard_count: number;
        }>
      >(
        `SELECT u.id, u.username, u.avatar_url, u.created_at, u.email, u.wallet_address, u.shard_count
         FROM users u
         WHERE u.privy_user_id = :privyUserId
         LIMIT 1`,
        { privyUserId: (privyUser as any).userId || (privyUser as any).id }
      );

      const user = rows[0];
      if (user) {
        return { 
          id: user.id, 
          username: user.username, 
          avatarUrl: user.avatar_url, 
          createdAt: user.created_at,
          email: user.email,
          walletAddress: user.wallet_address,
          shardCount: user.shard_count,
        };
      }
    }
  } catch (error) {
    // If Privy auth fails, fall back to legacy session auth
    console.warn('Privy auth failed, falling back to session auth:', error);
  }

  // Fallback to session-based auth
  const token = await getSessionTokenFromCookies();
  if (!token) return null;

  const rows = await sqlQuery<
    Array<{ 
      id: string; 
      username: string; 
      avatar_url: string | null; 
      created_at: string;
      email: string | null;
      wallet_address: string;
      shard_count: number;
    }>
  >(
    `SELECT u.id, u.username, u.avatar_url, u.created_at, u.email, u.wallet_address, u.shard_count
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token = :token AND s.expires_at > NOW()
     LIMIT 1`,
    { token }
  );

  const user = rows[0];
  if (!user) return null;

  return { 
    id: user.id, 
    username: user.username, 
    avatarUrl: user.avatar_url, 
    createdAt: user.created_at,
    email: user.email,
    walletAddress: user.wallet_address,
    shardCount: user.shard_count,
  };
}

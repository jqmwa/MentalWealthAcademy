import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { sqlQuery } from './db';

const SESSION_COOKIE_NAME = 'mwa_session';
const SESSION_DAYS = 30;

export type CurrentUser = {
  id: string;
  username: string;
  avatarUrl: string | null;
  createdAt: string;
};

export function getSessionTokenFromCookies() {
  return cookies().get(SESSION_COOKIE_NAME)?.value || null;
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

export async function getCurrentUserFromRequestCookie(): Promise<CurrentUser | null> {
  const token = getSessionTokenFromCookies();
  if (!token) return null;

  const rows = await sqlQuery<
    Array<{ id: string; username: string; avatar_url: string | null; created_at: string }>
  >(
    `SELECT u.id, u.username, u.avatar_url, u.created_at
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token = :token AND s.expires_at > NOW()
     LIMIT 1`,
    { token }
  );

  const user = rows[0];
  if (!user) return null;

  return { id: user.id, username: user.username, avatarUrl: user.avatar_url, createdAt: user.created_at };
}

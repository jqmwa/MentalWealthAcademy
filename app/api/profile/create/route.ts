/**
 * POST /api/profile/create
 * 
 * Creates a new user profile during onboarding.
 * This is the primary entry point for new users.
 * 
 * Expected body:
 * {
 *   username: string (3-32 chars, alphanumeric + underscores)
 *   email?: string (optional, for email notifications)
 *   avatar_id: string (must be from assigned choices)
 * }
 */

import { NextResponse } from 'next/server';
import { ensureForumSchema } from '@/lib/ensureForumSchema';
import { isDbConfigured, sqlQuery } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';
import { isAvatarValidForUser, getAvatarByAvatarId, getAssignedAvatars } from '@/lib/avatars';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CreateProfileBody {
  username: string;
  email?: string;
  avatar_id: string;
  wallet_address?: string;
}

// Username validation regex: 3-32 chars, alphanumeric + underscores
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,32}$/;
// Email validation regex (basic)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  // Database check
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
    // Check if this is a database connection error
    if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND' || error?.code === 'ETIMEDOUT' || error?.message?.includes('connection')) {
      console.error('Database connection error:', error);
      
      // Extract troubleshooting info from error message if available
      const errorMessage = error?.message || 'Unknown connection error';
      const troubleshootingMatch = errorMessage.match(/Troubleshooting:\s*([\s\S]*?)(?:\n\nOriginal error|$)/);
      const troubleshooting = troubleshootingMatch ? troubleshootingMatch[1].trim() : null;
      
      return NextResponse.json(
        { 
          error: 'Database connection failed.',
          message: 'Unable to connect to the database. Please check your database configuration and ensure the server is running.',
          troubleshooting: process.env.NODE_ENV === 'development' && troubleshooting ? troubleshooting : undefined,
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: 503 }
      );
    }
    // Re-throw other errors
    throw error;
  }

  // Parse request body
  let body: CreateProfileBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 }
    );
  }

  const { username, email, avatar_id, wallet_address } = body;

  // Validate username
  if (!username || !USERNAME_REGEX.test(username)) {
    return NextResponse.json(
      { 
        error: 'Invalid username.',
        message: 'Username must be 3-32 characters and contain only letters, numbers, and underscores.'
      },
      { status: 400 }
    );
  }

  // Validate email if provided
  if (email && !EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { error: 'Invalid email format.' },
      { status: 400 }
    );
  }

  // Validate avatar_id format
  if (!avatar_id || typeof avatar_id !== 'string') {
    return NextResponse.json(
      { error: 'avatar_id is required.' },
      { status: 400 }
    );
  }

  try {
    // Generate new user ID
    const userId = uuidv4();
    
    // Generate a temporary privy_user_id for non-Privy users
    // This allows the profile system to work independently
    const privyUserId = `profile_${userId}`;
    
    // Use provided wallet address or generate a placeholder
    const walletAddr = wallet_address || `0x${uuidv4().replace(/-/g, '').slice(0, 40)}`;

    // Validate avatar is in assigned choices for this user
    // We use the new userId as the seed
    if (!isAvatarValidForUser(userId, avatar_id)) {
      // Since this is a new user, we need to get their choices based on the new ID
      // and check if the avatar is valid
      const assignedAvatars = getAssignedAvatars(userId);
      const validIds = assignedAvatars.map(a => a.id);
      
      return NextResponse.json(
        { 
          error: 'Invalid avatar selection.',
          message: 'Please select from your assigned avatar choices.',
          validChoices: validIds
        },
        { status: 400 }
      );
    }

    // Get the full avatar object
    const avatar = getAvatarByAvatarId(avatar_id);
    if (!avatar) {
      return NextResponse.json(
        { error: 'Avatar not found.' },
        { status: 404 }
      );
    }

    // Check if username is already taken
    const existingUsername = await sqlQuery<Array<{ id: string }>>(
      `SELECT id FROM users WHERE username = :username LIMIT 1`,
      { username }
    );

    if (existingUsername.length > 0) {
      return NextResponse.json(
        { 
          error: 'Username already taken.',
          message: 'Please choose a different username.'
        },
        { status: 409 }
      );
    }

    // Check if email is already taken (if provided)
    if (email) {
      const existingEmail = await sqlQuery<Array<{ id: string }>>(
        `SELECT id FROM users WHERE email = :email LIMIT 1`,
        { email }
      );

      if (existingEmail.length > 0) {
        return NextResponse.json(
          { 
            error: 'Email already registered.',
            message: 'Please use a different email or sign in to your existing account.'
          },
          { status: 409 }
        );
      }
    }

    // Create the user profile with welcome shards
    const WELCOME_SHARDS = 10;
    await sqlQuery(
      `INSERT INTO users (id, privy_user_id, email, wallet_address, username, avatar_url, shard_count)
       VALUES (:id, :privyUserId, :email, :walletAddress, :username, :avatarUrl, :shardCount)`,
      {
        id: userId,
        privyUserId,
        email: email || null,
        walletAddress: walletAddr,
        username,
        avatarUrl: avatar.image_url,
        shardCount: WELCOME_SHARDS,
      }
    );

    // Create a session for the new user
    const sessionToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 day session

    await sqlQuery(
      `INSERT INTO sessions (id, user_id, token, expires_at)
       VALUES (:id, :userId, :token, :expiresAt)`,
      {
        id: uuidv4(),
        userId,
        token: sessionToken,
        expiresAt,
      }
    );

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    });

    return NextResponse.json({
      ok: true,
      message: 'Profile created successfully!',
      user: {
        id: userId,
        username,
        email: email || null,
        avatarUrl: avatar.image_url,
        shardCount: WELCOME_SHARDS,
      }
    });
  } catch (error: any) {
    console.error('Error creating profile:', error);
    
    // Handle duplicate key errors
    if (error?.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Username or email already exists.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create profile.' },
      { status: 500 }
    );
  }
}


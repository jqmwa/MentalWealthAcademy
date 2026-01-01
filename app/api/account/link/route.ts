import { NextResponse } from 'next/server';
import { ensureForumSchema } from '@/lib/ensureForumSchema';
import { getCurrentUserFromRequestCookie } from '@/lib/auth';
import { getWalletAddressFromRequest } from '@/lib/wallet-auth';
import { isDbConfigured, sqlQuery } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/account/link
 * Links a blockchain account (wallet) to the user's profile
 * 
 * Wallet address is extracted from Authorization header
 */
export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: 'Database is not configured on the server.' },
      { status: 503 }
    );
  }
  await ensureForumSchema();

  // Get wallet address from Authorization header
  const walletAddress = await getWalletAddressFromRequest();
  if (!walletAddress) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }

  // Get our internal user record
  const user = await getCurrentUserFromRequestCookie();
  if (!user) {
    return NextResponse.json({ error: 'User account not found. Please complete signup.' }, { status: 404 });
  }

  try {

    // Validate wallet address format (basic Ethereum address validation)
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format.' },
        { status: 400 }
      );
    }

    // Check if this wallet is already linked to another user
    const existingWallet = await sqlQuery<Array<{ id: string; username: string }>>(
      `SELECT id, username FROM users 
       WHERE wallet_address = :walletAddress AND id != :userId 
       LIMIT 1`,
      { walletAddress, userId: user.id }
    );

    if (existingWallet.length > 0) {
      return NextResponse.json(
        { error: 'This account is already linked to another user.' },
        { status: 409 }
      );
    }

    // Update user record with wallet address
    await sqlQuery(
      `UPDATE users 
       SET wallet_address = :walletAddress,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = :userId`,
      { 
        walletAddress, 
        userId: user.id 
      }
    );

    // Log account linking event
    const eventId = uuidv4();
    await sqlQuery(
      `INSERT INTO account_linking_events (id, user_id, wallet_address, action)
       VALUES (:id, :userId, :walletAddress, 'linked')`,
      { 
        id: eventId, 
        userId: user.id, 
        walletAddress 
      }
    );

    return NextResponse.json({
      ok: true,
      walletAddress,
      message: 'Account linked successfully.',
    });
  } catch (err: any) {
    console.error('Error linking account:', err);
    return NextResponse.json(
      { error: 'Failed to link account.' },
      { status: 500 }
    );
  }
}


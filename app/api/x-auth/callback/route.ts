import { NextResponse } from 'next/server';
import { ensureForumSchema } from '@/lib/ensureForumSchema';
import { isDbConfigured, sqlQuery } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { createHmac } from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function generateOAuthSignature(method: string, url: string, params: Record<string, string>, consumerSecret: string, tokenSecret: string = ''): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');

  const signatureBaseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  
  return createHmac('sha1', signingKey)
    .update(signatureBaseString)
    .digest('base64');
}

export async function GET(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.redirect(new URL('/?error=db_not_configured', request.url));
  }
  await ensureForumSchema();

  const { searchParams } = new URL(request.url);
  const oauthToken = searchParams.get('oauth_token');
  const oauthVerifier = searchParams.get('oauth_verifier');
  const state = searchParams.get('state');
  const denied = searchParams.get('denied');

  if (denied) {
    return NextResponse.redirect(new URL('/home?x_auth=denied', request.url));
  }

  if (!oauthToken || !oauthVerifier || !state) {
    return NextResponse.redirect(new URL('/home?x_auth=error', request.url));
  }

  const xApiKey = process.env.X_API_KEY;
  const xSecret = process.env.X_SECRET;

  if (!xApiKey || !xSecret) {
    return NextResponse.redirect(new URL('/home?x_auth=error', request.url));
  }

  try {
    // Verify state token
    const stateRows = await sqlQuery<Array<{
      id: string;
      user_id: string;
      oauth_token: string;
      oauth_token_secret: string;
      expires_at: Date;
    }>>(
      `SELECT id, user_id, oauth_token, oauth_token_secret, expires_at
       FROM x_oauth_states
       WHERE state_token = :state AND expires_at > NOW()
       LIMIT 1`,
      { state }
    );

    if (stateRows.length === 0) {
      return NextResponse.redirect(new URL('/home?x_auth=expired', request.url));
    }

    const stateData = stateRows[0];
    if (stateData.oauth_token !== oauthToken) {
      return NextResponse.redirect(new URL('/home?x_auth=error', request.url));
    }

    // Exchange for access token
    const accessTokenUrl = 'https://api.x.com/oauth/access_token';
    
    const oauthParams: Record<string, string> = {
      oauth_consumer_key: xApiKey,
      oauth_token: oauthToken,
      oauth_verifier: oauthVerifier,
      oauth_nonce: crypto.randomBytes(16).toString('hex'),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_version: '1.0',
    };

    oauthParams.oauth_signature = generateOAuthSignature('POST', accessTokenUrl, oauthParams, xSecret, stateData.oauth_token_secret);

    const authHeader = `OAuth ${Object.keys(oauthParams)
      .sort()
      .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
      .join(', ')}`;

    const response = await fetch(accessTokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('X OAuth access token error:', text);
      return NextResponse.redirect(new URL('/home?x_auth=error', request.url));
    }

    const responseText = await response.text();
    const params = new URLSearchParams(responseText);
    const accessToken = params.get('oauth_token');
    const accessTokenSecret = params.get('oauth_token_secret');
    const xUserId = params.get('user_id');
    const xUsername = params.get('screen_name');

    if (!accessToken || !accessTokenSecret || !xUserId || !xUsername) {
      return NextResponse.redirect(new URL('/home?x_auth=error', request.url));
    }

    // Get user info from X API
    const userInfoUrl = 'https://api.x.com/1.1/account/verify_credentials.json';
    const userInfoParams: Record<string, string> = {
      oauth_consumer_key: xApiKey,
      oauth_token: accessToken,
      oauth_nonce: crypto.randomBytes(16).toString('hex'),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_version: '1.0',
    };

    userInfoParams.oauth_signature = generateOAuthSignature('GET', userInfoUrl, userInfoParams, xSecret, accessTokenSecret);

    const userInfoAuthHeader = `OAuth ${Object.keys(userInfoParams)
      .sort()
      .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(userInfoParams[key])}"`)
      .join(', ')}`;

    const userInfoResponse = await fetch(userInfoUrl, {
      method: 'GET',
      headers: {
        'Authorization': userInfoAuthHeader,
      },
    });

    // Store X account
    await sqlQuery(
      `INSERT INTO x_accounts (id, user_id, x_user_id, x_username, access_token, access_token_secret)
       VALUES (:id, :userId, :xUserId, :xUsername, :accessToken, :accessTokenSecret)
       ON CONFLICT (user_id) DO UPDATE SET
         x_username = EXCLUDED.x_username,
         access_token = EXCLUDED.access_token,
         access_token_secret = EXCLUDED.access_token_secret,
         updated_at = CURRENT_TIMESTAMP`,
      {
        id: uuidv4(),
        userId: stateData.user_id,
        xUserId,
        xUsername,
        accessToken,
        accessTokenSecret,
      }
    );

    // Clean up state token
    await sqlQuery(
      `DELETE FROM x_oauth_states WHERE id = :id`,
      { id: stateData.id }
    );

    // Redirect with auto_check flag - client will handle the check
    return NextResponse.redirect(new URL('/home?x_auth=success&auto_check=true', request.url));
  } catch (error: any) {
    console.error('X OAuth callback error:', error);
    return NextResponse.redirect(new URL('/home?x_auth=error', request.url));
  }
}


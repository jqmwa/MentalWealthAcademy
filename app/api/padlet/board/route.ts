import { NextRequest, NextResponse } from 'next/server';

const PADLET_API_KEY = process.env.PADLET_API;
const BOARD_ID = 'nru8fi4l8r3tf6f3';

export async function GET(request: NextRequest) {
  try {
    if (!PADLET_API_KEY) {
      return NextResponse.json(
        { error: 'Padlet API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.padlet.dev/v1/boards/${BOARD_ID}?include=posts,sections`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PADLET_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Padlet API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch board data', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching Padlet board:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

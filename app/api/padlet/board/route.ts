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
      `https://api.padlet.dev/v1/boards/${BOARD_ID}?include=posts%2Csections`,
      {
        method: 'GET',
        headers: {
          'X-Api-Key': PADLET_API_KEY,
          'accept': 'application/vnd.api+json',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch board data' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

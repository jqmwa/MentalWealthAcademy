import { NextResponse } from 'next/server';
import { elizaAPI } from '@/lib/eliza-api';
import azuraPersonality from '@/lib/Azurapersonality.json';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { proposalId, proposalTitle, proposalContent } = body;

    if (!proposalId || !proposalTitle || !proposalContent) {
      return NextResponse.json(
        { error: 'Missing required fields: proposalId, proposalTitle, proposalContent' },
        { status: 400 }
      );
    }

    // Generate Azura's voice response
    const { text, audioUrl } = await elizaAPI.generateProposalVoiceResponse(
      proposalTitle,
      proposalContent,
      azuraPersonality
    );

    // audioUrl is a base64 data URL, return it directly
    return NextResponse.json({
      ok: true,
      text,
      audioUrl, // Base64 data URL ready for client-side use
      proposalId,
    });
  } catch (error) {
    console.error('Error generating voice:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate voice',
      },
      { status: 500 }
    );
  }
}

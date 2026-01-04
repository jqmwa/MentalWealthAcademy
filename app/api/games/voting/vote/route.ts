import { NextResponse } from 'next/server';
import { sqlQuery } from '@/lib/db';
import { getCurrentUserFromRequestCookie } from '@/lib/auth';
import { isDbConfigured } from '@/lib/db';
import { ensureVotingGameSchema } from '@/lib/ensureVotingGameSchema';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const user = await getCurrentUserFromRequestCookie();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureVotingGameSchema();
    
    const body = await request.json();
    const { submissionId } = body;

    if (!submissionId || typeof submissionId !== 'string') {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
    }

    // Get the current active game
    const games = await sqlQuery<Array<{
      id: string;
      state: string;
      voting_deadline: string | null;
    }>>(
      `SELECT id, state, voting_deadline
       FROM voting_games
       WHERE state = 'voting'
       ORDER BY created_at DESC
       LIMIT 1`
    );

    if (games.length === 0) {
      return NextResponse.json({ error: 'No active voting game found' }, { status: 404 });
    }

    const game = games[0];

    // Check if voting deadline has passed
    if (game.voting_deadline) {
      const votingDeadline = new Date(game.voting_deadline);
      const now = new Date();
      if (now >= votingDeadline) {
        return NextResponse.json({ error: 'Voting deadline has passed' }, { status: 400 });
      }
    }

    // Verify submission exists and belongs to this game
    const submissions = await sqlQuery<Array<{ id: string }>>(
      `SELECT id FROM game_submissions 
       WHERE id = :submissionId AND game_id = :gameId`,
      { submissionId, gameId: game.id }
    );

    if (submissions.length === 0) {
      return NextResponse.json({ error: 'Invalid submission' }, { status: 400 });
    }

    // Check if user already voted
    const existingVotes = await sqlQuery<Array<{ id: string }>>(
      `SELECT id FROM game_votes WHERE game_id = :gameId AND user_id = :userId`,
      { gameId: game.id, userId: user.id }
    );

    if (existingVotes.length > 0) {
      return NextResponse.json({ error: 'You have already voted' }, { status: 400 });
    }

    // Insert vote
    await sqlQuery(
      `INSERT INTO game_votes (game_id, submission_id, user_id)
       VALUES (:gameId, :submissionId, :userId)`,
      { gameId: game.id, submissionId, userId: user.id }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error voting:', error);
    // Check if it's a unique constraint violation (already voted)
    if (error.message?.includes('unique') || error.message?.includes('duplicate')) {
      return NextResponse.json({ error: 'You have already voted' }, { status: 400 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to vote' },
      { status: 500 }
    );
  }
}

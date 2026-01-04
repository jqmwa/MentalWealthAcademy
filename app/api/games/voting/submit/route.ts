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
    const { imageUrl } = body;

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    // Get the current active game
    const games = await sqlQuery<Array<{
      id: string;
      state: string;
      submission_deadline: string;
    }>>(
      `SELECT id, state, submission_deadline
       FROM voting_games
       WHERE state = 'submission'
       ORDER BY created_at DESC
       LIMIT 1`
    );

    if (games.length === 0) {
      return NextResponse.json({ error: 'No active submission game found' }, { status: 404 });
    }

    const game = games[0];

    // Check if submission deadline has passed
    const submissionDeadline = new Date(game.submission_deadline);
    const now = new Date();
    if (now >= submissionDeadline) {
      return NextResponse.json({ error: 'Submission deadline has passed' }, { status: 400 });
    }

    // Check if user already submitted
    const existingSubmissions = await sqlQuery<Array<{ id: string }>>(
      `SELECT id FROM game_submissions WHERE game_id = :gameId AND user_id = :userId`,
      { gameId: game.id, userId: user.id }
    );

    if (existingSubmissions.length > 0) {
      return NextResponse.json({ error: 'You have already submitted for this game' }, { status: 400 });
    }

    // Check if game is full (5 submissions)
    const submissionCount = await sqlQuery<Array<{ count: string }>>(
      `SELECT COUNT(*) as count FROM game_submissions WHERE game_id = :gameId`,
      { gameId: game.id }
    );

    const count = parseInt(submissionCount[0].count, 10);
    if (count >= 5) {
      return NextResponse.json({ error: 'Game is full (5 submissions)' }, { status: 400 });
    }

    // Insert submission
    await sqlQuery(
      `INSERT INTO game_submissions (game_id, user_id, image_url)
       VALUES (:gameId, :userId, :imageUrl)`,
      { gameId: game.id, userId: user.id, imageUrl }
    );

    // Check if we now have 5 submissions - if so, transition to voting immediately
    if (count + 1 === 5) {
      const votingDeadline = new Date();
      votingDeadline.setHours(votingDeadline.getHours() + 24);
      
      await sqlQuery(
        `UPDATE voting_games 
         SET state = 'voting', voting_deadline = :votingDeadline
         WHERE id = :gameId`,
        { votingDeadline: votingDeadline.toISOString(), gameId: game.id }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error submitting image:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit image' },
      { status: 500 }
    );
  }
}

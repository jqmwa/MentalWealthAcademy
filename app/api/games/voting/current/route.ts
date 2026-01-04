import { NextResponse } from 'next/server';
import { sqlQuery } from '@/lib/db';
import { getCurrentUserFromRequestCookie } from '@/lib/auth';
import { isDbConfigured } from '@/lib/db';
import { ensureVotingGameSchema } from '@/lib/ensureVotingGameSchema';

export const dynamic = 'force-dynamic';

// Get or create the current active game
export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    await ensureVotingGameSchema();
    
    // Get the current game (most recent one that's not finished)
    const games = await sqlQuery<Array<{
      id: string;
      state: string;
      submission_deadline: string;
      voting_deadline: string | null;
      created_at: string;
    }>>(
      `SELECT id, state, submission_deadline, voting_deadline, created_at
       FROM voting_games
       WHERE state != 'finished'
       ORDER BY created_at DESC
       LIMIT 1`
    );

    let game = games[0];

    // If no active game exists, create a new one (submission phase, 24 hours)
    if (!game) {
      const deadline = new Date();
      deadline.setHours(deadline.getHours() + 24); // 24 hours from now

      const newGame = await sqlQuery<Array<{
        id: string;
        state: string;
        submission_deadline: string;
        voting_deadline: string | null;
        created_at: string;
      }>>(
        `INSERT INTO voting_games (state, submission_deadline)
         VALUES ('submission', :deadline)
         RETURNING id, state, submission_deadline, voting_deadline, created_at`,
        { deadline: deadline.toISOString() }
      );
      game = newGame[0];
    }

    // Check if submission deadline has passed - transition to voting
    const submissionDeadline = new Date(game.submission_deadline);
    const now = new Date();
    
    if (game.state === 'submission' && now >= submissionDeadline) {
      // Check if we have at least 2 submissions (minimum for a game)
      const submissionCount = await sqlQuery<Array<{ count: string }>>(
        `SELECT COUNT(*) as count FROM game_submissions WHERE game_id = :gameId`,
        { gameId: game.id }
      );
      
      const count = parseInt(submissionCount[0].count, 10);
      if (count >= 2) {
        // Transition to voting phase (24 hours)
        const votingDeadline = new Date();
        votingDeadline.setHours(votingDeadline.getHours() + 24);
        
        await sqlQuery(
          `UPDATE voting_games 
           SET state = 'voting', voting_deadline = :votingDeadline
           WHERE id = :gameId`,
          { votingDeadline: votingDeadline.toISOString(), gameId: game.id }
        );
        game.state = 'voting';
        game.voting_deadline = votingDeadline.toISOString();
      } else {
        // Not enough submissions, mark as finished
        await sqlQuery(
          `UPDATE voting_games SET state = 'finished' WHERE id = :gameId`,
          { gameId: game.id }
        );
        game.state = 'finished';
        // Return null to indicate we should create a new game
        return NextResponse.json({ game: null });
      }
    }

    // Check if voting deadline has passed - transition to revealed
    if (game.state === 'voting' && game.voting_deadline) {
      const votingDeadline = new Date(game.voting_deadline);
      if (now >= votingDeadline) {
        await sqlQuery(
          `UPDATE voting_games SET state = 'revealed' WHERE id = :gameId`,
          { gameId: game.id }
        );
        game.state = 'revealed';
        
        // Add Azura's votes if not already added
        const azuraVotes = await sqlQuery<Array<{ id: string }>>(
          `SELECT id FROM azura_votes WHERE game_id = :gameId`,
          { gameId: game.id }
        );
        
        if (azuraVotes.length === 0) {
          // Get all submissions with vote counts
          const submissions = await sqlQuery<Array<{
            id: string;
            vote_count: string;
          }>>(
            `SELECT gs.id, COUNT(gv.id) as vote_count
             FROM game_submissions gs
             LEFT JOIN game_votes gv ON gs.id = gv.submission_id
             WHERE gs.game_id = :gameId
             GROUP BY gs.id
             ORDER BY vote_count DESC, gs.created_at ASC
             LIMIT 1`,
            { gameId: game.id }
          );
          
          if (submissions.length > 0) {
            // Azura votes for the currently leading submission (or first if tie)
            await sqlQuery(
              `INSERT INTO azura_votes (game_id, submission_id, vote_count)
               VALUES (:gameId, :submissionId, 2)`,
              { gameId: game.id, submissionId: submissions[0].id }
            );
          }
        }
      }
    }

    // Get submissions for this game
    const submissions = await sqlQuery<Array<{
      id: string;
      user_id: string;
      image_url: string;
      username: string;
      avatar_url: string | null;
      created_at: string;
    }>>(
      `SELECT gs.id, gs.user_id, gs.image_url, gs.created_at,
              u.username, u.avatar_url
       FROM game_submissions gs
       JOIN users u ON gs.user_id = u.id
       WHERE gs.game_id = :gameId
       ORDER BY gs.created_at ASC`,
      { gameId: game.id }
    );

    // Get vote counts for each submission (only if revealed)
    const user = await getCurrentUserFromRequestCookie();
    let voteCounts: Record<string, number> = {};
    let userVote: string | null = null;
    let azuraVote: string | null = null;

    if (game.state === 'revealed' || game.state === 'finished') {
      const votes = await sqlQuery<Array<{
        submission_id: string;
        count: string;
      }>>(
        `SELECT submission_id, COUNT(*) as count
         FROM game_votes
         WHERE game_id = :gameId
         GROUP BY submission_id`,
        { gameId: game.id }
      );

      votes.forEach(v => {
        voteCounts[v.submission_id] = parseInt(v.count, 10);
      });

      // Add Azura's votes
      const azuraVotes = await sqlQuery<Array<{
        submission_id: string;
        vote_count: number;
      }>>(
        `SELECT submission_id, vote_count FROM azura_votes WHERE game_id = :gameId`,
        { gameId: game.id }
      );

      if (azuraVotes.length > 0) {
        azuraVote = azuraVotes[0].submission_id;
        voteCounts[azuraVotes[0].submission_id] = (voteCounts[azuraVotes[0].submission_id] || 0) + azuraVotes[0].vote_count;
      }

      // Get user's vote if logged in
      if (user) {
        const userVotes = await sqlQuery<Array<{ submission_id: string }>>(
          `SELECT submission_id FROM game_votes 
           WHERE game_id = :gameId AND user_id = :userId`,
          { gameId: game.id, userId: user.id }
        );
        if (userVotes.length > 0) {
          userVote = userVotes[0].submission_id;
        }
      }
    }

    // Mask submissions if not revealed yet
    const maskedSubmissions = submissions.map((sub, index) => {
      if (game.state === 'submission' || game.state === 'voting') {
        // Show user's own submission, but mask others
        if (user && sub.user_id === user.id) {
          return {
            ...sub,
            isRevealed: true,
            voteCount: voteCounts[sub.id] || 0,
          };
        }
        return {
          id: sub.id,
          user_id: sub.user_id,
          image_url: null, // Masked
          username: sub.username, // Show actual username
          avatar_url: null,
          created_at: sub.created_at,
          isRevealed: false,
          voteCount: 0,
        };
      }
      return {
        ...sub,
        isRevealed: true,
        voteCount: voteCounts[sub.id] || 0,
      };
    });

    return NextResponse.json({
      game: {
        id: game.id,
        state: game.state,
        submissionDeadline: game.submission_deadline,
        votingDeadline: game.voting_deadline,
        createdAt: game.created_at,
        submissions: maskedSubmissions,
        userVote,
        azuraVote,
        userHasSubmitted: user ? submissions.some(s => s.user_id === user.id) : false,
      },
    });
  } catch (error: any) {
    console.error('Error fetching current game:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch current game' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { isDbConfigured, sqlQuery } from '@/lib/db';
import { ensureProposalSchema } from '@/lib/ensureProposalSchema';

interface ProposalWithReview {
  id: string;
  user_id: string;
  wallet_address: string;
  title: string;
  proposal_markdown: string;
  status: string;
  created_at: string;
  updated_at: string;
  username: string | null;
  avatar_url: string | null;
  review_decision: string | null;
  review_reasoning: string | null;
  review_token_allocation: number | null;
  review_scores: string | null;
  review_reviewed_at: string | null;
}

export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured.' },
      { status: 503 }
    );
  }

  await ensureProposalSchema();

  try {
    // Fetch all proposals with their reviews and user info
    const proposals = await sqlQuery<ProposalWithReview[]>(
      `SELECT 
        p.id,
        p.user_id,
        p.wallet_address,
        p.title,
        p.proposal_markdown,
        p.status,
        p.created_at,
        p.updated_at,
        u.username,
        u.avatar_url,
        pr.decision as review_decision,
        pr.reasoning as review_reasoning,
        pr.token_allocation_percentage as review_token_allocation,
        pr.scores as review_scores,
        pr.reviewed_at as review_reviewed_at
       FROM proposals p
       LEFT JOIN users u ON p.user_id = u.id
       LEFT JOIN proposal_reviews pr ON p.id = pr.proposal_id
       ORDER BY p.created_at DESC`
    );

    // Format the response
    const formattedProposals = proposals.map(p => ({
      id: p.id,
      userId: p.user_id,
      walletAddress: p.wallet_address,
      title: p.title,
      proposalMarkdown: p.proposal_markdown,
      status: p.status,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      user: {
        username: p.username,
        avatarUrl: p.avatar_url,
      },
      review: p.review_decision ? {
        decision: p.review_decision,
        reasoning: p.review_reasoning,
        tokenAllocation: p.review_token_allocation,
        scores: p.review_scores ? JSON.parse(p.review_scores) : null,
        reviewedAt: p.review_reviewed_at,
      } : null,
    }));

    return NextResponse.json({
      ok: true,
      proposals: formattedProposals,
    });
  } catch (error) {
    console.error('Error fetching proposals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch proposals.' },
      { status: 500 }
    );
  }
}

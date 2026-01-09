import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { isDbConfigured, sqlQuery } from '@/lib/db';
import { ensureProposalSchema } from '@/lib/ensureProposalSchema';

interface AzuraScores {
  clarity: number;
  impact: number;
  feasibility: number;
  budget: number;
  ingenuity: number;
  chaos: number;
}

interface ProposalData {
  id: string;
  title: string;
  proposal_markdown: string;
  wallet_address: string;
}

export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured.' },
      { status: 503 }
    );
  }

  await ensureProposalSchema();

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { proposalId } = body;

  if (!proposalId || typeof proposalId !== 'string') {
    return NextResponse.json(
      { error: 'Proposal ID is required.' },
      { status: 400 }
    );
  }

  // Fetch proposal
  let proposal: ProposalData;
  try {
    const proposals = await sqlQuery<ProposalData[]>(
      `SELECT id, title, proposal_markdown, wallet_address 
       FROM proposals 
       WHERE id = :proposalId AND status = 'pending_review' 
       LIMIT 1`,
      { proposalId }
    );

    if (proposals.length === 0) {
      return NextResponse.json(
        { error: 'Proposal not found or already reviewed.' },
        { status: 404 }
      );
    }

    proposal = proposals[0];
  } catch (error) {
    console.error('Error fetching proposal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch proposal.' },
      { status: 500 }
    );
  }

  // Check for DeepSeek API key
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'DEEPSEEK_API_KEY not configured.' },
      { status: 501 }
    );
  }

  // Call Azura (DeepSeek) for analysis
  try {
    const systemPrompt = `You are Azura, an AI agent for Mental Wealth Academy. Your role is to review funding proposals and evaluate them fairly.

Analyze the proposal based on these criteria (score 0-10 each):
1. CLARITY: How clear, well-written, and understandable is the proposal?
2. IMPACT: What is the potential positive impact on the mental health community?
3. FEASIBILITY: How realistic and achievable is this proposal?
4. BUDGET: Is the budget reasonable, justified, and well-explained?
5. INGENUITY: How creative, innovative, or unique is this idea?
6. CHAOS: A randomness factor - add some unpredictability to your scoring

Based on the total score (out of 60):
- Score >= 25: APPROVE with token allocation (1-40% based on score strength)
- Score < 25: REJECT

Respond in JSON format:
{
  "decision": "approved" or "rejected",
  "scores": {
    "clarity": 0-10,
    "impact": 0-10,
    "feasibility": 0-10,
    "budget": 0-10,
    "ingenuity": 0-10,
    "chaos": 0-10
  },
  "tokenAllocation": 1-40 (only if approved, null if rejected),
  "reasoning": "One to two sentences explaining your decision concisely."
}`;

    const userPrompt = `Review this proposal:

**Title:** ${proposal.title}

**Proposal:**
${proposal.proposal_markdown}

**Wallet Address:** ${proposal.wallet_address}`;

    const deepseekResponse = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        max_tokens: 1000,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    const deepseekData = await deepseekResponse.json();

    if (!deepseekResponse.ok) {
      throw new Error(deepseekData?.error?.message || 'DeepSeek request failed.');
    }

    const responseText = deepseekData?.choices?.[0]?.message?.content || '';
    
    // Parse JSON response from Azura
    let azuraResponse;
    try {
      // Try to extract JSON from response (might be wrapped in markdown code blocks)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        azuraResponse = JSON.parse(jsonMatch[0]);
      } else {
        azuraResponse = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('Failed to parse Azura response:', responseText);
      throw new Error('Invalid response format from Azura.');
    }

    const { decision, scores, tokenAllocation, reasoning } = azuraResponse;

    // Validate response
    if (!decision || !['approved', 'rejected'].includes(decision)) {
      throw new Error('Invalid decision from Azura.');
    }

    if (!scores || typeof scores !== 'object') {
      throw new Error('Invalid scores from Azura.');
    }

    if (!reasoning || typeof reasoning !== 'string') {
      throw new Error('Invalid reasoning from Azura.');
    }

    // Store review
    const reviewId = uuidv4();
    await sqlQuery(
      `INSERT INTO proposal_reviews (id, proposal_id, decision, reasoning, token_allocation_percentage, scores)
       VALUES (:id, :proposalId, :decision, :reasoning, :tokenAllocation, :scores)`,
      {
        id: reviewId,
        proposalId: proposal.id,
        decision,
        reasoning: reasoning.trim(),
        tokenAllocation: decision === 'approved' ? tokenAllocation : null,
        scores: JSON.stringify(scores),
      }
    );

    // Update proposal status
    const newStatus = decision === 'approved' ? 'approved' : 'rejected';
    await sqlQuery(
      `UPDATE proposals SET status = :status WHERE id = :proposalId`,
      { status: newStatus, proposalId: proposal.id }
    );

    return NextResponse.json({
      ok: true,
      decision,
      reasoning,
      tokenAllocation: decision === 'approved' ? tokenAllocation : null,
      scores,
    });
  } catch (error: any) {
    console.error('Error in Azura review:', error);
    
    // If review fails, don't leave proposal in limbo
    try {
      await sqlQuery(
        `UPDATE proposals SET status = 'rejected' WHERE id = :proposalId`,
        { proposalId: proposal.id }
      );
      
      // Create a failed review record
      const reviewId = uuidv4();
      await sqlQuery(
        `INSERT INTO proposal_reviews (id, proposal_id, decision, reasoning, token_allocation_percentage, scores)
         VALUES (:id, :proposalId, 'rejected', :reasoning, NULL, :scores)`,
        {
          id: reviewId,
          proposalId: proposal.id,
          reasoning: 'Review failed due to system error. Please resubmit.',
          scores: JSON.stringify({ clarity: 0, impact: 0, feasibility: 0, budget: 0, ingenuity: 0, chaos: 0 }),
        }
      );
    } catch (cleanupError) {
      console.error('Failed to cleanup after review error:', cleanupError);
    }

    return NextResponse.json(
      { error: error.message || 'Failed to review proposal.' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { isDbConfigured, sqlQuery } from '@/lib/db';
import { ensureProposalSchema } from '@/lib/ensureProposalSchema';
import { getUserFromRequest } from '@/lib/auth';
import { providers, Contract } from 'ethers';
import { AZURA_KILLSTREAK_ABI } from '@/lib/azura-contract';

export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured.' },
      { status: 503 }
    );
  }

  await ensureProposalSchema();

  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { title, proposalMarkdown, walletAddress, recipientAddress, tokenAmount, onChainProposalId, onChainTxHash } = body;

  // Validation
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
  }

  if (title.trim().length > 120) {
    return NextResponse.json(
      { error: 'Title must be 120 characters or less.' },
      { status: 400 }
    );
  }

  if (!proposalMarkdown || typeof proposalMarkdown !== 'string' || proposalMarkdown.trim().length === 0) {
    return NextResponse.json(
      { error: 'Proposal content is required.' },
      { status: 400 }
    );
  }

  // SECURITY: Limit proposal content length
  if (proposalMarkdown.trim().length > 20000) {
    return NextResponse.json(
      { error: 'Proposal content must be 20,000 characters or less.' },
      { status: 400 }
    );
  }

  if (!walletAddress || typeof walletAddress !== 'string') {
    return NextResponse.json(
      { error: 'Wallet address is required.' },
      { status: 400 }
    );
  }

  if (!recipientAddress || typeof recipientAddress !== 'string' || recipientAddress.trim().length === 0) {
    return NextResponse.json(
      { error: 'Recipient wallet address is required.' },
      { status: 400 }
    );
  }

  // Validate recipient address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(recipientAddress.trim())) {
    return NextResponse.json(
      { error: 'Invalid recipient wallet address format. Must be a valid Ethereum address (0x followed by 40 hexadecimal characters).' },
      { status: 400 }
    );
  }

  if (!tokenAmount || typeof tokenAmount !== 'string' || tokenAmount.trim().length === 0) {
    return NextResponse.json(
      { error: 'Token amount is required.' },
      { status: 400 }
    );
  }

  // Validate token amount
  const tokenAmountNum = parseFloat(tokenAmount.trim());
  if (isNaN(tokenAmountNum) || tokenAmountNum <= 0) {
    return NextResponse.json(
      { error: 'Token amount must be a positive number.' },
      { status: 400 }
    );
  }

  // Validate on-chain proposal ID and transaction hash (REQUIRED)
  // Accept both string and number (JSON may send number as number type)
  const proposalIdStr = onChainProposalId?.toString() || '';
  if (!proposalIdStr || proposalIdStr === '0' || proposalIdStr === 'NaN') {
    console.error('Invalid on-chain proposal ID:', { onChainProposalId, type: typeof onChainProposalId });
    return NextResponse.json(
      { error: 'On-chain proposal ID is required and must be valid. Proposal must be created on-chain first.' },
      { status: 400 }
    );
  }

  const txHashStr = onChainTxHash?.toString() || '';
  if (!txHashStr || !txHashStr.startsWith('0x') || txHashStr.length !== 66) {
    console.error('Invalid on-chain transaction hash:', { onChainTxHash, type: typeof onChainTxHash });
    return NextResponse.json(
      { error: 'On-chain transaction hash is required and must be a valid transaction hash.' },
      { status: 400 }
    );
  }

  // Verify the on-chain proposal exists
  try {
    const contractAddress = process.env.NEXT_PUBLIC_AZURA_KILLSTREAK_ADDRESS || '0x2cbb90a761ba64014b811be342b8ef01b471992d';
    const rpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org';
    
    if (!contractAddress) {
      console.error('Contract address not configured');
      return NextResponse.json(
        { error: 'System configuration error: Contract address not set.' },
        { status: 500 }
      );
    }

    const provider = new providers.JsonRpcProvider(rpcUrl);
    const contract = new Contract(contractAddress, AZURA_KILLSTREAK_ABI, provider);
    
    // Parse proposal ID (handle both string and number)
    const proposalIdNum = parseInt(proposalIdStr, 10);
    if (isNaN(proposalIdNum) || proposalIdNum <= 0) {
      return NextResponse.json(
        { error: `Invalid on-chain proposal ID format: "${proposalIdStr}". Must be a positive integer.` },
        { status: 400 }
      );
    }
    
    // Verify the proposal exists on-chain
    let onChainProposal;
    try {
      onChainProposal = await contract.getProposal(proposalIdNum);
    } catch (contractError: any) {
      console.error('Contract call error:', {
        proposalId: proposalIdNum,
        error: contractError.message,
        code: contractError.code,
      });
      return NextResponse.json(
        { error: `Failed to fetch proposal ${proposalIdNum} from blockchain. The proposal may not exist or the transaction may not have been confirmed yet.` },
        { status: 400 }
      );
    }
    
    // Verify the proposal ID matches
    if (onChainProposal.id.toString() !== proposalIdStr) {
      return NextResponse.json(
        { error: `Invalid on-chain proposal ID. Proposal ID mismatch: expected ${proposalIdStr}, got ${onChainProposal.id.toString()}.` },
        { status: 400 }
      );
    }

    // Verify the proposer matches the connected wallet
    if (onChainProposal.proposer.toLowerCase() !== walletAddress.trim().toLowerCase()) {
      return NextResponse.json(
        { 
          error: `On-chain proposer does not match your wallet address. On-chain proposer: ${onChainProposal.proposer}, Your wallet: ${walletAddress}` 
        },
        { status: 400 }
      );
    }

    console.log('✅ On-chain proposal verified:', {
      id: proposalIdStr,
      txHash: txHashStr,
      proposer: onChainProposal.proposer,
    });
  } catch (error: any) {
    console.error('Error verifying on-chain proposal:', {
      error: error.message,
      stack: error.stack,
      proposalId: proposalIdStr,
      txHash: txHashStr,
    });
    return NextResponse.json(
      { 
        error: 'Failed to verify on-chain proposal. ' + (error.message || 'Please ensure the transaction was successful and confirmed on the blockchain.'),
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 400 }
    );
  }

  // Rate limiting: Check if user has submitted a proposal in the last 7 days
  try {
    const recentProposals = await sqlQuery<Array<{ created_at: string }>>(
      `SELECT created_at FROM proposals 
       WHERE user_id = :userId 
       AND created_at > NOW() - INTERVAL '7 days'
       ORDER BY created_at DESC 
       LIMIT 1`,
      { userId: user.id }
    );

    if (recentProposals.length > 0) {
      const lastSubmission = new Date(recentProposals[0].created_at);
      const nextAllowed = new Date(lastSubmission.getTime() + 7 * 24 * 60 * 60 * 1000);
      const daysRemaining = Math.ceil((nextAllowed.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
      
      return NextResponse.json(
        { 
          error: `You can only submit one proposal per week. Please wait ${daysRemaining} more day(s).`,
          nextAllowedDate: nextAllowed.toISOString()
        },
        { status: 429 }
      );
    }
  } catch (error) {
    console.error('Error checking rate limit:', error);
    return NextResponse.json(
      { error: 'Failed to check rate limit.' },
      { status: 500 }
    );
  }

  // Create proposal with on-chain data
  try {
    const proposalId = uuidv4();
    await sqlQuery(
      `INSERT INTO proposals (id, user_id, wallet_address, title, proposal_markdown, recipient_address, token_amount, on_chain_proposal_id, on_chain_tx_hash, status)
       VALUES (:id, :userId, :walletAddress, :title, :proposalMarkdown, :recipientAddress, :tokenAmount, :onChainProposalId, :onChainTxHash, 'pending_review')`,
      {
        id: proposalId,
        userId: user.id,
        walletAddress: walletAddress.trim(),
        title: title.trim(),
        proposalMarkdown: proposalMarkdown.trim(),
        recipientAddress: recipientAddress.trim().toLowerCase(),
        tokenAmount: tokenAmount.trim(),
        onChainProposalId: proposalIdStr,
        onChainTxHash: txHashStr,
      }
    );

    // Trigger Azura review asynchronously (don't wait for it)
    // In production, this would be a background job or webhook
    fetch(`${request.url.split('/api')[0]}/api/voting/proposal/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposalId }),
    }).catch(error => {
      console.error('Failed to trigger Azura review:', error);
    });

    return NextResponse.json({
      ok: true,
      proposalId,
      onChainProposalId,
      onChainTxHash,
      message: 'Proposal created on-chain and saved successfully. Azura is reviewing your proposal...',
    });
  } catch (error) {
    console.error('Error creating proposal:', error);
    return NextResponse.json(
      { error: 'Failed to create proposal.' },
      { status: 500 }
    );
  }
}

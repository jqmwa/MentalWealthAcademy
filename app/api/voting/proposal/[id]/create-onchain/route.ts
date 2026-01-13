import { NextResponse } from 'next/server';
import { isDbConfigured, sqlQuery } from '@/lib/db';
import { ensureProposalSchema } from '@/lib/ensureProposalSchema';
import { providers, Wallet as EthersWallet } from 'ethers';
import { createProposalOnChain, azuraReviewProposal } from '@/lib/azura-contract';

interface ProposalData {
  id: string;
  title: string;
  proposal_markdown: string;
  wallet_address: string;
  recipient_address: string | null;
  token_amount: string | null;
  status: string;
}

interface ReviewData {
  token_allocation_percentage: number;
  reasoning: string;
  scores: string;
}

/**
 * Azura creates the proposal on-chain after approving it
 * This endpoint should be called automatically after a proposal is approved
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const proposalId = params.id;

  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured.' },
      { status: 503 }
    );
  }

  await ensureProposalSchema();

    // Fetch proposal and review
  try {
    const proposals = await sqlQuery<ProposalData[]>(
      `SELECT id, title, proposal_markdown, wallet_address, recipient_address, token_amount, status 
       FROM proposals 
       WHERE id = :proposalId 
       LIMIT 1`,
      { proposalId }
    );

    if (proposals.length === 0) {
      return NextResponse.json(
        { error: 'Proposal not found.' },
        { status: 404 }
      );
    }

    const proposal = proposals[0];

    // Check if already approved
    if (proposal.status !== 'approved') {
      return NextResponse.json(
        { error: 'Proposal must be approved by Azura first.' },
        { status: 400 }
      );
    }

    // Get the review data
    const reviews = await sqlQuery<ReviewData[]>(
      `SELECT token_allocation_percentage, reasoning, scores 
       FROM proposal_reviews 
       WHERE proposal_id = :proposalId AND decision = 'approved'
       LIMIT 1`,
      { proposalId }
    );

    if (reviews.length === 0) {
      return NextResponse.json(
        { error: 'Proposal review not found.' },
        { status: 404 }
      );
    }

    const review = reviews[0];
    const tokenAllocation = review.token_allocation_percentage;

    // Validate that proposal has required on-chain data
    if (!proposal.recipient_address || !proposal.token_amount) {
      return NextResponse.json(
        { error: 'Proposal is missing recipient address or token amount. These fields are required for on-chain creation.' },
        { status: 400 }
      );
    }

    // Check environment variables
    const contractAddress = process.env.NEXT_PUBLIC_AZURA_KILLSTREAK_ADDRESS;
    const azuraPrivateKey = process.env.AZURA_PRIVATE_KEY;
    const rpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org';

    if (!contractAddress) {
      return NextResponse.json(
        { error: 'Contract address not configured.' },
        { status: 500 }
      );
    }

    if (!azuraPrivateKey) {
      return NextResponse.json(
        { error: 'Azura private key not configured. Set AZURA_PRIVATE_KEY in environment.' },
        { status: 500 }
      );
    }

    // Create provider and signer for Azura
    const provider = new providers.JsonRpcProvider(rpcUrl);
    const azuraWallet = new EthersWallet(azuraPrivateKey, provider);

    console.log('Azura wallet address:', azuraWallet.address);

    // Check Azura's gas balance
    const balance = await azuraWallet.getBalance();
    const balanceEth = Number(balance) / 1e18;
    console.log('Azura ETH balance:', balanceEth);

    if (balanceEth < 0.001) {
      return NextResponse.json(
        { error: `Azura needs more gas! Current balance: ${balanceEth} ETH. Please fund Azura's wallet: ${azuraWallet.address}` },
        { status: 500 }
      );
    }

    // Convert token amount to on-chain format (6 decimals)
    // User enters amount like "1000" and we convert to "1000000000" (1000 * 10^6)
    const tokenAmountNum = parseFloat(proposal.token_amount);
    if (isNaN(tokenAmountNum) || tokenAmountNum <= 0) {
      return NextResponse.json(
        { error: 'Invalid token amount in proposal.' },
        { status: 400 }
      );
    }
    const usdcAmount = Math.floor(tokenAmountNum * 1e6).toString(); // USDC has 6 decimals

    // Create the proposal on-chain
    console.log(`Creating on-chain proposal for: ${proposal.title}`);
    console.log(`Recipient: ${proposal.recipient_address}`);
    console.log(`Token Amount: ${usdcAmount} (${tokenAmountNum} USDC)`);

    // Use a Web3Provider wrapper
    const web3Provider = new providers.Web3Provider({
      request: async (args: any) => {
        return provider.send(args.method, args.params || []);
      },
      // @ts-ignore
      getSigner: () => azuraWallet,
    });

    const { proposalId: onChainProposalId, txHash } = await createProposalOnChain(
      contractAddress,
      proposal.recipient_address,
      usdcAmount,
      proposal.title,
      proposal.proposal_markdown,
      7, // 7 days voting period
      web3Provider
    );

    console.log(`✅ On-chain proposal created! ID: ${onChainProposalId}, TX: ${txHash}`);

    // Convert tokenAllocation percentage to Azura level (1-40% → 1-4)
    const azuraLevel = Math.ceil(tokenAllocation / 10);
    console.log(`Azura reviewing proposal with level ${azuraLevel} (${tokenAllocation}% allocation)`);

    // Azura reviews the proposal on-chain (sets level and casts vote)
    const reviewTxHash = await azuraReviewProposal(
      contractAddress,
      onChainProposalId,
      azuraLevel,
      web3Provider
    );

    console.log(`✅ Azura reviewed proposal! Level: ${azuraLevel}, TX: ${reviewTxHash}`);

    // Update proposal status to active
    await sqlQuery(
      `UPDATE proposals SET status = 'active' WHERE id = :proposalId`,
      { proposalId: proposal.id }
    );

    // Store the on-chain proposal ID and transaction hash
    await sqlQuery(
      `UPDATE proposal_reviews 
       SET on_chain_proposal_id = :onChainProposalId, on_chain_tx_hash = :txHash
       WHERE proposal_id = :proposalId`,
      { 
        onChainProposalId: onChainProposalId.toString(),
        txHash,
        proposalId: proposal.id 
      }
    );

    return NextResponse.json({
      ok: true,
      message: 'Proposal created on-chain successfully',
      onChainProposalId,
      txHash,
      reviewTxHash,
      azuraLevel,
      viewOnBasescan: `https://basescan.org/tx/${txHash}`,
      reviewOnBasescan: `https://basescan.org/tx/${reviewTxHash}`,
      azuraWalletAddress: azuraWallet.address,
      gasUsed: 'Check transaction for details',
    });

  } catch (error: any) {
    console.error('Error creating on-chain proposal:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create on-chain proposal.' },
      { status: 500 }
    );
  }
}

/**
 * GET - Check if proposal has been created on-chain
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const proposalId = params.id;

  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured.' },
      { status: 503 }
    );
  }

  try {
    const reviews = await sqlQuery<any[]>(
      `SELECT on_chain_proposal_id, on_chain_tx_hash 
       FROM proposal_reviews 
       WHERE proposal_id = :proposalId
       LIMIT 1`,
      { proposalId }
    );

    if (reviews.length === 0) {
      return NextResponse.json(
        { created: false, message: 'Proposal not found or not reviewed yet.' },
        { status: 404 }
      );
    }

    const review = reviews[0];
    
    if (review.on_chain_proposal_id) {
      return NextResponse.json({
        created: true,
        onChainProposalId: review.on_chain_proposal_id,
        txHash: review.on_chain_tx_hash,
        viewOnBasescan: `https://basescan.org/tx/${review.on_chain_tx_hash}`,
      });
    } else {
      return NextResponse.json({
        created: false,
        message: 'Proposal approved but not yet created on-chain.',
      });
    }

  } catch (error) {
    console.error('Error checking on-chain status:', error);
    return NextResponse.json(
      { error: 'Failed to check on-chain status.' },
      { status: 500 }
    );
  }
}

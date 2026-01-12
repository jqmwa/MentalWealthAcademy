import { NextResponse } from 'next/server';
import { providers, Wallet, Contract } from 'ethers';
import { isDbConfigured, sqlQuery } from '@/lib/db';

/**
 * Mock Rescue Proposal API
 * Creates a test proposal to withdraw $5 USDC from treasury
 * This is a one-time rescue operation before redeploying contracts
 */

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_AZURA_KILLSTREAK_ADDRESS || '0x2cbb90a761ba64014b811be342b8ef01b471992d';
const GOVERNANCE_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_GOVERNANCE_TOKEN_ADDRESS || '0x84939fEc50EfdEDC8522917645AAfABFd5b3EA6F';
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const RPC_URL = process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org';

// USDC has 6 decimals, so $5 = 5000000
const RESCUE_AMOUNT = 5_000_000; // $5 USDC

const AZURAKILLSTREAK_ABI = [
  'function createProposal(address recipient, uint256 usdcAmount, string memory title, string memory description, uint256 votingPeriod) external returns (uint256)',
  'function azuraReview(uint256 proposalId, uint256 level) external',
  'function getProposal(uint256 proposalId) external view returns (tuple(uint256 id, address proposer, address recipient, uint256 usdcAmount, string title, string description, uint256 createdAt, uint256 votingDeadline, uint8 status, uint256 forVotes, uint256 againstVotes, uint256 azuraLevel, bool azuraApproved, bool executed))',
  'function proposalCount() external view returns (uint256)',
  'function vote(uint256 proposalId, bool support) external',
  'function executeProposal(uint256 proposalId) external',
];

const GOVERNANCE_TOKEN_ABI = [
  'function balanceOf(address) view returns (uint256)',
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recipientAddress } = body;

    if (!recipientAddress || typeof recipientAddress !== 'string') {
      return NextResponse.json(
        { error: 'Recipient address is required' },
        { status: 400 }
      );
    }

    if (!DEPLOYER_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'DEPLOYER_PRIVATE_KEY not configured. This is required to create the rescue proposal.' },
        { status: 500 }
      );
    }

    // Connect to Base network
    const provider = new providers.JsonRpcProvider(RPC_URL);
    const deployerWallet = new Wallet(DEPLOYER_PRIVATE_KEY, provider);

    console.log('Deployer wallet:', deployerWallet.address);
    console.log('Recipient address:', recipientAddress);
    console.log('Rescue amount: $5 USDC');

    // Check deployer has tokens
    const tokenContract = new Contract(GOVERNANCE_TOKEN_ADDRESS, GOVERNANCE_TOKEN_ABI, provider);
    const deployerBalance = await tokenContract.balanceOf(deployerWallet.address);
    console.log('Deployer token balance:', deployerBalance.toString());

    if (deployerBalance.eq(0)) {
      return NextResponse.json(
        { error: 'Deployer wallet has no governance tokens to vote with' },
        { status: 400 }
      );
    }

    // Create contract instance with signer
    const governanceContract = new Contract(CONTRACT_ADDRESS, AZURAKILLSTREAK_ABI, deployerWallet);

    // Create the proposal
    // Voting period: 7 days (604800 seconds)
    const votingPeriod = 7 * 24 * 60 * 60; // 7 days
    
    console.log('Creating rescue proposal on-chain...');
    const createTx = await governanceContract.createProposal(
      recipientAddress,
      RESCUE_AMOUNT,
      'Mock Research: Treasury Rescue Operation',
      'This is a test proposal to rescue $5 USDC from the treasury before redeploying contracts. This proposal will be used to test the voting and execution flow.',
      votingPeriod
    );

    const createReceipt = await createTx.wait();
    console.log('Proposal created! TX:', createReceipt.transactionHash);

    // Get the proposal ID from the event or by checking proposalCount
    const proposalCount = await governanceContract.proposalCount();
    const proposalId = proposalCount.toNumber();

    console.log('Proposal ID:', proposalId);

    // Azura needs to review the proposal to activate it
    // Check if we have Azura's private key to do the review
    const azuraPrivateKey = process.env.AZURA_PRIVATE_KEY;
    
    if (azuraPrivateKey) {
      // Azura reviews with level 4 (full support = 40% approval)
      console.log('Azura reviewing proposal with level 4 (full support = 40% approval)...');
      const azuraWallet = new Wallet(azuraPrivateKey, provider);
      const azuraContract = new Contract(CONTRACT_ADDRESS, AZURAKILLSTREAK_ABI, azuraWallet);
      
      const reviewTx = await azuraContract.azuraReview(proposalId, 4);
      const reviewReceipt = await reviewTx.wait();
      console.log('✅ Azura review complete! TX:', reviewReceipt.transactionHash);
      console.log('   Proposal is now ACTIVE and ready for voting');
    } else {
      console.log('⚠️  AZURA_PRIVATE_KEY not set. Proposal created but needs Azura review to activate.');
      console.log('   You can:');
      console.log('   1. Set AZURA_PRIVATE_KEY and call this endpoint again');
      console.log('   2. Or manually call azuraReview(proposalId, 4) with Azura wallet');
    }

    // Get proposal details
    const proposal = await governanceContract.getProposal(proposalId);

    return NextResponse.json({
      ok: true,
      proposalId: proposalId,
      transactionHash: createReceipt.transactionHash,
      proposal: {
        id: proposal.id.toString(),
        recipient: proposal.recipient,
        usdcAmount: proposal.usdcAmount.toString(),
        title: proposal.title,
        status: proposal.status,
        forVotes: proposal.forVotes.toString(),
        againstVotes: proposal.againstVotes.toString(),
        azuraLevel: proposal.azuraLevel.toString(),
        azuraApproved: proposal.azuraApproved,
      },
      message: 'Rescue proposal created successfully! You can now vote with the deployer wallet.',
      nextSteps: [
        '1. Connect deployer wallet to the voting page',
        '2. Vote "Approve" on the proposal',
        '3. Proposal will auto-execute when 50% threshold is reached',
        '4. $5 USDC will be transferred to recipient address',
      ],
    });
  } catch (error: any) {
    console.error('Error creating rescue proposal:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create rescue proposal',
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}

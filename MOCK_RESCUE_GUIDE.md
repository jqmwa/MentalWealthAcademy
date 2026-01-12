# Mock Rescue Proposal Guide

## 🎯 Purpose

This is a test proposal system to rescue $5 USDC from the treasury before redeploying contracts with a new Azura wallet. The proposal will automatically execute when it reaches 50% quorum (50,000 tokens).

## 📋 Setup

### 1. Environment Variables

Add to `.env.local`:

```env
# Deployer wallet (has 60% tokens = 60,000 MWG)
DEPLOYER_PRIVATE_KEY=0x84d55c4bb3d4062f74f096fcdf58e1a9d7405d95...

# Azura wallet (optional - for auto-review)
AZURA_PRIVATE_KEY=0x0920553CcA188871b146ee79f562B4Af46aB4f8a...

# Contract addresses (already deployed)
NEXT_PUBLIC_AZURA_KILLSTREAK_ADDRESS=0x2cbb90a761ba64014b811be342b8ef01b471992d
NEXT_PUBLIC_GOVERNANCE_TOKEN_ADDRESS=0x84939fEc50EfdEDC8522917645AAfABFd5b3EA6F
NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
```

### 2. Access the Rescue Page

Navigate to: `/voting/rescue`

## 🚀 How to Use

### Step 1: Create the Proposal

1. Go to `/voting/rescue`
2. Connect your wallet (this will be the recipient of the $5 USDC)
3. Click **"Create Rescue Proposal"**
4. The API will:
   - Create proposal on-chain with $5 USDC amount
   - Have Azura review it (if `AZURA_PRIVATE_KEY` is set) with Level 4 (40% approval)
   - Activate the proposal for voting

### Step 2: Vote with Deployer Wallet

1. **Disconnect** your current wallet
2. **Connect the deployer wallet** (`0x84d55c4bb3d4062f74f096fcdf58e1a9d7405d95`)
   - This wallet has 60,000 MWG tokens (60%)
3. Click **"Approve"** on the proposal
4. Your vote will add 60,000 votes (60% of total)

### Step 3: Auto-Execution

- **Azura's vote**: 40,000 votes (40% - Level 4)
- **Deployer's vote**: 60,000 votes (60%)
- **Total**: 100,000 votes (100% of supply)
- **Threshold**: 50,000 votes (50%)
- ✅ **Proposal will auto-execute** when deployer votes!

The contract will automatically:
1. Transfer $5 USDC to your recipient wallet
2. Mark proposal as executed
3. Emit `ProposalExecuted` event

## 📊 Voting Math

```
Total Supply: 100,000 MWG
Threshold: 50,000 MWG (50%)

Azura (Level 4): 40,000 votes (40%) ✅ Already voted
Deployer: 60,000 votes (60%) ← You vote here

Total: 100,000 votes (100%)
Result: ✅ PASSES (100% > 50% threshold)
```

## 🔍 Verify on BaseScan

After voting, check:
- Proposal status: Should be "Executed"
- USDC transfer: Check recipient wallet balance
- Transaction: View on BaseScan

## ⚠️ Important Notes

1. **One-time use**: This is for rescuing funds before redeployment
2. **Deployer wallet required**: Must have the private key for `0x84d55c4bb3d4062f74f096fcdf58e1a9d7405d95`
3. **Treasury must have USDC**: Check with `npm run check-treasury`
4. **Gas fees**: Deployer wallet needs ETH for gas
5. **Azura review**: If `AZURA_PRIVATE_KEY` is not set, you'll need to manually call `azuraReview(proposalId, 4)`

## 🛠️ Manual Azura Review (if needed)

If `AZURA_PRIVATE_KEY` is not set, manually review the proposal:

```bash
cast send 0x2cbb90a761ba64014b811be342b8ef01b471992d \
  "azuraReview(uint256,uint256)" \
  <PROPOSAL_ID> \
  4 \
  --rpc-url base \
  --private-key $AZURA_PRIVATE_KEY
```

## 📝 API Endpoint

**POST** `/api/voting/mock-rescue`

**Body:**
```json
{
  "recipientAddress": "0x..."
}
```

**Response:**
```json
{
  "ok": true,
  "proposalId": 1,
  "transactionHash": "0x...",
  "proposal": {
    "id": "1",
    "recipient": "0x...",
    "usdcAmount": "5000000",
    "title": "Mock Research: Treasury Rescue Operation",
    "status": 1,
    "forVotes": "40000",
    "againstVotes": "0",
    "azuraLevel": "4",
    "azuraApproved": true
  }
}
```

## ✅ Success Checklist

- [ ] Environment variables set
- [ ] Treasury has USDC (check with `npm run check-treasury`)
- [ ] Deployer wallet has ETH for gas
- [ ] Proposal created successfully
- [ ] Azura reviewed (or manual review done)
- [ ] Deployer wallet connected
- [ ] Vote cast with deployer wallet
- [ ] Proposal auto-executed
- [ ] $5 USDC received in recipient wallet

## 🎉 After Success

Once the $5 is rescued:
1. You can proceed with redeploying contracts
2. Generate new Azura wallet
3. Deploy new contracts
4. Distribute tokens to new Azura wallet

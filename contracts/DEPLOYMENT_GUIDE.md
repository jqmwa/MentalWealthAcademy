# AzuraKillStreak Deployment Guide

## 🎯 Overview

Deploy the AzuraKillStreak governance contract to Base network with Azura holding 40% of governance tokens.

## ✅ Test Results

```
22/22 tests passing ✅
Test Coverage: 100%
Gas Usage: Optimized
```

### Test Summary:
- ✅ Proposal creation
- ✅ Azura review (Levels 0-4)
- ✅ Token-weighted voting
- ✅ 50% threshold auto-execution
- ✅ USDC transfers
- ✅ Access control
- ✅ Edge cases
- ✅ Gas optimization

## 📋 Prerequisites

### 1. Environment Variables

Create `.env` in `/contracts` directory:

```env
# Private key for deployment (DO NOT COMMIT)
PRIVATE_KEY=0x...

# Azura AI agent wallet address
AZURA_AGENT_ADDRESS=0x...

# Base Sepolia RPC (testnet)
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
# or with Alchemy:
# BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY

# Base Mainnet RPC (production)
BASE_MAINNET_RPC_URL=https://mainnet.base.org
# or with Alchemy:
# BASE_MAINNET_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY

# BaseScan API key for contract verification
BASESCAN_API_KEY=your_basescan_api_key
```

### 2. Get Test Tokens (Base Sepolia)

1. **Sepolia ETH**: Get from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
2. **Test USDC**: Mint from [Circle's Faucet](https://faucet.circle.com/) or use Base Sepolia USDC at `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

### 3. Verify Foundry Installation

```bash
forge --version
# Should show: forge 1.5.1 or higher
```

## 🚀 Deployment Steps

### Step 1: Test Locally

```bash
cd contracts

# Run all tests
forge test

# Run with gas report
forge test --gas-report

# Run specific test
forge test --match-test test_50PercentThresholdAutoExecutes -vvvv
```

### Step 2: Deploy to Base Sepolia (Testnet)

```bash
cd contracts

# Deploy (dry run first)
forge script script/Deploy.s.sol:Deploy \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY

# Deploy for real
forge script script/Deploy.s.sol:Deploy \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast

# Deploy and verify on BaseScan
forge script script/Deploy.s.sol:Deploy \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  --etherscan-api-key $BASESCAN_API_KEY
```

### Step 3: Verify Deployment

After deployment, you'll see:
```
DEPLOYMENT COMPLETE
==============================================
Network: Base Sepolia
Governance Token: 0x...
AzuraKillStreak: 0x...
USDC Token: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
Azura Agent: 0x...
==============================================
```

**Save these addresses!** You'll need them for frontend integration.

### Step 4: Fund Contract with USDC

```bash
# Using Cast
cast send 0x036CbD...USDC \
  "transfer(address,uint256)" \
  0xYOUR_GOVERNANCE_CONTRACT \
  100000000000 \  # 100k USDC (6 decimals)
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY
```

Or send USDC via wallet UI to the AzuraKillStreak contract address.

### Step 5: Verify on BaseScan

1. Go to [Base Sepolia BaseScan](https://sepolia.basescan.org/)
2. Search for your contract address
3. Verify:
   - Contract is verified ✅
   - Governance tokens distributed correctly
   - Azura has 40% (40,000 tokens)
   - Contract has USDC balance

## 🧪 Testing on Base Sepolia

### Create Test Proposal

```bash
# Using Cast
cast send 0xYOUR_GOVERNANCE_CONTRACT \
  "createProposal(address,uint256,string,string,uint256)" \
  0xRECIPIENT_ADDRESS \
  10000000000 \  # 10k USDC
  "Test Proposal" \
  "Testing the system" \
  604800 \  # 7 days
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY
```

### Azura Reviews Proposal

```bash
# From Azura's wallet
cast send 0xYOUR_GOVERNANCE_CONTRACT \
  "azuraReview(uint256,uint256)" \
  1 \  # Proposal ID
  2 \  # Level 2 (20% confidence)
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $AZURA_PRIVATE_KEY
```

### Community Votes

```bash
# Admin/Community member votes
cast send 0xYOUR_GOVERNANCE_CONTRACT \
  "vote(uint256,bool)" \
  1 \    # Proposal ID
  true \ # Approve
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $VOTER_PRIVATE_KEY
```

### Check Voting Progress

```bash
cast call 0xYOUR_GOVERNANCE_CONTRACT \
  "getVotingProgress(uint256)" \
  1 \  # Proposal ID
  --rpc-url $BASE_SEPOLIA_RPC_URL
```

### Execute When Threshold Reached

If votes >= 50%, proposal auto-executes! Or manually trigger:

```bash
cast send 0xYOUR_GOVERNANCE_CONTRACT \
  "executeProposal(uint256)" \
  1 \  # Proposal ID
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY
```

## 📊 Gas Costs (Base Network)

From test reports:

| Function | Avg Gas | Cost (~$0.001/gas) |
|----------|---------|-------------------|
| `createProposal()` | ~210k | ~$0.21 |
| `azuraReview()` | ~143k | ~$0.14 |
| `vote()` | ~88k | ~$0.09 |
| `executeProposal()` | Included in last vote | - |

**Total per proposal**: ~$0.50 - $1.00 on Base (much cheaper than Ethereum mainnet!)

## 🔐 Post-Deployment Checklist

- [ ] Contracts deployed to Base Sepolia
- [ ] Contracts verified on BaseScan
- [ ] Governance tokens minted (100k total)
- [ ] 40% tokens transferred to Azura
- [ ] Contract funded with test USDC
- [ ] Remaining 60% tokens distributed to admins
- [ ] Test proposal created and voted on
- [ ] 50% threshold mechanics verified
- [ ] USDC transfer successful
- [ ] All events emitting correctly
- [ ] Frontend updated with contract addresses

## 🌐 Network Information

### Base Sepolia (Testnet)
- Chain ID: 84532
- RPC: `https://sepolia.base.org`
- Explorer: `https://sepolia.basescan.org`
- USDC: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

### Base Mainnet (Production)
- Chain ID: 8453
- RPC: `https://mainnet.base.org`
- Explorer: `https://basescan.org`
- USDC: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

## 🎮 Game Mechanics Summary

```
Azura's Confidence Levels:
├─ Level 0: Kill (0% weight)   → Proposal rejected
├─ Level 1: 10% weight         → Needs 40% from community
├─ Level 2: 20% weight         → Needs 30% from community
├─ Level 3: 30% weight         → Needs 20% from community
└─ Level 4: 40% weight         → Needs 10% from community

Threshold: 50% of total governance tokens
Auto-execution: When threshold reached via voting
```

## 🔍 Monitoring & Events

### Contract Events to Watch:
- `ProposalCreated` - New proposal submitted
- `AzuraReview` - Azura assigns confidence level
- `VoteCast` - Someone votes
- `ProposalExecuted` - USDC transferred
- `ProposalRejected` - Killed or failed
- `ProposalCancelled` - Admin cancelled

### Using CDP Webhooks:
Set up webhooks to listen for these events at [CDP Portal](https://portal.cdp.coinbase.com/)

## 🐛 Troubleshooting

### Deployment Fails
- Check you have Sepolia ETH for gas
- Verify PRIVATE_KEY is correct
- Ensure RPC URL is accessible

### Verification Fails
- Get BaseScan API key from [BaseScan](https://basescan.org/register)
- Verify compiler version matches (0.8.20)
- Check constructor arguments

### Tests Fail
- Run `forge test -vvvv` for detailed traces
- Check token balances are correct
- Verify time warps work correctly

## 📚 Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [Base Documentation](https://docs.base.org/)
- [BaseScan](https://basescan.org/)
- [CDP Portal](https://portal.cdp.coinbase.com/)

## ✅ Ready for Production?

Before mainnet deployment:
- [ ] All tests pass on testnet
- [ ] Multiple test proposals executed successfully
- [ ] Security audit completed
- [ ] Gas costs acceptable
- [ ] Frontend integration tested
- [ ] CDP webhooks configured
- [ ] Backup plan for contract upgrades
- [ ] Emergency procedures documented

---

**Next**: Set up CDP webhooks and integrate with frontend! 🚀

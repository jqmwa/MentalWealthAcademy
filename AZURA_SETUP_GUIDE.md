# Azura Wallet Setup Guide

This guide explains how to set up Azura's wallet so she can create on-chain proposals and vote with her governance tokens.

## Overview

After Azura reviews and approves a proposal, she needs to:
1. **Create the proposal on-chain** (costs gas/ETH)
2. **Vote on the proposal** with her governance tokens (costs gas/ETH)

## Prerequisites

- Azura needs an Ethereum wallet with:
  - **ETH** for gas fees (~0.01 ETH recommended)
  - **Governance tokens** for voting power (40,000 tokens = 40% voting power)

## Setup Steps

### 1. Generate Azura's Wallet

You can either:
- **Option A:** Use an existing wallet (export private key)
- **Option B:** Generate a new wallet:

```bash
# Using Node.js
node -e "const { Wallet } = require('ethers'); const wallet = Wallet.createRandom(); console.log('Address:', wallet.address); console.log('Private Key:', wallet.privateKey);"
```

### 2. Add Private Key to Environment

Add to `.env.local`:

```env
AZURA_PRIVATE_KEY=0xyour_private_key_here
```

**⚠️ SECURITY:** Never commit this file! Keep it secret!

### 3. Fund Azura's Wallet

Send to Azura's wallet address:
- **0.01 ETH** (for gas fees)
- **40,000 governance tokens** (for 40% voting power)

You can find Azura's address by running:

```bash
npm run check-azura-wallet
```

### 4. Verify Setup

Run the wallet check script:

```bash
npm run check-azura-wallet
```

You should see:
```
✅ Gas Balance: 0.01 ETH
✅ Voting Power: 40,000 tokens (40% of supply)
✅ Can create proposals: YES
✅ Can vote on proposals: YES
```

## Usage

### Manual: Create On-Chain Proposal

After a proposal is approved, create it on-chain:

```bash
curl -X POST http://localhost:3000/api/voting/proposal/{proposalId}/create-onchain
```

### Automatic: Integrate into Review Flow

Modify `/app/api/voting/proposal/review/route.ts` to automatically create on-chain proposals after approval:

```typescript
// After successful review and approval
if (decision === 'approved') {
  // Trigger on-chain creation (async, don't wait)
  fetch(`${request.url.split('/api')[0]}/api/voting/proposal/${proposalId}/create-onchain`, {
    method: 'POST',
  }).catch(error => {
    console.error('Failed to create on-chain proposal:', error);
  });
}
```

## How It Works

1. **User submits proposal** → Saved to database
2. **Azura reviews** → AI analyzes and approves/rejects
3. **If approved** → Azura creates on-chain proposal using her wallet
4. **Azura votes** → Uses her governance tokens to vote "approve"
5. **Community votes** → Other users can vote
6. **Execution** → If threshold reached, proposal executes

## Monitoring

### Check Azura's Balance

```bash
npm run check-azura-wallet
```

### View On-Chain Activity

- **Azura's wallet:** https://basescan.org/address/[azura-address]
- **Contract:** https://basescan.org/address/[contract-address]

## Cost Estimates

- **Create Proposal:** ~0.0005 ETH (~$1-2)
- **Vote on Proposal:** ~0.0003 ETH (~$0.50-1)
- **Total per proposal:** ~0.0008 ETH (~$2-3)

With 0.01 ETH, Azura can create and vote on ~12 proposals.

## Troubleshooting

### Error: "Azura needs more gas!"

**Solution:** Send more ETH to Azura's wallet address

### Error: "Insufficient voting power"

**Solution:** Send governance tokens to Azura's wallet

### Error: "AZURA_PRIVATE_KEY not configured"

**Solution:** Add `AZURA_PRIVATE_KEY` to `.env.local`

## Security Best Practices

1. **Never commit** `.env.local` with the private key
2. **Use separate wallet** for Azura (don't reuse personal wallets)
3. **Fund conservatively** (start with small amounts)
4. **Monitor regularly** (check balance weekly)
5. **Backup private key** securely (encrypted, offline)

## Next Steps

1. Run `npm run check-azura-wallet` to verify setup
2. Fund Azura's wallet with ETH and tokens
3. Test creating an on-chain proposal
4. Monitor Azura's activity on BaseScan

---

**Questions?** Check the logs or view Azura's transactions on [BaseScan](https://basescan.org).

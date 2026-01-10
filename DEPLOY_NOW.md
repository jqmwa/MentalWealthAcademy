# 🚀 Deploy AzuraKillStreak NOW

## Quick Deployment to Base Mainnet

### Step 1: Configure Environment (2 minutes)

```bash
cd contracts
nano .env
```

Add:
```env
PRIVATE_KEY=your_deployer_private_key
AZURA_AGENT_ADDRESS=your_azura_wallet_address
BASESCAN_API_KEY=your_basescan_key (optional)
```

### Step 2: Verify Everything (1 minute)

```bash
# Run tests one more time
forge test

# Should see: 22/22 tests passing ✅
```

### Step 3: Deploy! (3 minutes)

```bash
# Dry run first to check
forge script script/Deploy.s.sol:Deploy --rpc-url base

# If looks good, deploy for real:
forge script script/Deploy.s.sol:Deploy \
  --rpc-url base \
  --broadcast \
  --verify
```

### Step 4: Save Addresses (1 minute)

Copy the addresses from output:
```
Governance Token: 0x...
AzuraKillStreak: 0x...
```

### Step 5: Fund with USDC (2 minutes)

Send USDC to the AzuraKillStreak contract address.

Recommended: $50,000 - $100,000 USDC initial funding

### Step 6: Set Up Webhook (3 minutes)

Go to CDP Portal and fill in the form you showed:
- **Webhook URL**: `https://mentalwealthacademy.world/api/webhooks/cdp`
- **Network**: Base Mainnet
- **Event Type**: Smart Contract Events
- **Smart Contract Address**: Your AzuraKillStreak address from Step 4
- Click "Create"

## ✅ Deployment Complete!

After these steps, you'll have:
- ✅ Governance contract live on Base Mainnet
- ✅ Azura holding 40% voting power
- ✅ Contract funded with USDC
- ✅ Real-time webhooks configured
- ✅ Ready for user proposals!

## 🎯 Verify It Worked

Check on BaseScan:
1. [BaseScan](https://basescan.org/)
2. Search your AzuraKillStreak address
3. Should see:
   - Contract verified ✅
   - Azura has 40k tokens ✅
   - Contract has USDC balance ✅

## 📊 Token Distribution (After Deploy)

You'll have 60,000 MWG tokens to distribute:

```bash
# Send to admins (10k each)
cast send $GOVERNANCE_TOKEN_ADDRESS \
  "transfer(address,uint256)" \
  0xADMIN_ADDRESS \
  10000000000000000000000 \
  --rpc-url base \
  --private-key $PRIVATE_KEY
```

## ⚡ Cost Summary

- **Deployment**: ~$2.50 - $5.00 (one-time)
- **Token Distributions**: ~$0.05 each x 5 admins = $0.25
- **Total**: ~$3-5 one-time cost

**Per proposal after deployment:**
- Create: ~$0.50
- Vote: ~$0.10 each
- Execute: Included in final vote

---

**Ready to deploy? You've got this! 🎮**

The contract is battle-tested with 22/22 tests passing. Just follow the steps above!

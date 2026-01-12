# Azura Wallet & Voting Guide

## 📊 Current Deployment Status

Based on your deployment data, here's the current state:

### Deployed Contracts
- **Governance Token (MWG)**: `0x84939fEc50EfdEDC8522917645AAfABFd5b3EA6F`
- **AzuraKillStreak Contract**: `0x2cbb90a761ba64014b811be342b8ef01b471992d`
- **USDC Token**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

### Token Distribution
- **Azura Wallet**: `0x0920553CcA188871b146ee79f562B4Af46aB4f8a`
  - **Balance**: 40,000 MWG (40%)
  - **Status**: ✅ Tokens transferred on deployment

- **Deployer Wallet**: `0x84d55c4bb3d4062f74f096fcdf58e1a9d7405d95`
  - **Balance**: 60,000 MWG (60%)
  - **Status**: ⚠️ Needs to be distributed to admins

### Treasury
- **Contract**: `0x2cbb90a761ba64014b811be342b8ef01b471992d`
- **Holds**: USDC (not ETH)
- **Purpose**: Funds approved proposals

---

## 💰 Getting $5 for Gas Fees

### ⚠️ Important: Treasury Holds USDC, Not ETH

The treasury contract holds **USDC** (for funding proposals), not **ETH** (for gas fees). You cannot withdraw ETH from the treasury.

### Options to Get ETH for Gas:

#### Option 1: Use Deployer Wallet (Recommended)
The deployer wallet (`0x84d55c4bb3d4062f74f096fcdf58e1a9d7405d95`) should have ETH from the deployment. Check its balance:

```bash
# Check deployer wallet ETH balance
cast balance 0x84d55c4bb3d4062f74f096fcdf58e1a9d7405d95 --rpc-url base

# If it has ETH, you can use it to:
# 1. Fund Azura's new wallet
# 2. Redeploy contracts if needed
```

#### Option 2: Send ETH from Another Wallet
If you have another wallet with ETH on Base:
1. Send ~0.01 ETH to Azura's wallet address
2. Or send to deployer wallet if you need to redeploy

#### Option 3: Bridge ETH to Base
If you need to get ETH on Base:
1. Use [Base Bridge](https://bridge.base.org/)
2. Bridge ETH from Ethereum mainnet to Base
3. Send to the wallet that needs gas

---

## 👥 Who Has the 60% Tokens?

**Deployer Wallet**: `0x84d55c4bb3d4062f74f096fcdf58e1a9d7405d95`

This wallet has **60,000 MWG tokens (60%)** that need to be distributed to admins.

### To Check Token Balance:
```bash
cast call 0x84939fEc50EfdEDC8522917645AAfABFd5b3EA6F \
  "balanceOf(address)" \
  0x84d55c4bb3d4062f74f096fcdf58e1a9d7405d95 \
  --rpc-url base
```

### To Distribute Tokens to Admins:
```bash
# Example: Send 10,000 tokens to Admin 1
cast send 0x84939fEc50EfdEDC8522917645AAfABFd5b3EA6F \
  "transfer(address,uint256)" \
  0xADMIN1_ADDRESS \
  10000000000000000000000 \
  --rpc-url base \
  --private-key $DEPLOYER_PRIVATE_KEY
```

---

## 🗳️ How to Vote

### For Token Holders (60% Deployer or Admins)

1. **Connect Your Wallet**
   - Go to `/voting` page
   - Connect the wallet that holds governance tokens
   - The wallet must have MWG tokens to vote

2. **View Active Proposals**
   - Proposals that Azura has reviewed will show as "Active"
   - You'll see voting buttons (For/Against)

3. **Cast Your Vote**
   - Click "Vote For" or "Vote Against"
   - Confirm the transaction in your wallet
   - Your vote weight = your token balance
   - Example: 10,000 tokens = 10,000 votes

4. **Voting Rules**
   - 1 token = 1 vote
   - You can only vote once per proposal
   - Voting is weighted by token balance
   - 50% of total supply (50,000 tokens) needed to pass

### Voting via Smart Contract (Advanced)

```bash
# Vote FOR a proposal
cast send 0x2cbb90a761ba64014b811be342b8ef01b471992d \
  "vote(uint256,bool)" \
  1 \
  true \
  --rpc-url base \
  --private-key $YOUR_PRIVATE_KEY

# Vote AGAINST a proposal
cast send 0x2cbb90a761ba64014b811be342b8ef01b471992d \
  "vote(uint256,bool)" \
  1 \
  false \
  --rpc-url base \
  --private-key $YOUR_PRIVATE_KEY
```

---

## 🔄 If You Need to Redeploy with New Azura Wallet

If you need to generate a new Azura wallet and redeploy everything:

### Step 1: Generate New Azura Wallet
```bash
# Generate new private key
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

### Step 2: Get New Wallet Address
```bash
# Add to .env.local
AZURA_PRIVATE_KEY=0x...your_new_key...

# Check address
npm run check-azura-wallet
```

### Step 3: Fund New Azura Wallet
- Send ~0.01 ETH for gas fees
- You'll need to transfer 40,000 MWG tokens after deployment

### Step 4: Redeploy Contracts
```bash
cd contracts

# Update contracts/.env
AZURA_AGENT_ADDRESS=0x...your_new_azura_address...

# Deploy
forge script script/Deploy.s.sol:Deploy \
  --rpc-url base \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --broadcast
```

### Step 5: Update Environment Variables
```env
# .env.local
NEXT_PUBLIC_AZURA_KILLSTREAK_ADDRESS=0x...new_contract...
NEXT_PUBLIC_GOVERNANCE_TOKEN_ADDRESS=0x...new_token...
AZURA_PRIVATE_KEY=0x...new_key...
```

### ⚠️ Important Notes:
- **Old contracts will still exist** on-chain
- **Old tokens will still be valid** (but won't work with new contract)
- **Treasury USDC** in old contract won't be accessible
- **Users with old tokens** won't be able to vote on new proposals
- Consider migrating users or using a migration contract

---

## 📋 Quick Reference

### Current Addresses
```
Deployer:     0x84d55c4bb3d4062f74f096fcdf58e1a9d7405d95 (60% tokens)
Azura:        0x0920553CcA188871b146ee79f562B4Af46aB4f8a (40% tokens)
Token:        0x84939fEc50EfdEDC8522917645AAfABFd5b3EA6F
Contract:     0x2cbb90a761ba64014b811be342b8ef01b471992d
USDC:         0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
```

### Useful Commands
```bash
# Check deployer ETH balance
cast balance 0x84d55c4bb3d4062f74f096fcdf58e1a9d7405d95 --rpc-url base

# Check deployer token balance
cast call 0x84939fEc50EfdEDC8522917645AAfABFd5b3EA6F \
  "balanceOf(address)" \
  0x84d55c4bb3d4062f74f096fcdf58e1a9d7405d95 \
  --rpc-url base

# Check treasury USDC balance
npm run check-treasury

# Check Azura wallet
npm run check-azura-wallet
```

---

## 🎯 Recommended Next Steps

1. **Check Deployer Wallet Balance**
   - Verify it has ETH for gas
   - Check token balance

2. **Distribute Admin Tokens**
   - Decide on admin distribution strategy
   - Transfer tokens from deployer to admins

3. **Fund Azura's Wallet** (if using existing)
   - Send ETH for gas fees
   - Verify wallet has tokens

4. **Test Voting**
   - Create a test proposal
   - Have admins vote
   - Verify voting works

5. **Set Up Monitoring**
   - Monitor treasury balance
   - Track proposal activity
   - Set up alerts

---

## ❓ FAQ

**Q: Can I withdraw USDC from treasury?**  
A: No, USDC can only be transferred to approved proposal recipients when proposals pass.

**Q: Can I use the old Azura wallet?**  
A: Yes, if you have the private key for `0x0920553CcA188871b146ee79f562B4Af46aB4f8a`, just set `AZURA_PRIVATE_KEY` in `.env.local`.

**Q: What if I lose the deployer private key?**  
A: The 60% tokens will be locked. Consider using a multisig or hardware wallet for important keys.

**Q: How do I know if a proposal passed?**  
A: Check if `forVotes >= 50,000` (50% of total supply). Proposals auto-execute when threshold is reached.

# OP Atlas Registration Guide

This guide will help you complete the registration process for OP Atlas to become eligible for Optimism Retro Funding.

## 🔗 OP Atlas Platform

**URL:** [https://atlas.optimism.io](https://atlas.optimism.io)

---

## ✅ Prerequisites Checklist

Before registering, ensure you have:

- [x] **Contracts deployed on Base Mainnet** (an eligible OP Chain)
  - Governance Token: `0x84939fEc50EfdEDC8522917645AAfABFd5b3EA6F`
  - AzuraKillStreak Contract: `0x2cbb90a761ba64014b811be342b8ef01b471992d`
  
- [x] **Deployer address ready**
  - Address: `0x84d55c4bb3d4062f74f096fcdf58e1a9d7405d95`
  - You'll need to sign a message with this address to verify contract ownership

- [x] **GitHub repository public**
  - Repository: https://github.com/jqmwa/MentalWealthAcademy

- [ ] **Verification JSON file** (will be created during registration)

---

## 📋 Step-by-Step Registration Process

### Step 1: Initial Project Registration

1. Visit [https://atlas.optimism.io](https://atlas.optimism.io)
2. Connect your wallet
3. Click "Add Project" or "Register Project"
4. Fill in project details:
   - **Project Name:** Mental Wealth Academy
   - **Description:** The most complete citizen participation tool for an open, transparent, and democratic digital governance controlling the cyber-culture wellness research fund.
   - **Category:** Governance / DAO
   - **Website:** (if applicable)
   - **Social Links:** (Twitter, Discord, etc.)

### Step 2: Contract Verification (Contracts Step)

1. Navigate to the "Contracts" section in OP Atlas
2. Add your contracts:
   - **Governance Token (MWG)**
     - Address: `0x84939fEc50EfdEDC8522917645AAfABFd5b3EA6F`
     - Network: Base Mainnet
     - Chain ID: 8453
   
   - **AzuraKillStreak Governance Contract**
     - Address: `0x2cbb90a761ba64014b811be342b8ef01b471992d`
     - Network: Base Mainnet
     - Chain ID: 8453

3. **Verify Contract Ownership:**
   - OP Atlas will prompt you to sign a message
   - Use the deployer address: `0x84d55c4bb3d4062f74f096fcdf58e1a9d7405d95`
   - Sign the message with the wallet that deployed the contracts
   - This verifies you own the deployer address

4. **Ensure contracts are verified on BaseScan:**
   - Governance Token: Verify on [BaseScan](https://basescan.org/address/0x84939fEc50EfdEDC8522917645AAfABFd5b3EA6F)
   - AzuraKillStreak: Verify on [BaseScan](https://basescan.org/address/0x2cbb90a761ba64014b811be342b8ef01b471992d)

### Step 3: GitHub Repository Verification

1. Navigate to the "Repository" or "GitHub" section in OP Atlas
2. Enter your GitHub repository URL:
   ```
   https://github.com/jqmwa/MentalWealthAcademy
   ```

3. **OP Atlas will provide you with a unique verification identifier**
   - This will be a unique string or code
   - **IMPORTANT:** Save this identifier

4. **Add verification file to repository:**
   - OP Atlas will instruct you to add a JSON file to your repository
   - Update the `op-atlas-verification.json` file in the repository root
   - Replace `PLACEHOLDER_REPLACE_WITH_ID_FROM_OP_ATLAS` with the identifier provided by OP Atlas
   - Commit and push the file to your repository

5. **Complete verification:**
   - Return to OP Atlas and click "Verify" or "Complete Verification"
   - OP Atlas will check for the verification file in your repository
   - Once found, verification will be complete

### Step 4: Activity Requirements (Automatic)

OP Atlas will automatically check your contracts for activity requirements:
- ✅ At least 1,000 transactions (checked automatically)
- ✅ At least 420 unique addresses interacting with contracts
- ✅ Activity on at least 10 distinct days in the last 180 days

**Note:** If your contracts don't meet these requirements yet, continue building activity. These are checked automatically when evaluating retro funding eligibility.

---

## 📝 Contract Details Summary

### Deployed Contracts (Base Mainnet - Chain ID: 8453)

| Contract | Address | Type |
|----------|---------|------|
| Governance Token (MWG) | `0x84939fEc50EfdEDC8522917645AAfABFd5b3EA6F` | ERC20 Token |
| AzuraKillStreak | `0x2cbb90a761ba64014b811be342b8ef01b471992d` | Governance Contract |

### Deployer Information

- **Deployer Address:** `0x84d55c4bb3d4062f74f096fcdf58e1a9d7405d95`
- **Network:** Base Mainnet (8453)
- **Azura Agent Address:** `0x0920553CcA188871b146ee79f562B4Af46aB4f8a`

---

## 🔍 Verification Files

After completing GitHub verification in OP Atlas, update:

- **File:** `op-atlas-verification.json`
- **Location:** Repository root
- **Action:** Replace the placeholder identifier with the one provided by OP Atlas

---

## 📚 Additional Resources

- [OP Atlas Platform](https://atlas.optimism.io)
- [Retro Funding Guidelines](https://gov.optimism.io/t/retro-funding-4-onchain-builder-application-guidelines/8165)
- [BaseScan Explorer](https://basescan.org)

---

## ✅ Completion Checklist

- [ ] Project registered on OP Atlas
- [ ] Contracts added and verified (signed message with deployer)
- [ ] GitHub repository verified (verification file added)
- [ ] All verification steps completed in OP Atlas
- [ ] Project status shows as "Verified" or "Eligible" in OP Atlas

---

## 🆘 Troubleshooting

### Contract Verification Fails
- Ensure you're signing with the exact deployer address: `0x84d55c4bb3d4062f74f096fcdf58e1a9d7405d95`
- Check that contracts are verified on BaseScan
- Verify you're on the correct network (Base Mainnet)

### GitHub Verification Fails
- Ensure the verification file is in the repository root
- Check that the file is committed and pushed to the default branch (main)
- Verify the identifier matches exactly what OP Atlas provided
- Make sure the repository is public

### Activity Requirements Not Met
- These are automatically checked - no manual action needed
- Continue building activity on your contracts
- Activity is measured over the last 180 days

---

**Last Updated:** $(date)

Good luck with your OP Atlas registration! 🚀

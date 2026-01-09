# Phase 2 Revised - Multisig Admin Voting System

## 🔄 Corrected Understanding

### What We're Actually Building
A **multisig admin voting system** where:
1. User submits proposal
2. Azura AI reviews and recommends allocation
3. Proposal appears on `/voting` (transparency)
4. **Azura + 1-5 admin signers vote** on the proposal
5. When threshold reached → **USDC transfers** via Safe multisig
6. Proposal becomes "active"
7. Community voting (Phase 3)

### Key Corrections
- ❌ **NOT**: Direct token transfer from Azura's wallet
- ✅ **YES**: Multisig voting system with Safe (Gnosis Safe)
- ❌ **NOT**: Custom ERC-20 token
- ✅ **YES**: USDC stablecoin
- ❌ **NOT**: Single-click finalization
- ✅ **YES**: Multi-admin approval process

## 🏗️ New Architecture

### 1. Safe Multisig Wallet
**What**: Gnosis Safe on Base network holding USDC

**Configuration**:
- **Signers**: Azura + 1-5 human admins
- **Threshold**: Configurable (e.g., 2-of-3, 3-of-5, 4-of-6)
- **Asset**: USDC (not custom token)
- **Network**: Base mainnet/sepolia

**Why Safe**:
- Industry standard for multisig
- Battle-tested security
- Easy integration
- Transaction batching
- Gas optimization

### 2. Admin Voting System

#### Database Schema
```sql
-- Admin users table
CREATE TABLE admin_users (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  wallet_address VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Admin votes on proposals
CREATE TABLE admin_votes (
  id CHAR(36) PRIMARY KEY,
  proposal_id CHAR(36) NOT NULL,
  admin_id CHAR(36) NOT NULL,
  vote VARCHAR(20) NOT NULL, -- 'approve', 'reject'
  reasoning TEXT NULL,
  voted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (proposal_id) REFERENCES proposals(id),
  FOREIGN KEY (admin_id) REFERENCES admin_users(id),
  UNIQUE (proposal_id, admin_id)
);

-- Multisig transactions
CREATE TABLE multisig_transactions (
  id CHAR(36) PRIMARY KEY,
  proposal_id CHAR(36) NOT NULL,
  safe_address VARCHAR(255) NOT NULL,
  safe_tx_hash VARCHAR(255) NULL, -- Safe transaction hash
  blockchain_tx_hash VARCHAR(255) NULL, -- Actual blockchain TX hash
  usdc_amount VARCHAR(255) NOT NULL,
  recipient_address VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, executed, failed
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  executed_at TIMESTAMP NULL,
  FOREIGN KEY (proposal_id) REFERENCES proposals(id)
);
```

#### Voting Flow
1. Proposal approved by Azura → Status: "pending_admin_vote"
2. Azura automatically casts first vote (approve)
3. Other admins see proposal in admin dashboard
4. Each admin votes (approve/reject)
5. When threshold reached → Create Safe transaction
6. Safe transaction executed → USDC transferred
7. Proposal status → "active"

### 3. CDP Webhooks Integration

According to [CDP documentation](https://portal.cdp.coinbase.com/products/data/node?projectId=bf5a914a-4385-4dcd-a24e-08d868477043), we can use:

#### Webhooks for Real-Time Events
```typescript
// Listen for Safe transaction events
app.post('/api/webhooks/cdp', async (req, res) => {
  const event = req.body;
  
  if (event.type === 'transaction.confirmed') {
    // Update proposal status
    await updateProposalStatus(event.transactionHash);
  }
});
```

#### SQL API for On-Chain Queries
```typescript
// Query Safe transaction status
const query = `
  SELECT * FROM base.transactions
  WHERE to_address = '${SAFE_ADDRESS}'
  AND block_timestamp > NOW() - INTERVAL '1 day'
`;
```

**Benefits**:
- No manual polling needed
- Real-time updates
- Reliable event delivery
- Historical data queries

### 4. Safe SDK Integration

```bash
npm install @safe-global/protocol-kit @safe-global/api-kit
```

```typescript
// lib/safe-multisig.ts
import Safe from '@safe-global/protocol-kit';
import { EthersAdapter } from '@safe-global/protocol-kit';

class SafeMultisigManager {
  async createTransaction(
    recipientAddress: string,
    usdcAmount: bigint
  ) {
    // Create Safe transaction
    const safeTransaction = await this.safe.createTransaction({
      transactions: [{
        to: USDC_CONTRACT_ADDRESS,
        value: '0',
        data: encodeTransferData(recipientAddress, usdcAmount),
      }],
    });
    
    // Azura signs automatically
    const signedTx = await this.safe.signTransaction(safeTransaction);
    
    // Propose to other signers
    await this.apiKit.proposeTransaction({
      safeAddress: SAFE_ADDRESS,
      safeTransactionData: signedTx.data,
      safeTxHash: await this.safe.getTransactionHash(safeTransaction),
      senderAddress: AZURA_WALLET_ADDRESS,
    });
    
    return signedTx;
  }
}
```

## 🔄 Revised Flow

```
1. User submits proposal
   ↓
2. Azura AI reviews via DeepSeek
   ↓
3. If approved → Status: "pending_admin_vote"
   ↓
4. Azura automatically votes "approve"
   ↓
5. Proposal appears on /voting with:
   - Azura's recommendation
   - Token allocation %
   - Admin voting status (1/3, 2/3, etc.)
   ↓
6. Admin Dashboard shows pending proposals
   ↓
7. Admins vote (approve/reject)
   ↓
8. When threshold reached (e.g., 3/5 approvals):
   ↓
9. Create Safe multisig transaction:
   - Calculate USDC amount from %
   - Create ERC-20 transfer
   - Azura signs
   ↓
10. Other admins sign via Safe UI or API
    ↓
11. Transaction executed → USDC transferred
    ↓
12. CDP Webhook notifies backend
    ↓
13. Update proposal status → "active"
    ↓
14. User receives USDC
    ↓
15. Community voting begins (Phase 3)
```

## 📁 New File Structure

```
lib/
├── safe-multisig.ts          # Safe SDK integration
├── admin-voting.ts            # Admin vote management
├── cdp-webhooks.ts            # CDP webhook handlers
└── usdc-calculator.ts         # USDC amount calculations

app/api/
├── admin/
│   ├── vote/route.ts          # Admin voting endpoint
│   ├── proposals/route.ts     # Get proposals for voting
│   └── dashboard/route.ts     # Admin dashboard data
├── webhooks/
│   └── cdp/route.ts           # CDP webhook receiver
└── voting/proposal/[id]/
    └── execute-multisig/route.ts  # Execute Safe transaction

components/
├── admin/
│   ├── AdminDashboard.tsx     # Admin voting interface
│   ├── ProposalVoteCard.tsx   # Individual proposal voting
│   └── VoteProgress.tsx       # Vote count display
└── proposal-card/
    └── AdminVoteStatus.tsx    # Show admin vote progress

contracts/
└── test/
    └── MultisigFlow.t.sol     # Foundry tests
```

## 🔧 Implementation Steps

### Step 1: Deploy Safe Multisig
```bash
# Using Safe CLI or UI
# 1. Go to https://app.safe.global/
# 2. Create new Safe on Base
# 3. Add signers (Azura + admins)
# 4. Set threshold (e.g., 3 of 5)
# 5. Fund with USDC
```

### Step 2: Install Dependencies
```bash
npm install @safe-global/protocol-kit @safe-global/api-kit ethers@5
```

### Step 3: Configure CDP Webhooks
```typescript
// Register webhook at CDP portal
POST https://api.cdp.coinbase.com/webhooks
{
  "url": "https://your-app.com/api/webhooks/cdp",
  "events": ["transaction.confirmed", "transaction.failed"],
  "network": "base-mainnet"
}
```

### Step 4: Create Admin System
- Database migrations for admin tables
- Admin authentication
- Voting interface
- Vote tracking

### Step 5: Integrate Safe SDK
- Initialize Safe instance
- Create transactions
- Sign with Azura's key
- Propose to other signers

### Step 6: Set Up Foundry Tests
```bash
cd /Users/Home/Downloads/academyv3
forge init contracts
cd contracts
forge install safe-global/safe-contracts
```

## 🧪 Testing with Foundry

```solidity
// test/MultisigFlow.t.sol
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "@safe-global/safe-contracts/contracts/Safe.sol";

contract MultisigFlowTest is Test {
    Safe safe;
    address azura;
    address admin1;
    address admin2;
    
    function setUp() public {
        // Deploy Safe
        // Add signers
        // Fund with test USDC
    }
    
    function testProposalApprovalFlow() public {
        // 1. Create proposal
        // 2. Azura votes
        // 3. Admin1 votes
        // 4. Admin2 votes (threshold reached)
        // 5. Execute transaction
        // 6. Verify USDC transferred
    }
}
```

## 💰 USDC Calculation

```typescript
// lib/usdc-calculator.ts
export function calculateUSDCAmount(
  allocationPercentage: number,
  totalPoolUSDC: bigint
): bigint {
  // USDC has 6 decimals
  const percentage = BigInt(allocationPercentage);
  return (totalPoolUSDC * percentage) / BigInt(100);
}

// Example:
// Pool: 100,000 USDC
// Allocation: 20%
// Amount: 20,000 USDC (20000000000 with 6 decimals)
```

## 🔐 Security Considerations

### Multisig Security
- ✅ No single point of failure
- ✅ Requires multiple approvals
- ✅ Transparent on-chain
- ✅ Audited Safe contracts
- ✅ Time-locks (optional)

### Admin Security
- ✅ Admin authentication required
- ✅ Wallet signature verification
- ✅ Vote immutability
- ✅ Audit trail in database

### Webhook Security
- ✅ Verify webhook signatures
- ✅ Validate event data
- ✅ Idempotent processing
- ✅ Rate limiting

## 📊 Admin Dashboard UI

```typescript
// components/admin/AdminDashboard.tsx
export function AdminDashboard() {
  const [pendingProposals, setPendingProposals] = useState([]);
  
  return (
    <div>
      <h1>Admin Voting Dashboard</h1>
      
      {pendingProposals.map(proposal => (
        <ProposalVoteCard
          key={proposal.id}
          proposal={proposal}
          onVote={handleVote}
          currentVotes={proposal.adminVotes}
          threshold={VOTE_THRESHOLD}
        />
      ))}
    </div>
  );
}
```

## 🎯 Next Steps

1. ✅ Foundry installed
2. ⏳ Deploy Safe multisig on Base Sepolia
3. ⏳ Create admin database schema
4. ⏳ Build admin voting API
5. ⏳ Integrate Safe SDK
6. ⏳ Set up CDP webhooks
7. ⏳ Build admin dashboard UI
8. ⏳ Write Foundry tests
9. ⏳ Test complete flow on testnet
10. ⏳ Deploy to production

## 📚 Resources

- [Safe Documentation](https://docs.safe.global/)
- [Safe Protocol Kit](https://github.com/safe-global/safe-core-sdk)
- [CDP Webhooks](https://portal.cdp.coinbase.com/products/data/node)
- [Foundry Book](https://book.getfoundry.sh/)
- [USDC on Base](https://basescan.org/token/0x833589fcd6edb6e08f4c7c32d4f71b54bda02913)

---

**This is the correct architecture!** Multisig admin voting with Safe, USDC transfers, and CDP webhooks for real-time updates.

Ready to implement? Let me know and I'll start building the admin voting system!

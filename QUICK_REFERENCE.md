# Quick Reference Guide - Voting Proposal System

## 🚀 Quick Start

### For Development
```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp ENV_EXAMPLE.md .env.local
# Edit .env.local with your values

# 3. Run development server
npm run dev

# 4. Open browser
http://localhost:3000/voting
```

### For Testing
```bash
# 1. Create test proposal
Navigate to /voting/create
Connect wallet
Submit proposal

# 2. Wait for Azura review
Check /voting page (10-30 seconds)

# 3. Finalize if approved
Click "Finalize Proposal" button
Confirm in wallet

# 4. Verify transaction
Check Basescan link
```

## 📋 Project Structure

```
academyv3/
├── app/
│   ├── api/
│   │   └── voting/
│   │       ├── proposal/
│   │       │   ├── create/route.ts       # Create proposals
│   │       │   ├── review/route.ts       # Azura reviews
│   │       │   └── [id]/
│   │       │       └── finalize/route.ts # Blockchain finalization
│   │       └── proposals/route.ts        # Get all proposals
│   └── voting/
│       ├── page.tsx                      # Main voting page
│       └── create/page.tsx               # Create proposal page
├── components/
│   ├── proposal-card/
│   │   ├── ProposalCard.tsx             # Proposal display
│   │   └── FinalizeButton.tsx           # Finalization UI
│   └── proposal-stages/
│       └── ProposalStages.tsx           # 3-stage indicator
├── lib/
│   ├── azura-wallet.ts                  # Wallet management
│   ├── transaction-monitor.ts           # TX monitoring
│   └── ensureProposalSchema.ts          # DB schema
└── db/
    └── migration-proposals.sql          # SQL schema
```

## 🔑 Environment Variables

### Required (Phase 1)
```env
DATABASE_URL=...
SESSION_SECRET=...
DEEPSEEK_API_KEY=...
NEXT_PUBLIC_ALCHEMY_ID=...
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...
```

### Required (Phase 2)
```env
CDP_API_KEY_NAME=...
CDP_API_KEY_PRIVATE_KEY=...
AZURA_WALLET_ID=...
AZURA_WALLET_SEED=...
VOTING_TOKEN_CONTRACT_ADDRESS=...
```

## 📡 API Endpoints

### POST /api/voting/proposal/create
Create new proposal
```json
{
  "title": "string",
  "proposalMarkdown": "string",
  "walletAddress": "0x..."
}
```

### POST /api/voting/proposal/review
Trigger Azura review (automatic)
```json
{
  "proposalId": "uuid"
}
```

### GET /api/voting/proposals
Get all proposals with reviews

### POST /api/voting/proposal/[id]/finalize
Finalize approved proposal
```json
{
  "userWalletAddress": "0x..."
}
```

### GET /api/voting/proposal/[id]/finalize
Check finalization status

## 🎯 User Flows

### Submit Proposal
1. Go to `/voting/create`
2. Connect wallet
3. Fill title + markdown
4. Click "Submit Proposal"
5. Redirected to `/voting`

### Review Process (Automatic)
1. Azura analyzes via DeepSeek
2. Scores 6 criteria (0-10 each)
3. Approves if score >= 25/60
4. Allocates 1-40% tokens
5. Stores review in database

### Finalize Proposal
1. See approved proposal on `/voting`
2. Click "Finalize Proposal (X%)"
3. Confirm wallet connection
4. Transaction broadcasts
5. Tokens transferred on-chain
6. Status updates to "active"

## 🔍 Troubleshooting

### Proposal not appearing
```bash
# Check database
SELECT * FROM proposals ORDER BY created_at DESC;

# Check API response
curl http://localhost:3000/api/voting/proposals
```

### Azura not reviewing
```bash
# Check DEEPSEEK_API_KEY is set
echo $DEEPSEEK_API_KEY

# Check API logs
# Look for "Azura review" in console
```

### Finalization failing
```bash
# Check Azura wallet balance
# Look for wallet logs in console

# Check CDP credentials
echo $CDP_API_KEY_NAME

# Verify token contract address
echo $VOTING_TOKEN_CONTRACT_ADDRESS
```

### Transaction stuck
```bash
# Check transaction on Basescan
https://basescan.org/tx/0x...

# Check transaction monitor logs
# Should see "Checking X pending transaction(s)"

# Query database
SELECT * FROM proposal_transactions 
WHERE transaction_status = 'pending';
```

## 📊 Database Queries

### View all proposals
```sql
SELECT 
  p.title,
  p.status,
  pr.decision,
  pr.token_allocation_percentage,
  pt.transaction_hash,
  pt.transaction_status
FROM proposals p
LEFT JOIN proposal_reviews pr ON p.id = pr.proposal_id
LEFT JOIN proposal_transactions pt ON p.id = pt.proposal_id
ORDER BY p.created_at DESC;
```

### Check Azura's decisions
```sql
SELECT 
  decision,
  COUNT(*) as count,
  AVG(token_allocation_percentage) as avg_allocation
FROM proposal_reviews
GROUP BY decision;
```

### Monitor pending transactions
```sql
SELECT 
  p.title,
  pt.transaction_hash,
  pt.created_at,
  EXTRACT(EPOCH FROM (NOW() - pt.created_at))/60 as minutes_pending
FROM proposal_transactions pt
JOIN proposals p ON pt.proposal_id = p.id
WHERE pt.transaction_status = 'pending'
ORDER BY pt.created_at ASC;
```

## 🎨 Component Usage

### ProposalCard
```tsx
<ProposalCard
  id="proposal-id"
  title="Proposal Title"
  proposalMarkdown="## Content"
  status="approved"
  walletAddress="0x..."
  createdAt="2026-01-09T..."
  user={{ username: "user", avatarUrl: null }}
  review={{ decision: "approved", tokenAllocation: 20, ... }}
  onViewDetails={(id) => console.log(id)}
/>
```

### ProposalStages
```tsx
<ProposalStages
  stage1="approved"
  stage2="waiting"
  stage3="waiting"
  azuraReasoning="Well-structured proposal with clear impact."
  tokenAllocation={20}
/>
```

### FinalizeButton
```tsx
<FinalizeButton
  proposalId="uuid"
  tokenAllocation={20}
  onFinalized={() => console.log('Done!')}
/>
```

## 🔐 Security Checklist

- [ ] Never commit `.env.local`
- [ ] Store wallet seed securely
- [ ] Use testnet first
- [ ] Verify token contract address
- [ ] Monitor Azura's balance
- [ ] Set up alerts
- [ ] Implement rate limiting
- [ ] Audit smart contracts
- [ ] Test error scenarios
- [ ] Backup wallet credentials

## 📈 Performance Tips

### Optimize Database
```sql
-- Add indexes if not exists
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposal_transactions_status 
ON proposal_transactions(transaction_status);
```

### Cache Azura Balance
```typescript
// Check balance every hour instead of every call
const cachedBalance = await getCachedBalance();
```

### Batch Transaction Checks
```typescript
// Monitor checks every 10 seconds
// Adjust in transaction-monitor.ts
private checkInterval = 10000; // milliseconds
```

## 📞 Support Contacts

- **Documentation**: See `/docs` folder
- **Setup Guide**: `PHASE_2_SETUP_GUIDE.md`
- **Troubleshooting**: `PHASE_2_SETUP_GUIDE.md` (Troubleshooting section)
- **API Reference**: `PHASE_2_COMPLETE.md` (API Endpoints section)

## 🎯 Common Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Start production
npm start

# Test database connection
npm run test-db

# Check linting
npm run lint

# View logs (production)
pm2 logs

# Restart application
pm2 restart all
```

## 🏆 Success Indicators

✅ Proposals submit successfully
✅ Azura reviews within 30 seconds
✅ Approved proposals show finalize button
✅ Transactions complete on-chain
✅ Tokens received by users
✅ All 3 stages update correctly
✅ No console errors
✅ Responsive on all devices

## 🚨 Emergency Procedures

### If Azura Wallet Compromised
1. Stop the application immediately
2. Generate new wallet
3. Transfer remaining tokens to new wallet
4. Update environment variables
5. Redeploy with new credentials
6. Audit all recent transactions

### If Transaction Stuck
1. Check Base network status
2. View transaction on Basescan
3. Wait for timeout (30 minutes)
4. Transaction will auto-fail
5. User can retry finalization

### If Database Issues
1. Check connection string
2. Verify schema is up to date
3. Run migrations if needed
4. Backup database before changes
5. Test on staging first

---

**For detailed information, see the full documentation files.**

# Mental Wealth Academy - Development Roadmap

## 🗓️ This Week's Tasks

### Phase A: Foundation (2-3 hours) ⭐ **START HERE**
**Status: Ready to Begin**

- [ ] **Database Schema - Admin Voting System**
  - Create `admin_users` table
  - Create `admin_votes` table with weight tracking
  - Create `multisig_transactions` table
  - Add vote weight calculation logic
  - Write migration SQL files
  - Create `ensureAdminSchema()` function
  - Test vote aggregation queries

**Deliverables:**
- `db/migration-admin-voting.sql`
- `lib/ensureAdminSchema.ts`
- Example queries for vote counting

---

### Phase B: Core Logic (7-9 hours)

#### 2. Admin API Endpoints (4-5 hours)
**Status: Blocked by Phase A**

- [ ] `POST /api/admin/vote` - Submit admin vote with weight
- [ ] `GET /api/admin/proposals` - Get proposals pending admin votes
- [ ] `GET /api/admin/vote-status/[id]` - Check vote progress
- [ ] `POST /api/admin/execute-multisig/[id]` - Execute when threshold reached
- [ ] Admin authentication & authorization
- [ ] Vote weight calculation (Azura level = voting power)
- [ ] Threshold checking (50% total weight)

**Deliverables:**
- API routes in `app/api/admin/`
- Vote aggregation logic
- Multisig execution trigger

#### 3. CDP Webhooks (3-4 hours)
**Status: Can work in parallel**

- [ ] Set up webhook receiver endpoint
- [ ] Verify Coinbase CDP signatures
- [ ] Process transaction events
- [ ] Update database on confirmations
- [ ] Error handling & retry logic
- [ ] Test with CDP webhook simulator

**Deliverables:**
- `app/api/webhooks/cdp/route.ts`
- Webhook signature verification
- Event processing logic

---

### Phase C: Integration (12-16 hours)

#### 4. Safe Integration Library (6-8 hours)
**Status: Blocked by Phase B**

- [ ] Install & configure Safe SDK
- [ ] Initialize Safe instance (Base Sepolia testnet)
- [ ] Create multisig transaction function
- [ ] Implement signature collection
- [ ] Build transaction execution logic
- [ ] Error handling for Safe API
- [ ] Test with mock Safe wallet

**Deliverables:**
- `lib/safe-multisig.ts`
- Safe transaction creation
- Signature management
- Execution logic

#### 5. Foundry Tests (6-8 hours)
**Status: Can work in parallel with #4**

- [ ] Set up Foundry test environment
- [ ] Deploy mock Safe contracts
- [ ] Test USDC transfer logic
- [ ] Test vote weight calculations
- [ ] Test threshold mechanics (50% rule)
- [ ] Test edge cases (ties, withdrawals)
- [ ] Integration test: full proposal flow

**Deliverables:**
- `contracts/test/MultisigFlow.t.sol`
- `contracts/test/VoteWeights.t.sol`
- Test coverage report

---

### Phase D: User Interface (8-10 hours)

#### 6. Admin Dashboard UI (8-10 hours)
**Status: Blocked by Phases A, B, C**

- [ ] Admin authentication page
- [ ] Proposals list with filters
- [ ] Proposal vote card component
- [ ] Vote progress visualization
- [ ] Real-time vote counting
- [ ] Azura confidence level display
- [ ] Weight distribution chart
- [ ] Responsive design for mobile
- [ ] Loading & error states

**Deliverables:**
- `app/admin/page.tsx`
- `components/admin/AdminDashboard.tsx`
- `components/admin/ProposalVoteCard.tsx`
- `components/admin/VoteProgress.tsx`

---

## 📊 Total Estimated Time

**29-38 hours** (~4-5 full working days)

### Breakdown by Phase:
- Phase A (Foundation): 2-3 hours
- Phase B (Core Logic): 7-9 hours
- Phase C (Integration): 12-16 hours
- Phase D (UI): 8-10 hours

---

## 🎯 Success Criteria

### Week 1 Complete When:
- ✅ Database schema supports weighted voting
- ✅ Azura's level (0-4) determines vote weight
- ✅ Admin API calculates vote totals correctly
- ✅ 50% threshold triggers multisig execution
- ✅ Safe integration creates USDC transfers
- ✅ CDP webhooks monitor transactions
- ✅ Foundry tests pass
- ✅ Admin UI displays vote status
- ✅ Complete flow works on Base Sepolia testnet

---

## 🚀 Next Week (Preview)

### Phase 3: Community Voting
- Token-weighted community votes
- Voting periods & deadlines
- Results calculation
- Quadratic voting (optional)

### Production Deployment
- Deploy Safe on Base mainnet
- Fund with real USDC
- Security audit
- Monitoring & alerts

---

## 📝 Notes

### Important Decisions Made:
- **Azura's confidence = voting weight** (0%, 10%, 20%, 30%, 40%)
- **50% threshold** to pass proposals
- **USDC** as the distributed asset (not custom token)
- **Safe multisig** on Base network
- **CDP webhooks** for real-time monitoring

### Architecture:
- Frontend: Next.js 14 + TypeScript
- Backend: Next.js API routes
- Database: PostgreSQL
- Blockchain: Base (L2)
- Smart Contracts: Safe multisig
- Testing: Foundry
- Monitoring: CDP webhooks

---

## 🔗 Related Documentation

- `PHASE_2_REVISED_MULTISIG.md` - Complete architecture
- `README.md` - Project overview & voting game
- `README_VOTING_SYSTEM.md` - System documentation

---

**Updated:** January 9, 2026  
**Status:** Phase A ready to begin  
**Next Milestone:** Database schema completion (2-3 hours)

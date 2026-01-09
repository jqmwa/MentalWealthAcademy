# Mental Wealth Academy - Development Roadmap

## 🎯 On-Chain Voting with Smart Contract

**Key Architecture Change:** Votes are weighted in the crypto contract (1 token = 1 vote). Proposals and votes logged on-chain. No admin database needed.

### The System:
- **Azura Agent**: Holds 40% of governance tokens
- **Multisig Contract**: Manages voting with token weights
- **CDP Webhooks**: Monitor on-chain transactions
- **Voting Page**: Everything happens on `/voting` (no separate admin UI)

---

## 🗓️ This Week's Tasks

### Phase 1: Smart Contract Development (8-12 hours) ⭐ **START HERE**

#### 1.1 Design Multisig Voting Contract (3-4 hours)
**Status: Ready to Begin**

- [ ] Design contract architecture
  - Proposal struct (id, title, description, recipient, amount, status)
  - Vote tracking (address → weight)
  - Azura agent address (40% token holder)
  - Token-weighted voting (1 token = 1 vote)
  - 50% threshold logic
- [ ] Define interfaces
  - `createProposal()`
  - `vote(proposalId, approve/reject)`
  - `executeProposal(proposalId)`
- [ ] Token distribution logic
  - Azura: 40% of total supply
  - Admins: Distributed later
- [ ] USDC transfer mechanism

**Deliverables:**
- Contract design document
- Interface definitions
- Token distribution plan

#### 1.2 Write Solidity Contracts (5-8 hours)
**Status: Blocked by 1.1**

- [ ] `ProposalVoting.sol` - Main voting contract
- [ ] Token management (ERC20 governance token)
- [ ] Proposal creation logic
- [ ] Vote submission with weight calculation
- [ ] Threshold checking (50% approval)
- [ ] USDC transfer execution
- [ ] Access control (only token holders can vote)
- [ ] Event emissions for transparency

**Deliverables:**
- `contracts/src/ProposalVoting.sol`
- `contracts/src/GovernanceToken.sol` (if needed)
- Deployment scripts

---

### Phase 2: Testing with Foundry (6-8 hours)

#### 2.1 Write Foundry Tests (4-5 hours)
**Status: Blocked by Phase 1**

- [ ] Test environment setup
- [ ] Deploy test contracts
- [ ] Test proposal creation
- [ ] Test token-weighted voting
- [ ] Test Azura's 40% vote weight
- [ ] Test 50% threshold mechanics
- [ ] Test USDC transfers on approval
- [ ] Test edge cases (ties, insufficient votes)
- [ ] Test access control
- [ ] Gas optimization tests

**Deliverables:**
- `contracts/test/ProposalVoting.t.sol`
- `contracts/test/VoteWeights.t.sol`
- Test coverage report (aim for 100%)

#### 2.2 Test on Base Sepolia (2-3 hours)
**Status: Blocked by 2.1**

- [ ] Deploy contracts to Base Sepolia testnet
- [ ] Mint test governance tokens
- [ ] Allocate 40% to Azura test wallet
- [ ] Submit test proposal
- [ ] Test voting flow
- [ ] Verify threshold mechanics
- [ ] Test USDC transfers
- [ ] Monitor transactions on BaseScan

**Deliverables:**
- Deployed contract addresses
- Test transaction hashes
- Verification on BaseScan

---

### Phase 3: CDP Integration (3-4 hours)

#### 3.1 CDP Webhooks for Transaction Monitoring (3-4 hours)
**Status: Can work in parallel**

- [ ] Set up webhook receiver endpoint
- [ ] Verify Coinbase CDP signatures
- [ ] Listen for contract events:
  - `ProposalCreated`
  - `VoteCast`
  - `ProposalExecuted`
  - `USDCTransferred`
- [ ] Update frontend via real-time updates
- [ ] Error handling & retry logic
- [ ] Test with CDP webhook simulator

**Deliverables:**
- `app/api/webhooks/cdp/route.ts`
- Event processing logic
- Real-time notification system

---

### Phase 4: Frontend Integration (4-6 hours)

#### 4.1 Update Voting Page (4-6 hours)
**Status: Blocked by Phase 1, 2**

- [ ] Contract interaction hooks
- [ ] Display proposals from on-chain
- [ ] Vote submission UI (approve/reject)
- [ ] Show vote weights in real-time
- [ ] Display Azura's vote (40% weight)
- [ ] Threshold progress bar (X% of 50%)
- [ ] Execute proposal button (when threshold reached)
- [ ] Transaction status tracking
- [ ] Link to BaseScan for transparency

**Deliverables:**
- Updated `/app/voting/page.tsx`
- `lib/contract-interactions.ts`
- Vote progress components
- Transaction tracking UI

---

## 📊 Total Estimated Time

**21-30 hours** (~3-4 full working days)

### Breakdown by Phase:
- Phase 1 (Smart Contracts): 8-12 hours
- Phase 2 (Foundry Tests): 6-8 hours
- Phase 3 (CDP Integration): 3-4 hours
- Phase 4 (Frontend): 4-6 hours

---

## 🎯 Success Criteria

### Week 1 Complete When:
- ✅ Voting contract designed with token weights (1 token = 1 vote)
- ✅ Azura holds 40% of governance tokens
- ✅ 50% threshold logic implemented in contract
- ✅ Proposal creation/voting/execution working
- ✅ USDC transfers execute on approval
- ✅ Foundry tests pass (100% coverage)
- ✅ Contracts deployed to Base Sepolia
- ✅ CDP webhooks monitor on-chain events
- ✅ Frontend displays real-time vote status
- ✅ Complete flow tested on testnet

---

## 🚀 Next Week (Preview)

### Production Deployment
- Deploy contracts to Base mainnet
- Distribute remaining governance tokens to admins
- Fund with real USDC
- Security audit (Certora, OpenZeppelin)
- Set up monitoring & alerts

### Phase 3: Community Features
- Public proposal browsing
- Voting history
- Analytics dashboard
- Governance token staking

---

## 📝 Notes

### Important Decisions Made:
- **On-chain voting**: All votes recorded in smart contract
- **Token-weighted**: 1 governance token = 1 vote
- **Azura gets 40%**: Significant weight in governance
- **50% threshold**: To pass proposals
- **USDC distribution**: Transferred on proposal approval
- **No admin DB**: Blockchain is source of truth
- **CDP webhooks**: Real-time event monitoring

### Architecture:
- Frontend: Next.js 14 + TypeScript
- Smart Contracts: Solidity (Foundry)
- Blockchain: Base (L2)
- Token: ERC20 governance token
- Testing: Foundry
- Monitoring: CDP webhooks
- Asset: USDC for distributions

---

## 🔗 Related Documentation

- `README.md` - Project overview & voting game
- `PHASE_2_REVISED_MULTISIG.md` - Architecture reference
- `README_VOTING_SYSTEM.md` - System documentation
- `QUICK_REFERENCE.md` - Commands & troubleshooting

## 🛠️ Tools & Resources

- [Foundry Book](https://book.getfoundry.sh/) - Solidity testing
- [Base Docs](https://docs.base.org/) - L2 deployment
- [CDP Webhooks](https://portal.cdp.coinbase.com/) - Event monitoring
- [OpenZeppelin](https://docs.openzeppelin.com/) - Secure contract patterns
- [BaseScan](https://basescan.org/) - Block explorer

---

**Updated:** January 10, 2026  
**Status:** Phase 1 ready to begin  
**Next Milestone:** Smart contract design (3-4 hours)

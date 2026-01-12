# Voting Page Analysis & Next Steps

## Current State

### What's Working ✅
1. **On-Chain Data Fetching**: The page successfully fetches proposals directly from the blockchain contract
2. **Voting UI Components**: `VoteButtons`, `VoteProgressBar` are implemented
3. **Database API**: `/api/voting/proposals` endpoint exists and returns rich proposal data with:
   - User info (username, avatar)
   - Review details (Azura's reasoning, scores, token allocation)
   - Proposal markdown content
   - Status tracking (pending_review, approved, active, completed)
4. **ProposalCard Component**: Fully built component with 3-stage indicators matching the state machine
5. **On-Chain Linking**: Database tracks `on_chain_proposal_id` in `proposal_reviews` table

### What's Missing ❌

1. **Incomplete Data Source**: 
   - Page only fetches **on-chain proposals** directly from blockchain
   - Should fetch **reviewed proposals** from database (rejected or created on-chain)
   - Missing rich metadata (Azura's review reasoning, proposal markdown content)

2. **Wrong Component Used**:
   - Using basic `<div>` cards instead of `<ProposalCard>` component
   - Missing stage indicators, proposal previews, Azura reasoning
   - Should hide avatar (voting is on-chain focused)

3. **No Data Merging**:
   - Database proposals with reviews aren't being fetched
   - On-chain voting data (votes, deadline) isn't merged with database proposals
   - Can't link database proposal to on-chain proposal via `on_chain_proposal_id`

4. **Missing Features**:
   - No proposal detail view/modal
   - Can't see full proposal markdown content
   - No Azura review reasoning display

## State Machine Flow (from diagram)

**Important**: This is an **on-chain feature**. Azura reviews proposals first (Stage 1):
- Score 0 = Auto-defeated (rejected, never goes on-chain)
- Score 1-4 = Azura creates on-chain proposal with her token weight (Stage 2)
- Then community votes (Stage 3)

```
Stage 1: Azura Review (Database)
  submission → analyzing → approved (level 1-4) / rejected (level 0)

Stage 2: Blockchain (Azura creates proposal)
  approved → Azura creates on-chain proposal → transaction_confirmed

Stage 3: Community Vote (On-chain)
  transaction_confirmed → voting_active → voting_completed → passed/failed
```

**Display Logic**: Only show proposals that have been reviewed:
- **Rejected** (level 0): Show as defeated
- **Approved & Created** (level 1-4): Show with on-chain voting data

## Required Changes

### 1. Update Voting Page Data Fetching

**Current**: Only fetches from blockchain
```typescript
const onChainProposals = await fetchAllProposals(CONTRACT_ADDRESS, provider);
```

**Needed**: Fetch reviewed proposals from database, then enrich with on-chain data
```typescript
// 1. Fetch reviewed proposals from database (rejected or created on-chain)
const dbResponse = await fetch('/api/voting/proposals');
const dbProposals = await dbResponse.json();

// 2. For proposals with on_chain_proposal_id, fetch on-chain voting data
// 3. Merge the data together
```

### 2. Replace Card Component

**Current**: Basic div with minimal info
```tsx
<div className={styles.proposalCardWrapper}>
  <h3>{onChainProposal.title}</h3>
  <VoteProgressBar ... />
</div>
```

**Needed**: Use ProposalCard component
```tsx
<ProposalCard
  id={proposal.id}
  title={proposal.title}
  proposalMarkdown={proposal.proposalMarkdown}
  status={proposal.status}
  walletAddress={proposal.walletAddress}
  createdAt={proposal.createdAt}
  user={proposal.user}
  review={proposal.review}
  onViewDetails={handleViewDetails}
/>
```

### 3. Merge Database + On-Chain Data

For proposals with `status='active'`:
- Check if `review.on_chain_proposal_id` exists
- Fetch on-chain proposal data using that ID
- Merge voting data (forVotes, againstVotes, deadline) into proposal object
- Pass to ProposalCard or create enhanced card for voting

### 4. Handle Reviewed Proposals

Show only proposals that have been reviewed:
- **rejected**: Show in ProposalCard with Stage 1 = "rejected" (defeated by Azura)
- **active**: Show with voting UI (Stage 3 = "active") - merged with on-chain data
- **completed**: Show results (Stage 3 = "completed") - merged with on-chain data

### 5. Add Proposal Details View

Implement `handleViewDetails` to:
- Open modal or navigate to detail page
- Show full proposal markdown
- Show complete review reasoning
- Show voting history (if on-chain)

## Implementation Plan

### Step 1: Update Data Fetching Logic
- Fetch from `/api/voting/proposals` (database)
- For each proposal with `status='active'`, check for `on_chain_proposal_id`
- If exists, fetch on-chain data and merge
- Handle wallet connection gracefully (don't require it for viewing)

### Step 2: Replace Card Rendering
- Import `ProposalCard` component
- Map database proposals to ProposalCard props
- For active proposals, add voting UI below the card

### Step 3: Enhance Active Proposals
- Create a wrapper component that shows ProposalCard + voting UI
- Or enhance ProposalCard to accept on-chain voting data
- Show VoteButtons and VoteProgressBar for active proposals

### Step 4: Add Proposal Details
- Create modal or detail page route
- Show full proposal content, review, and voting data

## Code Structure Needed

```typescript
interface MergedProposal {
  // Database fields
  id: string;
  title: string;
  proposalMarkdown: string;
  status: 'pending_review' | 'approved' | 'rejected' | 'active' | 'completed';
  user: { username, avatarUrl };
  review: { decision, reasoning, tokenAllocation, scores, on_chain_proposal_id };
  
  // On-chain fields (if available)
  onChainData?: {
    forVotes: string;
    againstVotes: string;
    votingDeadline: number;
    azuraLevel: number;
    executed: boolean;
  };
}
```

## Next Steps Priority

1. **HIGH**: Fetch database proposals instead of only on-chain
2. **HIGH**: Use ProposalCard component
3. **MEDIUM**: Merge on-chain voting data for active proposals
4. **MEDIUM**: Add proposal details view
5. **LOW**: Add filtering/sorting by stage
6. **LOW**: Add real-time updates (polling or websockets)

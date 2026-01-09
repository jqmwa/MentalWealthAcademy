-- ============================================================================
-- Admin Voting System with Weighted Votes
-- ============================================================================
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================================

-- Admin users table - Tracks who can vote on proposals
CREATE TABLE IF NOT EXISTS admin_users (
  id CHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id CHAR(36) NOT NULL,
  wallet_address VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(100) NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Admin votes table - Stores votes with weights based on Azura's confidence level
CREATE TABLE IF NOT EXISTS admin_votes (
  id CHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  proposal_id CHAR(36) NOT NULL,
  admin_id CHAR(36) NULL, -- NULL for Azura's automatic vote
  admin_wallet_address VARCHAR(255) NULL, -- NULL for Azura
  vote VARCHAR(20) NOT NULL, -- 'approve', 'reject'
  vote_weight INTEGER NOT NULL, -- 0-40 (Azura's level determines her weight, admins get 10% each)
  reasoning TEXT NULL,
  is_azura_vote BOOLEAN NOT NULL DEFAULT false,
  voted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT valid_vote CHECK (vote IN ('approve', 'reject')),
  CONSTRAINT valid_weight CHECK (vote_weight BETWEEN 0 AND 40),
  CONSTRAINT unique_vote_per_proposal UNIQUE (proposal_id, admin_id),
  CONSTRAINT azura_or_admin CHECK (
    (is_azura_vote = true AND admin_id IS NULL AND admin_wallet_address IS NULL) OR
    (is_azura_vote = false AND admin_id IS NOT NULL AND admin_wallet_address IS NOT NULL)
  )
);

-- Multisig transactions table - Tracks Safe multisig executions
CREATE TABLE IF NOT EXISTS multisig_transactions (
  id CHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  proposal_id CHAR(36) NOT NULL,
  safe_address VARCHAR(255) NOT NULL,
  safe_tx_hash VARCHAR(255) NULL, -- Safe transaction hash (internal)
  blockchain_tx_hash VARCHAR(255) NULL, -- Actual on-chain transaction hash
  usdc_amount VARCHAR(255) NOT NULL, -- Amount in USDC (6 decimals)
  recipient_address VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, proposed, executed, failed
  threshold_reached_at TIMESTAMP NULL, -- When 50% threshold was reached
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  executed_at TIMESTAMP NULL,
  FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE,
  CONSTRAINT valid_multisig_status CHECK (status IN ('pending', 'proposed', 'executed', 'failed'))
);

-- Vote aggregation view - Makes it easy to calculate total vote weights
CREATE OR REPLACE VIEW proposal_vote_summary AS
SELECT 
  p.id as proposal_id,
  p.title,
  p.status,
  pr.token_allocation_percentage as azura_level,
  pr.decision as azura_decision,
  -- Count total approve votes
  COUNT(CASE WHEN av.vote = 'approve' THEN 1 END) as approve_count,
  -- Sum approve vote weights (includes Azura's weight)
  COALESCE(SUM(CASE WHEN av.vote = 'approve' THEN av.vote_weight ELSE 0 END), 0) as total_approve_weight,
  -- Count total reject votes
  COUNT(CASE WHEN av.vote = 'reject' THEN 1 END) as reject_count,
  -- Sum reject vote weights
  COALESCE(SUM(CASE WHEN av.vote = 'reject' THEN av.vote_weight ELSE 0 END), 0) as total_reject_weight,
  -- Check if threshold reached (50% of 100% = 50)
  CASE 
    WHEN COALESCE(SUM(CASE WHEN av.vote = 'approve' THEN av.vote_weight ELSE 0 END), 0) >= 50 THEN true
    ELSE false
  END as threshold_reached,
  -- Calculate how much more weight is needed
  GREATEST(0, 50 - COALESCE(SUM(CASE WHEN av.vote = 'approve' THEN av.vote_weight ELSE 0 END), 0)) as weight_needed,
  -- List of voters
  json_agg(
    json_build_object(
      'voter', COALESCE(au.display_name, 'Azura AI'),
      'vote', av.vote,
      'weight', av.vote_weight,
      'is_azura', av.is_azura_vote,
      'voted_at', av.voted_at
    ) ORDER BY av.voted_at ASC
  ) FILTER (WHERE av.id IS NOT NULL) as votes
FROM proposals p
LEFT JOIN proposal_reviews pr ON p.id = pr.proposal_id
LEFT JOIN admin_votes av ON p.id = av.proposal_id
LEFT JOIN admin_users au ON av.admin_id = au.id
WHERE p.status IN ('approved', 'pending_admin_vote', 'active')
GROUP BY p.id, p.title, p.status, pr.token_allocation_percentage, pr.decision;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_users_wallet ON admin_users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_admin_votes_proposal ON admin_votes(proposal_id);
CREATE INDEX IF NOT EXISTS idx_admin_votes_admin ON admin_votes(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_votes_azura ON admin_votes(is_azura_vote) WHERE is_azura_vote = true;

CREATE INDEX IF NOT EXISTS idx_multisig_transactions_proposal ON multisig_transactions(proposal_id);
CREATE INDEX IF NOT EXISTS idx_multisig_transactions_status ON multisig_transactions(status);
CREATE INDEX IF NOT EXISTS idx_multisig_transactions_safe ON multisig_transactions(safe_address);

-- Trigger to automatically update updated_at timestamp
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at 
  BEFORE UPDATE ON admin_users
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create Azura's vote when proposal is approved
CREATE OR REPLACE FUNCTION create_azura_vote()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when proposal status changes to 'approved'
  IF NEW.status = 'approved' AND OLD.status = 'pending_review' THEN
    -- Get the token allocation percentage (this is Azura's confidence level)
    DECLARE
      azura_weight INTEGER;
    BEGIN
      SELECT token_allocation_percentage INTO azura_weight
      FROM proposal_reviews
      WHERE proposal_id = NEW.id
      LIMIT 1;
      
      -- Create Azura's vote if we have a weight
      IF azura_weight IS NOT NULL AND azura_weight > 0 THEN
        INSERT INTO admin_votes (
          proposal_id,
          admin_id,
          admin_wallet_address,
          vote,
          vote_weight,
          reasoning,
          is_azura_vote
        ) VALUES (
          NEW.id,
          NULL,
          NULL,
          'approve',
          azura_weight,
          'Azura AI recommends approval based on proposal analysis',
          true
        )
        ON CONFLICT (proposal_id, admin_id) DO NOTHING;
        
        -- Update proposal status to pending admin vote
        NEW.status := 'pending_admin_vote';
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create Azura's vote automatically
DROP TRIGGER IF EXISTS trigger_create_azura_vote ON proposals;
CREATE TRIGGER trigger_create_azura_vote
  BEFORE UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION create_azura_vote();

-- Function to check if threshold is reached and update proposal status
CREATE OR REPLACE FUNCTION check_vote_threshold()
RETURNS TRIGGER AS $$
DECLARE
  total_weight INTEGER;
  prop_status VARCHAR(50);
BEGIN
  -- Calculate total approve weight for this proposal
  SELECT COALESCE(SUM(vote_weight), 0) INTO total_weight
  FROM admin_votes
  WHERE proposal_id = NEW.proposal_id
  AND vote = 'approve';
  
  -- Get current proposal status
  SELECT status INTO prop_status
  FROM proposals
  WHERE id = NEW.proposal_id;
  
  -- If threshold reached (50%) and status is pending_admin_vote
  IF total_weight >= 50 AND prop_status = 'pending_admin_vote' THEN
    -- Update proposal status to ready for multisig
    UPDATE proposals
    SET status = 'ready_for_multisig',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.proposal_id;
    
    -- Record when threshold was reached
    UPDATE multisig_transactions
    SET threshold_reached_at = CURRENT_TIMESTAMP
    WHERE proposal_id = NEW.proposal_id
    AND threshold_reached_at IS NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check threshold after each vote
DROP TRIGGER IF EXISTS trigger_check_threshold ON admin_votes;
CREATE TRIGGER trigger_check_threshold
  AFTER INSERT ON admin_votes
  FOR EACH ROW
  EXECUTE FUNCTION check_vote_threshold();

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE multisig_transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Example Queries
-- ============================================================================

-- Get all proposals pending admin votes with current vote status
-- SELECT * FROM proposal_vote_summary WHERE status = 'pending_admin_vote';

-- Get detailed vote breakdown for a specific proposal
-- SELECT 
--   pv.*,
--   json_pretty(pv.votes) as formatted_votes
-- FROM proposal_vote_summary pv
-- WHERE proposal_id = 'YOUR_PROPOSAL_ID';

-- Check which proposals are ready for multisig execution
-- SELECT * FROM proposal_vote_summary WHERE threshold_reached = true;

-- Get admin voting history
-- SELECT 
--   au.display_name,
--   COUNT(*) as total_votes,
--   COUNT(CASE WHEN av.vote = 'approve' THEN 1 END) as approvals,
--   COUNT(CASE WHEN av.vote = 'reject' THEN 1 END) as rejections
-- FROM admin_users au
-- LEFT JOIN admin_votes av ON au.id = av.admin_id
-- GROUP BY au.id, au.display_name;

-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================

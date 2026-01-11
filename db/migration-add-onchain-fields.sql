-- ============================================================================
-- Add On-Chain Proposal Tracking Fields
-- ============================================================================
-- This migration adds fields to track on-chain proposal creation
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================================

-- Add on-chain proposal tracking to proposal_reviews table
ALTER TABLE proposal_reviews 
ADD COLUMN IF NOT EXISTS on_chain_proposal_id VARCHAR(50) NULL,
ADD COLUMN IF NOT EXISTS on_chain_tx_hash VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS on_chain_created_at TIMESTAMP NULL;

-- Add index for on-chain lookups
CREATE INDEX IF NOT EXISTS idx_proposal_reviews_onchain_id 
ON proposal_reviews(on_chain_proposal_id) 
WHERE on_chain_proposal_id IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN proposal_reviews.on_chain_proposal_id IS 'The proposal ID on the smart contract (if created on-chain)';
COMMENT ON COLUMN proposal_reviews.on_chain_tx_hash IS 'Transaction hash of the on-chain proposal creation';
COMMENT ON COLUMN proposal_reviews.on_chain_created_at IS 'Timestamp when the proposal was created on-chain';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

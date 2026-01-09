import { sqlQuery } from './db';

let schemaEnsured = false;

/**
 * Ensure admin voting schema exists in the database
 * This creates tables for weighted voting system where Azura's confidence level
 * determines her voting weight (0-40%), and admins vote to reach 50% threshold
 */
export async function ensureAdminSchema() {
  if (schemaEnsured) return;

  try {
    console.log('Ensuring admin voting schema...');

    // Admin users table
    await sqlQuery(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        wallet_address VARCHAR(255) NOT NULL UNIQUE,
        display_name VARCHAR(100) NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Admin votes table
    await sqlQuery(`
      CREATE TABLE IF NOT EXISTS admin_votes (
        id CHAR(36) PRIMARY KEY,
        proposal_id CHAR(36) NOT NULL,
        admin_id CHAR(36) NULL,
        admin_wallet_address VARCHAR(255) NULL,
        vote VARCHAR(20) NOT NULL,
        vote_weight INTEGER NOT NULL,
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
      )
    `);

    // Multisig transactions table
    await sqlQuery(`
      CREATE TABLE IF NOT EXISTS multisig_transactions (
        id CHAR(36) PRIMARY KEY,
        proposal_id CHAR(36) NOT NULL,
        safe_address VARCHAR(255) NOT NULL,
        safe_tx_hash VARCHAR(255) NULL,
        blockchain_tx_hash VARCHAR(255) NULL,
        usdc_amount VARCHAR(255) NOT NULL,
        recipient_address VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        threshold_reached_at TIMESTAMP NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        executed_at TIMESTAMP NULL,
        FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE,
        CONSTRAINT valid_multisig_status CHECK (status IN ('pending', 'proposed', 'executed', 'failed'))
      )
    `);

    // Indexes
    await sqlQuery(`CREATE INDEX IF NOT EXISTS idx_admin_users_wallet ON admin_users(wallet_address)`);
    await sqlQuery(`CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active) WHERE is_active = true`);
    await sqlQuery(`CREATE INDEX IF NOT EXISTS idx_admin_votes_proposal ON admin_votes(proposal_id)`);
    await sqlQuery(`CREATE INDEX IF NOT EXISTS idx_admin_votes_admin ON admin_votes(admin_id)`);
    await sqlQuery(`CREATE INDEX IF NOT EXISTS idx_admin_votes_azura ON admin_votes(is_azura_vote) WHERE is_azura_vote = true`);
    await sqlQuery(`CREATE INDEX IF NOT EXISTS idx_multisig_transactions_proposal ON multisig_transactions(proposal_id)`);
    await sqlQuery(`CREATE INDEX IF NOT EXISTS idx_multisig_transactions_status ON multisig_transactions(status)`);
    await sqlQuery(`CREATE INDEX IF NOT EXISTS idx_multisig_transactions_safe ON multisig_transactions(safe_address)`);

    // Trigger for updated_at
    await sqlQuery(`
      DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users
    `);
    await sqlQuery(`
      CREATE TRIGGER update_admin_users_updated_at 
        BEFORE UPDATE ON admin_users
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column()
    `);

    // Function to create Azura's automatic vote
    await sqlQuery(`
      CREATE OR REPLACE FUNCTION create_azura_vote()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.status = 'approved' AND OLD.status = 'pending_review' THEN
          DECLARE
            azura_weight INTEGER;
          BEGIN
            SELECT token_allocation_percentage INTO azura_weight
            FROM proposal_reviews
            WHERE proposal_id = NEW.id
            LIMIT 1;
            
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
              
              NEW.status := 'pending_admin_vote';
            END IF;
          END;
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    // Trigger to create Azura's vote
    await sqlQuery(`
      DROP TRIGGER IF EXISTS trigger_create_azura_vote ON proposals
    `);
    await sqlQuery(`
      CREATE TRIGGER trigger_create_azura_vote
        BEFORE UPDATE ON proposals
        FOR EACH ROW
        EXECUTE FUNCTION create_azura_vote()
    `);

    // Function to check vote threshold
    await sqlQuery(`
      CREATE OR REPLACE FUNCTION check_vote_threshold()
      RETURNS TRIGGER AS $$
      DECLARE
        total_weight INTEGER;
        prop_status VARCHAR(50);
      BEGIN
        SELECT COALESCE(SUM(vote_weight), 0) INTO total_weight
        FROM admin_votes
        WHERE proposal_id = NEW.proposal_id
        AND vote = 'approve';
        
        SELECT status INTO prop_status
        FROM proposals
        WHERE id = NEW.proposal_id;
        
        IF total_weight >= 50 AND prop_status = 'pending_admin_vote' THEN
          UPDATE proposals
          SET status = 'ready_for_multisig',
              updated_at = CURRENT_TIMESTAMP
          WHERE id = NEW.proposal_id;
          
          UPDATE multisig_transactions
          SET threshold_reached_at = CURRENT_TIMESTAMP
          WHERE proposal_id = NEW.proposal_id
          AND threshold_reached_at IS NULL;
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    // Trigger to check threshold
    await sqlQuery(`
      DROP TRIGGER IF EXISTS trigger_check_threshold ON admin_votes
    `);
    await sqlQuery(`
      CREATE TRIGGER trigger_check_threshold
        AFTER INSERT ON admin_votes
        FOR EACH ROW
        EXECUTE FUNCTION check_vote_threshold()
    `);

    // Vote summary view
    await sqlQuery(`
      CREATE OR REPLACE VIEW proposal_vote_summary AS
      SELECT 
        p.id as proposal_id,
        p.title,
        p.status,
        pr.token_allocation_percentage as azura_level,
        pr.decision as azura_decision,
        COUNT(CASE WHEN av.vote = 'approve' THEN 1 END) as approve_count,
        COALESCE(SUM(CASE WHEN av.vote = 'approve' THEN av.vote_weight ELSE 0 END), 0) as total_approve_weight,
        COUNT(CASE WHEN av.vote = 'reject' THEN 1 END) as reject_count,
        COALESCE(SUM(CASE WHEN av.vote = 'reject' THEN av.vote_weight ELSE 0 END), 0) as total_reject_weight,
        CASE 
          WHEN COALESCE(SUM(CASE WHEN av.vote = 'approve' THEN av.vote_weight ELSE 0 END), 0) >= 50 THEN true
          ELSE false
        END as threshold_reached,
        GREATEST(0, 50 - COALESCE(SUM(CASE WHEN av.vote = 'approve' THEN av.vote_weight ELSE 0 END), 0)) as weight_needed,
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
      WHERE p.status IN ('approved', 'pending_admin_vote', 'ready_for_multisig', 'active')
      GROUP BY p.id, p.title, p.status, pr.token_allocation_percentage, pr.decision
    `);

    schemaEnsured = true;
    console.log('✅ Admin voting schema ensured');
  } catch (error) {
    console.error('Error ensuring admin voting schema:', error);
    throw error;
  }
}

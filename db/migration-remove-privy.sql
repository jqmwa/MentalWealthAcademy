-- ============================================================================
-- Migration: Remove Privy and Update to Wallet-Based Authentication
-- ============================================================================
-- This migration removes privy_user_id column and updates the schema
-- to use wallet_address as the primary authentication method
-- ============================================================================

-- Remove privy_user_id column from users table
ALTER TABLE users DROP COLUMN IF EXISTS privy_user_id;

-- Drop the index on privy_user_id (if it exists)
DROP INDEX IF EXISTS idx_users_privy_user_id;

-- Update wallet_address to be NOT NULL (optional - only if you want to require it)
-- ALTER TABLE users ALTER COLUMN wallet_address SET NOT NULL;

-- Add unique constraint on wallet_address if not already exists
-- Note: This will fail if there are duplicate wallet addresses
-- You may need to clean up duplicates first
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_wallet_address_unique'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_wallet_address_unique UNIQUE (wallet_address);
  END IF;
END $$;

-- Update index on wallet_address to remove WHERE clause (make it regular index)
-- Since we're removing privy_user_id, we can make wallet_address index non-nullable
DROP INDEX IF EXISTS idx_users_wallet_address;
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- Notes:
-- 1. This migration removes privy_user_id column
-- 2. wallet_address should now be used as the primary authentication identifier
-- 3. You may want to add a unique constraint on wallet_address
-- 4. Update your application code to use wallet_address instead of privy_user_id
-- ============================================================================

-- ============================================================================
-- Voting Game Tables
-- ============================================================================
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================================

-- Games table - Each game represents a voting round
CREATE TABLE IF NOT EXISTS voting_games (
  id CHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  state VARCHAR(20) NOT NULL DEFAULT 'submission', -- 'submission', 'voting', 'revealed', 'finished'
  submission_deadline TIMESTAMP NOT NULL,
  voting_deadline TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_state CHECK (state IN ('submission', 'voting', 'revealed', 'finished'))
);

-- Game submissions table - Stores user submissions for each game
CREATE TABLE IF NOT EXISTS game_submissions (
  id CHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  game_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  image_url VARCHAR(1024) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES voting_games(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (game_id, user_id)
);

-- Game votes table - Stores votes from users
CREATE TABLE IF NOT EXISTS game_votes (
  id CHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  game_id CHAR(36) NOT NULL,
  submission_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES voting_games(id) ON DELETE CASCADE,
  FOREIGN KEY (submission_id) REFERENCES game_submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (game_id, user_id) -- Each user can only vote once per game
);

-- Azura votes table - Stores Azura's bonus votes (2 votes per game)
CREATE TABLE IF NOT EXISTS azura_votes (
  id CHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  game_id CHAR(36) NOT NULL,
  submission_id CHAR(36) NOT NULL,
  vote_count INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES voting_games(id) ON DELETE CASCADE,
  FOREIGN KEY (submission_id) REFERENCES game_submissions(id) ON DELETE CASCADE,
  UNIQUE (game_id) -- Azura can only vote once per game
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_voting_games_state ON voting_games(state);
CREATE INDEX IF NOT EXISTS idx_voting_games_deadline ON voting_games(submission_deadline);
CREATE INDEX IF NOT EXISTS idx_game_submissions_game_id ON game_submissions(game_id);
CREATE INDEX IF NOT EXISTS idx_game_submissions_user_id ON game_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_votes_game_id ON game_votes(game_id);
CREATE INDEX IF NOT EXISTS idx_game_votes_submission_id ON game_votes(submission_id);
CREATE INDEX IF NOT EXISTS idx_game_votes_user_id ON game_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_azura_votes_game_id ON azura_votes(game_id);
CREATE INDEX IF NOT EXISTS idx_azura_votes_submission_id ON azura_votes(submission_id);

-- Trigger to automatically update updated_at timestamp
DROP TRIGGER IF EXISTS update_voting_games_updated_at ON voting_games;
CREATE TRIGGER update_voting_games_updated_at 
  BEFORE UPDATE ON voting_games
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE voting_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE azura_votes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================

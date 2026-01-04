import { sqlQuery } from './db';

declare global {
  // eslint-disable-next-line no-var
  var __mwaVotingGameSchemaEnsured: boolean | undefined;
}

export async function ensureVotingGameSchema() {
  if (globalThis.__mwaVotingGameSchemaEnsured) return;

  // Voting games table
  await sqlQuery(`
    CREATE TABLE IF NOT EXISTS voting_games (
      id CHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
      state VARCHAR(20) NOT NULL DEFAULT 'submission',
      submission_deadline TIMESTAMP NOT NULL,
      voting_deadline TIMESTAMP NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT valid_state CHECK (state IN ('submission', 'voting', 'revealed', 'finished'))
    )
  `);

  // Game submissions table
  await sqlQuery(`
    CREATE TABLE IF NOT EXISTS game_submissions (
      id CHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
      game_id CHAR(36) NOT NULL,
      user_id CHAR(36) NOT NULL,
      image_url VARCHAR(1024) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES voting_games(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE (game_id, user_id)
    )
  `);

  // Game votes table
  await sqlQuery(`
    CREATE TABLE IF NOT EXISTS game_votes (
      id CHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
      game_id CHAR(36) NOT NULL,
      submission_id CHAR(36) NOT NULL,
      user_id CHAR(36) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES voting_games(id) ON DELETE CASCADE,
      FOREIGN KEY (submission_id) REFERENCES game_submissions(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE (game_id, user_id)
    )
  `);

  // Azura votes table
  await sqlQuery(`
    CREATE TABLE IF NOT EXISTS azura_votes (
      id CHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
      game_id CHAR(36) NOT NULL,
      submission_id CHAR(36) NOT NULL,
      vote_count INTEGER NOT NULL DEFAULT 2,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES voting_games(id) ON DELETE CASCADE,
      FOREIGN KEY (submission_id) REFERENCES game_submissions(id) ON DELETE CASCADE,
      UNIQUE (game_id)
    )
  `);

  // Create indexes
  try {
    await sqlQuery(`CREATE INDEX IF NOT EXISTS idx_voting_games_state ON voting_games(state)`);
    await sqlQuery(`CREATE INDEX IF NOT EXISTS idx_voting_games_deadline ON voting_games(submission_deadline)`);
    await sqlQuery(`CREATE INDEX IF NOT EXISTS idx_game_submissions_game_id ON game_submissions(game_id)`);
    await sqlQuery(`CREATE INDEX IF NOT EXISTS idx_game_submissions_user_id ON game_submissions(user_id)`);
    await sqlQuery(`CREATE INDEX IF NOT EXISTS idx_game_votes_game_id ON game_votes(game_id)`);
    await sqlQuery(`CREATE INDEX IF NOT EXISTS idx_game_votes_submission_id ON game_votes(submission_id)`);
    await sqlQuery(`CREATE INDEX IF NOT EXISTS idx_game_votes_user_id ON game_votes(user_id)`);
    await sqlQuery(`CREATE INDEX IF NOT EXISTS idx_azura_votes_game_id ON azura_votes(game_id)`);
    await sqlQuery(`CREATE INDEX IF NOT EXISTS idx_azura_votes_submission_id ON azura_votes(submission_id)`);
  } catch (err: any) {
    // Indexes might already exist, that's okay
    console.warn('Some indexes might already exist:', err?.message);
  }

  // Create trigger for updated_at (check if function exists first)
  try {
    await sqlQuery(`
      CREATE TRIGGER update_voting_games_updated_at 
        BEFORE UPDATE ON voting_games
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column()
    `);
  } catch (err: any) {
    // Trigger might already exist, that's okay
    if (!err?.message?.includes('already exists')) {
      console.warn('Could not create trigger (may already exist):', err?.message);
    }
  }

  // Enable RLS (Row Level Security)
  try {
    await sqlQuery(`ALTER TABLE voting_games ENABLE ROW LEVEL SECURITY`);
    await sqlQuery(`ALTER TABLE game_submissions ENABLE ROW LEVEL SECURITY`);
    await sqlQuery(`ALTER TABLE game_votes ENABLE ROW LEVEL SECURITY`);
    await sqlQuery(`ALTER TABLE azura_votes ENABLE ROW LEVEL SECURITY`);
  } catch (err: any) {
    // RLS might already be enabled, that's okay
    console.warn('Could not enable RLS (may already be enabled):', err?.message);
  }

  globalThis.__mwaVotingGameSchemaEnsured = true;
}

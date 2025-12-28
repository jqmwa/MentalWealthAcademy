-- PostgreSQL schema for forum + user accounts
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- Enable UUID extensions (try both for compatibility)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  privy_user_id VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NULL UNIQUE,
  wallet_address VARCHAR(255) NOT NULL,
  username VARCHAR(32) NOT NULL UNIQUE,
  avatar_url VARCHAR(1024) NULL,
  shard_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for users
CREATE INDEX IF NOT EXISTS idx_users_privy_user_id ON users(privy_user_id);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Quest completions table
CREATE TABLE IF NOT EXISTS quest_completions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  quest_id VARCHAR(255) NOT NULL,
  completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  shards_awarded INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (user_id, quest_id)
);

CREATE INDEX IF NOT EXISTS idx_quest_completions_user_id ON quest_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_quest_completions_quest_id ON quest_completions(quest_id);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  token CHAR(36) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- X accounts table
CREATE TABLE IF NOT EXISTS x_accounts (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  x_user_id VARCHAR(255) NOT NULL,
  x_username VARCHAR(255) NOT NULL,
  access_token VARCHAR(1024) NOT NULL,
  access_token_secret VARCHAR(1024) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (user_id),
  UNIQUE (x_user_id)
);

CREATE INDEX IF NOT EXISTS idx_x_accounts_user_id ON x_accounts(user_id);

CREATE TRIGGER update_x_accounts_updated_at BEFORE UPDATE ON x_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- X OAuth states table
CREATE TABLE IF NOT EXISTS x_oauth_states (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  state_token VARCHAR(255) NOT NULL UNIQUE,
  oauth_token VARCHAR(255) NULL,
  oauth_token_secret VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_x_oauth_states_state_token ON x_oauth_states(state_token);
CREATE INDEX IF NOT EXISTS idx_x_oauth_states_user_id ON x_oauth_states(user_id);

-- Forum categories table
CREATE TABLE IF NOT EXISTS forum_categories (
  id CHAR(36) PRIMARY KEY,
  slug VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(128) NOT NULL,
  description VARCHAR(512) NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Forum threads table
CREATE TABLE IF NOT EXISTS forum_threads (
  id CHAR(36) PRIMARY KEY,
  category_id CHAR(36) NOT NULL,
  author_user_id CHAR(36) NOT NULL,
  title VARCHAR(200) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES forum_categories(id) ON DELETE CASCADE,
  FOREIGN KEY (author_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_threads_category_id ON forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_threads_updated_at ON forum_threads(updated_at);

CREATE TRIGGER update_forum_threads_updated_at BEFORE UPDATE ON forum_threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Forum posts table
CREATE TABLE IF NOT EXISTS forum_posts (
  id CHAR(36) PRIMARY KEY,
  thread_id CHAR(36) NOT NULL,
  author_user_id CHAR(36) NOT NULL,
  body TEXT NOT NULL,
  attachment_url VARCHAR(1024) NULL,
  attachment_mime VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (thread_id) REFERENCES forum_threads(id) ON DELETE CASCADE,
  FOREIGN KEY (author_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_posts_thread_id ON forum_posts(thread_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON forum_posts(created_at);

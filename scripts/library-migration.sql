-- Library System Migration
-- Run this SQL to create the tables for the Sealed Library feature

-- Course chapters metadata
CREATE TABLE IF NOT EXISTS library_chapters (
  id SERIAL PRIMARY KEY,
  chapter_number INTEGER NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  theme VARCHAR(100),
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Writing prompts for each chapter
CREATE TABLE IF NOT EXISTS library_prompts (
  id SERIAL PRIMARY KEY,
  chapter_id INTEGER REFERENCES library_chapters(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  prompt_text TEXT NOT NULL,
  placeholder_text VARCHAR(255),
  min_characters INTEGER DEFAULT 100,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(chapter_id, day_number)
);

-- User progress tracking (user_id matches users.id type - TEXT/VARCHAR)
CREATE TABLE IF NOT EXISTS user_chapter_progress (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  chapter_id INTEGER REFERENCES library_chapters(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'locked',
  started_at TIMESTAMP,
  unsealed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, chapter_id)
);

-- User writing entries (user_id matches users.id type - TEXT/VARCHAR)
CREATE TABLE IF NOT EXISTS user_writings (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  chapter_id INTEGER REFERENCES library_chapters(id) ON DELETE CASCADE,
  prompt_id INTEGER REFERENCES library_prompts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  word_count INTEGER,
  shards_awarded INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_chapter_progress_user ON user_chapter_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_writings_user ON user_writings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_writings_chapter ON user_writings(chapter_id);
CREATE INDEX IF NOT EXISTS idx_library_prompts_chapter ON library_prompts(chapter_id);

import { sqlQuery } from './db';

declare global {
  // eslint-disable-next-line no-var
  var __mwaForumSchemaEnsured: boolean | undefined;
}

const DEFAULT_CATEGORIES: Array<{
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
}> = [
  {
    slug: 'general-discussion',
    name: 'General Discussion',
    description: 'General community conversation and announcements.',
    sortOrder: 10,
  },
  {
    slug: 'design',
    name: 'Design',
    description: 'UI/UX, visual design, product feedback, and inspiration.',
    sortOrder: 20,
  },
  {
    slug: 'education',
    name: 'Education',
    description: 'Learning resources, study groups, and questions.',
    sortOrder: 30,
  },
  {
    slug: 'art',
    name: 'Art',
    description: 'Creative work, sharing, critique, and collaboration.',
    sortOrder: 40,
  },
  {
    slug: 'quest-discussions',
    name: 'Quest Discussions',
    description: 'Talk about quests, progress, and strategies.',
    sortOrder: 50,
  },
  {
    slug: 'token-talk',
    name: 'Token Talk',
    description: 'Token/NFT discussions, best practices, and trends.',
    sortOrder: 60,
  },
];

export async function ensureForumSchema() {
  if (globalThis.__mwaForumSchemaEnsured) return;

  // Tables
  await sqlQuery(`
    CREATE TABLE IF NOT EXISTS users (
      id CHAR(36) PRIMARY KEY,
      username VARCHAR(32) NOT NULL UNIQUE,
      avatar_url VARCHAR(1024) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await sqlQuery(`
    CREATE TABLE IF NOT EXISTS sessions (
      id CHAR(36) PRIMARY KEY,
      user_id CHAR(36) NOT NULL,
      token CHAR(36) NOT NULL UNIQUE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_sessions_user_id (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await sqlQuery(`
    CREATE TABLE IF NOT EXISTS forum_categories (
      id CHAR(36) PRIMARY KEY,
      slug VARCHAR(64) NOT NULL UNIQUE,
      name VARCHAR(128) NOT NULL,
      description VARCHAR(512) NULL,
      sort_order INT NOT NULL DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await sqlQuery(`
    CREATE TABLE IF NOT EXISTS forum_threads (
      id CHAR(36) PRIMARY KEY,
      category_id CHAR(36) NOT NULL,
      author_user_id CHAR(36) NOT NULL,
      title VARCHAR(200) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES forum_categories(id) ON DELETE CASCADE,
      FOREIGN KEY (author_user_id) REFERENCES users(id) ON DELETE RESTRICT,
      INDEX idx_threads_category_id (category_id),
      INDEX idx_threads_updated_at (updated_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await sqlQuery(`
    CREATE TABLE IF NOT EXISTS forum_posts (
      id CHAR(36) PRIMARY KEY,
      thread_id CHAR(36) NOT NULL,
      author_user_id CHAR(36) NOT NULL,
      body TEXT NOT NULL,
      attachment_url VARCHAR(1024) NULL,
      attachment_mime VARCHAR(255) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (thread_id) REFERENCES forum_threads(id) ON DELETE CASCADE,
      FOREIGN KEY (author_user_id) REFERENCES users(id) ON DELETE RESTRICT,
      INDEX idx_posts_thread_id (thread_id),
      INDEX idx_posts_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Seed categories
  // We upsert by slug.
  for (const cat of DEFAULT_CATEGORIES) {
    await sqlQuery(
      `INSERT INTO forum_categories (id, slug, name, description, sort_order)
       VALUES (UUID(), :slug, :name, :description, :sortOrder)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         description = VALUES(description),
         sort_order = VALUES(sort_order)`,
      {
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
        sortOrder: cat.sortOrder,
      }
    );
  }

  globalThis.__mwaForumSchemaEnsured = true;
}

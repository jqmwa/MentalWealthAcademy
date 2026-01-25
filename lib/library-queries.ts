import { sqlQuery } from './db';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface Chapter {
  id: number;
  chapter_number: number;
  title: string;
  description: string;
  theme: string;
  image_url: string;
}

interface Prompt {
  id: number;
  chapter_id: number;
  day_number: number;
  prompt_text: string;
  placeholder_text: string;
  min_characters: number;
}

interface ChapterProgress {
  id: number;
  user_id: string;
  chapter_id: number;
  status: 'locked' | 'in_progress' | 'unsealed';
  started_at: string | null;
  unsealed_at: string | null;
}

interface Writing {
  id: number;
  user_id: string;
  chapter_id: number;
  prompt_id: number;
  content: string;
  word_count: number;
  shards_awarded: number;
  created_at: string;
}

// ============================================
// CHAPTER QUERIES
// ============================================

export async function getAllChapters(): Promise<Chapter[]> {
  const rows = await sqlQuery<Chapter[]>(
    `SELECT id, chapter_number, title, description, theme, image_url
     FROM library_chapters
     ORDER BY chapter_number ASC`
  );
  return rows;
}

export async function getChapterById(chapterId: number): Promise<Chapter | null> {
  const rows = await sqlQuery<Chapter[]>(
    `SELECT id, chapter_number, title, description, theme, image_url
     FROM library_chapters
     WHERE id = $1`,
    [chapterId]
  );
  return rows[0] || null;
}

export async function getChapterByNumber(chapterNumber: number): Promise<Chapter | null> {
  const rows = await sqlQuery<Chapter[]>(
    `SELECT id, chapter_number, title, description, theme, image_url
     FROM library_chapters
     WHERE chapter_number = $1`,
    [chapterNumber]
  );
  return rows[0] || null;
}

// ============================================
// PROMPT QUERIES
// ============================================

export async function getPromptsByChapter(chapterId: number): Promise<Prompt[]> {
  const rows = await sqlQuery<Prompt[]>(
    `SELECT id, chapter_id, day_number, prompt_text, placeholder_text, min_characters
     FROM library_prompts
     WHERE chapter_id = $1
     ORDER BY day_number ASC`,
    [chapterId]
  );
  return rows;
}

export async function getPromptById(promptId: number): Promise<Prompt | null> {
  const rows = await sqlQuery<Prompt[]>(
    `SELECT id, chapter_id, day_number, prompt_text, placeholder_text, min_characters
     FROM library_prompts
     WHERE id = $1`,
    [promptId]
  );
  return rows[0] || null;
}

// ============================================
// USER PROGRESS QUERIES
// ============================================

export async function getUserChapterProgress(
  userId: string,
  chapterId: number
): Promise<ChapterProgress | null> {
  const rows = await sqlQuery<ChapterProgress[]>(
    `SELECT id, user_id, chapter_id, status, started_at, unsealed_at
     FROM user_chapter_progress
     WHERE user_id = $1 AND chapter_id = $2`,
    [userId, chapterId]
  );
  return rows[0] || null;
}

export async function getAllUserProgress(userId: string): Promise<ChapterProgress[]> {
  const rows = await sqlQuery<(ChapterProgress & { chapter_number: number; title: string; theme: string })[]>(
    `SELECT ucp.id, ucp.chapter_id, ucp.status, ucp.started_at, ucp.unsealed_at,
            lc.chapter_number, lc.title, lc.theme
     FROM user_chapter_progress ucp
     JOIN library_chapters lc ON lc.id = ucp.chapter_id
     WHERE ucp.user_id = $1
     ORDER BY lc.chapter_number ASC`,
    [userId]
  );
  return rows;
}

export async function createOrUpdateChapterProgress(
  userId: string,
  chapterId: number,
  status: 'locked' | 'in_progress' | 'unsealed'
): Promise<ChapterProgress | null> {
  const now = new Date().toISOString();

  // Check if progress exists
  const existing = await getUserChapterProgress(userId, chapterId);

  if (existing) {
    // Update existing progress
    if (status === 'unsealed' && existing.status !== 'unsealed') {
      await sqlQuery(
        `UPDATE user_chapter_progress
         SET status = $1, unsealed_at = $2
         WHERE user_id = $3 AND chapter_id = $4`,
        [status, now, userId, chapterId]
      );
    } else {
      await sqlQuery(
        `UPDATE user_chapter_progress
         SET status = $1
         WHERE user_id = $2 AND chapter_id = $3`,
        [status, userId, chapterId]
      );
    }
  } else {
    // Create new progress
    const startedAt = status !== 'locked' ? now : null;
    const unsealedAt = status === 'unsealed' ? now : null;

    await sqlQuery(
      `INSERT INTO user_chapter_progress (user_id, chapter_id, status, started_at, unsealed_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, chapterId, status, startedAt, unsealedAt]
    );
  }

  return getUserChapterProgress(userId, chapterId);
}

export async function unlockFirstChapter(userId: string): Promise<ChapterProgress | null> {
  // Get chapter 1
  const chapter1 = await getChapterByNumber(1);
  if (!chapter1) return null;

  // Check if already has progress
  const existing = await getUserChapterProgress(userId, chapter1.id);
  if (existing) return existing;

  // Create unlocked progress for chapter 1
  return createOrUpdateChapterProgress(userId, chapter1.id, 'in_progress');
}

// ============================================
// WRITING QUERIES
// ============================================

export async function getUserWritings(
  userId: string,
  chapterId?: number
): Promise<(Writing & { day_number: number; prompt_text: string })[]> {
  if (chapterId) {
    const rows = await sqlQuery<(Writing & { day_number: number; prompt_text: string })[]>(
      `SELECT uw.id, uw.chapter_id, uw.prompt_id, uw.content, uw.word_count,
              uw.shards_awarded, uw.created_at,
              lp.day_number, lp.prompt_text
       FROM user_writings uw
       JOIN library_prompts lp ON lp.id = uw.prompt_id
       WHERE uw.user_id = $1 AND uw.chapter_id = $2
       ORDER BY lp.day_number ASC`,
      [userId, chapterId]
    );
    return rows;
  }

  const rows = await sqlQuery<(Writing & { day_number: number; prompt_text: string; chapter_number: number; chapter_title: string })[]>(
    `SELECT uw.id, uw.chapter_id, uw.prompt_id, uw.content, uw.word_count,
            uw.shards_awarded, uw.created_at,
            lp.day_number, lp.prompt_text,
            lc.chapter_number, lc.title as chapter_title
     FROM user_writings uw
     JOIN library_prompts lp ON lp.id = uw.prompt_id
     JOIN library_chapters lc ON lc.id = uw.chapter_id
     WHERE uw.user_id = $1
     ORDER BY uw.created_at DESC`,
    [userId]
  );
  return rows;
}

export async function getWritingByPrompt(
  userId: string,
  promptId: number
): Promise<Writing | null> {
  const rows = await sqlQuery<Writing[]>(
    `SELECT id, chapter_id, prompt_id, content, word_count, shards_awarded, created_at
     FROM user_writings
     WHERE user_id = $1 AND prompt_id = $2`,
    [userId, promptId]
  );
  return rows[0] || null;
}

export async function getWritingsCountForChapter(
  userId: string,
  chapterId: number
): Promise<number> {
  const rows = await sqlQuery<{ count: string }[]>(
    `SELECT COUNT(*) as count
     FROM user_writings
     WHERE user_id = $1 AND chapter_id = $2`,
    [userId, chapterId]
  );
  return parseInt(rows[0]?.count || '0', 10);
}

export async function createWriting(
  userId: string,
  chapterId: number,
  promptId: number,
  content: string,
  shardsAwarded: number = 10
): Promise<Writing> {
  const wordCount = content.trim().split(/\s+/).filter((w: string) => w.length > 0).length;

  const rows = await sqlQuery<Writing[]>(
    `INSERT INTO user_writings (user_id, chapter_id, prompt_id, content, word_count, shards_awarded)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, chapter_id, prompt_id, content, word_count, shards_awarded, created_at`,
    [userId, chapterId, promptId, content, wordCount, shardsAwarded]
  );

  return rows[0];
}

// ============================================
// COMPOSITE QUERIES
// ============================================

interface ProgressRow {
  chapter_id: number;
  status: string;
  started_at: string | null;
  unsealed_at: string | null;
}

interface WritingCountRow {
  chapter_id: number;
  count: string;
}

export async function getChaptersWithProgress(userId: string) {
  // Get all chapters
  const chapters = await getAllChapters();

  // Get user progress for all chapters
  const progressRows = await sqlQuery<ProgressRow[]>(
    `SELECT chapter_id, status, started_at, unsealed_at
     FROM user_chapter_progress
     WHERE user_id = $1`,
    [userId]
  );
  const progressMap = new Map(progressRows.map((p) => [p.chapter_id, p]));

  // Get writing counts per chapter
  const writingCountRows = await sqlQuery<WritingCountRow[]>(
    `SELECT chapter_id, COUNT(*) as count
     FROM user_writings
     WHERE user_id = $1
     GROUP BY chapter_id`,
    [userId]
  );
  const writingCounts = new Map(writingCountRows.map((w) => [w.chapter_id, parseInt(w.count, 10)]));

  // Combine data
  return chapters.map((chapter, index) => {
    const progress = progressMap.get(chapter.id);
    const writingsCompleted = writingCounts.get(chapter.id) || 0;

    // Determine if chapter should be available
    // Chapter 1 is always at least "in_progress" for any user
    // Other chapters require previous chapter to be unsealed
    let status = progress?.status || 'locked';

    if (index === 0 && status === 'locked') {
      // Auto-unlock chapter 1
      status = 'in_progress';
    }

    return {
      ...chapter,
      status,
      writingsCompleted,
      totalWritings: 7,
      startedAt: progress?.started_at,
      unsealedAt: progress?.unsealed_at,
    };
  });
}

export async function getCurrentPromptForChapter(
  userId: string,
  chapterId: number
): Promise<Prompt | null> {
  // Get all prompts for this chapter
  const prompts = await getPromptsByChapter(chapterId);

  // Get user's completed writings for this chapter
  const writings = await getUserWritings(userId, chapterId);
  const completedPromptIds = new Set(writings.map((w) => w.prompt_id));

  // Find first incomplete prompt
  for (const prompt of prompts) {
    if (!completedPromptIds.has(prompt.id)) {
      return prompt;
    }
  }

  // All prompts completed
  return null;
}

export async function checkAndUnsealNextChapter(
  userId: string,
  chapterId: number
): Promise<{ unsealed: boolean; nextChapter: Chapter | null }> {
  // Count writings for this chapter
  const writingsCount = await getWritingsCountForChapter(userId, chapterId);

  if (writingsCount >= 7) {
    // Mark current chapter as unsealed
    await createOrUpdateChapterProgress(userId, chapterId, 'unsealed');

    // Get current chapter to find next
    const currentChapter = await getChapterById(chapterId);
    if (!currentChapter) return { unsealed: true, nextChapter: null };

    // Get next chapter
    const nextChapter = await getChapterByNumber(currentChapter.chapter_number + 1);

    if (nextChapter) {
      // Unlock next chapter
      await createOrUpdateChapterProgress(userId, nextChapter.id, 'in_progress');
      return { unsealed: true, nextChapter };
    }

    return { unsealed: true, nextChapter: null };
  }

  return { unsealed: false, nextChapter: null };
}

// ============================================
// SHARD REWARD HELPERS
// ============================================

export async function awardShardsForWriting(userId: string, amount: number = 10): Promise<void> {
  await sqlQuery(
    `UPDATE users
     SET shard_count = COALESCE(shard_count, 0) + $1
     WHERE id = $2`,
    [amount, userId]
  );
}

export async function awardShardsForUnseal(userId: string, amount: number = 50): Promise<void> {
  await sqlQuery(
    `UPDATE users
     SET shard_count = COALESCE(shard_count, 0) + $1
     WHERE id = $2`,
    [amount, userId]
  );
}

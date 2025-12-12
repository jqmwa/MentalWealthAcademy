import { NextResponse } from 'next/server';
import { ensureForumSchema } from '@/lib/ensureForumSchema';
import { isDbConfigured, sqlQuery } from '@/lib/db';
import { demoCategories, demoThreadById } from '@/lib/forumDemo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { threadId: string } }
) {
  if (!isDbConfigured()) {
    const demo = demoThreadById(params.threadId);
    if (!demo) {
      return NextResponse.json({ error: 'Thread not found.' }, { status: 404 });
    }

    const category =
      demoCategories.find((c) => c.slug === demo.categorySlug) || null;

    return NextResponse.json({
      dbConfigured: false,
      demo: true,
      thread: {
        id: demo.id,
        title: demo.title,
        createdAt: demo.createdAt,
        updatedAt: demo.updatedAt,
        category: {
          slug: demo.categorySlug,
          name: category?.name || demo.categorySlug,
        },
        author: demo.author,
      },
      posts: demo.posts,
    });
  }

  await ensureForumSchema();

  const threadId = params.threadId;

  const threadRows = await sqlQuery<
    Array<{
      id: string;
      title: string;
      created_at: string;
      updated_at: string;
      category_slug: string;
      category_name: string;
      author_username: string;
      author_avatar_url: string | null;
    }>
  >(
    `SELECT t.id,
            t.title,
            t.created_at,
            t.updated_at,
            c.slug AS category_slug,
            c.name AS category_name,
            u.username AS author_username,
            u.avatar_url AS author_avatar_url
     FROM forum_threads t
     JOIN forum_categories c ON c.id = t.category_id
     JOIN users u ON u.id = t.author_user_id
     WHERE t.id = :threadId
     LIMIT 1`,
    { threadId }
  );

  const thread = threadRows[0];
  if (!thread) {
    return NextResponse.json({ error: 'Thread not found.' }, { status: 404 });
  }

  const posts = await sqlQuery<
    Array<{
      id: string;
      body: string;
      attachment_url: string | null;
      attachment_mime: string | null;
      created_at: string;
      author_username: string;
      author_avatar_url: string | null;
    }>
  >(
    `SELECT p.id,
            p.body,
            p.attachment_url,
            p.attachment_mime,
            p.created_at,
            u.username AS author_username,
            u.avatar_url AS author_avatar_url
     FROM forum_posts p
     JOIN users u ON u.id = p.author_user_id
     WHERE p.thread_id = :threadId
     ORDER BY p.created_at ASC`,
    { threadId }
  );

  return NextResponse.json({
    thread: {
      id: thread.id,
      title: thread.title,
      createdAt: thread.created_at,
      updatedAt: thread.updated_at,
      category: { slug: thread.category_slug, name: thread.category_name },
      author: { username: thread.author_username, avatarUrl: thread.author_avatar_url },
    },
    posts: posts.map((p) => ({
      id: p.id,
      body: p.body,
      attachmentUrl: p.attachment_url,
      attachmentMime: p.attachment_mime,
      createdAt: p.created_at,
      author: { username: p.author_username, avatarUrl: p.author_avatar_url },
    })),
  });
}

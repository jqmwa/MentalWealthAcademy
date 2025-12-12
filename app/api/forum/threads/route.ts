import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { ensureForumSchema } from '@/lib/ensureForumSchema';
import { getCurrentUserFromRequestCookie } from '@/lib/auth';
import { getPool, isDbConfigured, sqlQuery } from '@/lib/db';
import { demoThreadsForCategory } from '@/lib/forumDemo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!isDbConfigured()) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    if (!category) {
      return NextResponse.json({ error: 'Missing category.' }, { status: 400 });
    }

    return NextResponse.json(
      {
        dbConfigured: false,
        demo: true,
        threads: demoThreadsForCategory(category).map((t) => ({
          id: t.id,
          title: t.title,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
          author: t.author,
          posts: t.posts.length,
        })),
      },
      { status: 200 }
    );
  }
  await ensureForumSchema();

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  if (!category) {
    return NextResponse.json({ error: 'Missing category.' }, { status: 400 });
  }

  const threads = await sqlQuery<
    Array<{
      id: string;
      title: string;
      created_at: string;
      updated_at: string;
      author_username: string;
      author_avatar_url: string | null;
      posts: number;
    }>
  >(
    `SELECT t.id,
            t.title,
            t.created_at,
            t.updated_at,
            u.username AS author_username,
            u.avatar_url AS author_avatar_url,
            COUNT(p.id) AS posts
     FROM forum_threads t
     JOIN forum_categories c ON c.id = t.category_id
     JOIN users u ON u.id = t.author_user_id
     LEFT JOIN forum_posts p ON p.thread_id = t.id
     WHERE c.slug = :slug
     GROUP BY t.id
     ORDER BY t.updated_at DESC`,
    { slug: category }
  );

  return NextResponse.json({
    threads: threads.map((t) => ({
      id: t.id,
      title: t.title,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
      author: {
        username: t.author_username,
        avatarUrl: t.author_avatar_url,
      },
      posts: Number(t.posts || 0),
    })),
  });
}

function isNonEmptyString(value: unknown, maxLen: number) {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maxLen;
}

export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: 'Database is not configured on the server.' },
      { status: 503 }
    );
  }
  await ensureForumSchema();

  const user = await getCurrentUserFromRequestCookie();
  if (!user) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const categorySlug = body?.categorySlug;
  const title = body?.title;
  const postBody = body?.body;
  const attachmentUrl = typeof body?.attachmentUrl === 'string' ? body.attachmentUrl : null;
  const attachmentMime = typeof body?.attachmentMime === 'string' ? body.attachmentMime : null;

  if (!isNonEmptyString(categorySlug, 64)) {
    return NextResponse.json({ error: 'Invalid categorySlug.' }, { status: 400 });
  }

  if (!isNonEmptyString(title, 200)) {
    return NextResponse.json({ error: 'Invalid title.' }, { status: 400 });
  }

  if (!isNonEmptyString(postBody, 10_000)) {
    return NextResponse.json({ error: 'Post body is required.' }, { status: 400 });
  }

  const pool = getPool();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [catRows] = (await conn.query(
      `SELECT id FROM forum_categories WHERE slug = :slug LIMIT 1`,
      { slug: String(categorySlug).trim() }
    )) as unknown as [Array<{ id: string }>, unknown];

    const categoryId = catRows[0]?.id;
    if (!categoryId) {
      await conn.rollback();
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    }

    const threadId = uuidv4();
    await conn.query(
      `INSERT INTO forum_threads (id, category_id, author_user_id, title)
       VALUES (:id, :categoryId, :authorUserId, :title)`,
      {
        id: threadId,
        categoryId,
        authorUserId: user.id,
        title: String(title).trim(),
      }
    );

    const postId = uuidv4();
    await conn.query(
      `INSERT INTO forum_posts (id, thread_id, author_user_id, body, attachment_url, attachment_mime)
       VALUES (:id, :threadId, :authorUserId, :body, :attachmentUrl, :attachmentMime)`,
      {
        id: postId,
        threadId,
        authorUserId: user.id,
        body: String(postBody).trim(),
        attachmentUrl,
        attachmentMime,
      }
    );

    await conn.commit();

    return NextResponse.json({ ok: true, threadId });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

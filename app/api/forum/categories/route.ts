import { NextResponse } from 'next/server';
import { ensureForumSchema } from '@/lib/ensureForumSchema';
import { isDbConfigured, sqlQuery } from '@/lib/db';
import { demoCategories, demoCategoryStats } from '@/lib/forumDemo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isDbConfigured()) {
    const { threadsByCat, postsByCat } = demoCategoryStats();
    return NextResponse.json(
      {
        dbConfigured: false,
        demo: true,
        categories: demoCategories
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((c) => ({
            id: `demo-${c.slug}`,
            slug: c.slug,
            name: c.name,
            description: c.description,
            sortOrder: c.sortOrder,
            threads: threadsByCat.get(c.slug) || 0,
            posts: postsByCat.get(c.slug) || 0,
          })),
      },
      { status: 200 }
    );
  }
  await ensureForumSchema();

  const categories = await sqlQuery<
    Array<{
      id: string;
      slug: string;
      name: string;
      description: string | null;
      sort_order: number;
      threads: number;
      posts: number;
    }>
  >(
    `SELECT c.id,
            c.slug,
            c.name,
            c.description,
            c.sort_order,
            COUNT(DISTINCT t.id) AS threads,
            COUNT(p.id) AS posts
     FROM forum_categories c
     LEFT JOIN forum_threads t ON t.category_id = c.id
     LEFT JOIN forum_posts p ON p.thread_id = t.id
     GROUP BY c.id
     ORDER BY c.sort_order ASC, c.name ASC`
  );

  return NextResponse.json({
    categories: categories.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
      sortOrder: c.sort_order,
      threads: Number(c.threads || 0),
      posts: Number(c.posts || 0),
    })),
  });
}

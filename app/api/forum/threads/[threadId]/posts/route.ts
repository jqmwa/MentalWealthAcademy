import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { ensureForumSchema } from '@/lib/ensureForumSchema';
import { getCurrentUserFromRequestCookie } from '@/lib/auth';
import { sqlQuery } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isNonEmptyString(value: unknown, maxLen: number) {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maxLen;
}

export async function POST(
  request: Request,
  { params }: { params: { threadId: string } }
) {
  await ensureForumSchema();

  const user = await getCurrentUserFromRequestCookie();
  if (!user) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }

  const threadId = params.threadId;

  const thread = await sqlQuery<Array<{ id: string }>>(
    `SELECT id FROM forum_threads WHERE id = :threadId LIMIT 1`,
    { threadId }
  );
  if (!thread[0]) {
    return NextResponse.json({ error: 'Thread not found.' }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const postBody = body?.body;
  const attachmentUrl = typeof body?.attachmentUrl === 'string' ? body.attachmentUrl : null;
  const attachmentMime = typeof body?.attachmentMime === 'string' ? body.attachmentMime : null;

  if (!isNonEmptyString(postBody, 10_000)) {
    return NextResponse.json({ error: 'Post body is required.' }, { status: 400 });
  }

  const postId = uuidv4();
  await sqlQuery(
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

  // Bump thread updated_at for ordering
  await sqlQuery(`UPDATE forum_threads SET updated_at = NOW() WHERE id = :threadId`, { threadId });

  return NextResponse.json({ ok: true, postId });
}

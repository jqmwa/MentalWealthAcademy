'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Navbar from '@/components/navbar/Navbar';
import styles from './page.module.css';

type MeResponse = { user: { id: string; username: string; avatarUrl: string | null } | null };

type ThreadResponse = {
  thread: {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    category: { slug: string; name: string };
    author: { username: string; avatarUrl: string | null };
  };
  posts: Array<{
    id: string;
    body: string;
    attachmentUrl: string | null;
    attachmentMime: string | null;
    createdAt: string;
    author: { username: string; avatarUrl: string | null };
  }>;
};

async function uploadIfPresent(file: File | null) {
  if (!file) return null;
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || 'Upload failed');
  }
  return (await res.json()) as { url: string; mime: string };
}

export default function ForumThreadPage({
  params,
}: {
  params: { categorySlug: string; threadId: string };
}) {
  const { categorySlug, threadId } = params;

  const [me, setMe] = useState<MeResponse['user']>(null);
  const [data, setData] = useState<ThreadResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [replyBody, setReplyBody] = useState('');
  const [replyAttachment, setReplyAttachment] = useState<File | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [meRes, threadRes] = await Promise.all([
        fetch('/api/me', { cache: 'no-store' }),
        fetch(`/api/forum/threads/${encodeURIComponent(threadId)}`, { cache: 'no-store' }),
      ]);

      const meData = (await meRes.json()) as MeResponse;
      const threadData = (await threadRes.json()) as ThreadResponse;

      setMe(meData.user);
      if ((threadData as any)?.error) throw new Error((threadData as any).error);
      setData(threadData);
    } catch (e: any) {
      setError(e?.message || 'Failed to load thread');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  async function handleReply() {
    setError(null);
    try {
      const uploaded = await uploadIfPresent(replyAttachment);

      const res = await fetch(`/api/forum/threads/${encodeURIComponent(threadId)}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: replyBody,
          attachmentUrl: uploaded?.url ?? null,
          attachmentMime: uploaded?.mime ?? null,
        }),
      });

      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out?.error || 'Failed to post reply');

      setReplyBody('');
      setReplyAttachment(null);
      await refresh();
    } catch (e: any) {
      setError(e?.message || 'Failed to post reply');
    }
  }

  const thread = data?.thread;

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{thread?.title || 'Thread'}</h1>
            {thread && (
              <div className={styles.meta}>
                In{' '}
                <Link href={`/forum/${thread.category.slug}`}>{thread.category.name}</Link> • started by{' '}
                {thread.author.username}
              </div>
            )}
          </div>
          <Link className={`${styles.button} ${styles.buttonSecondary}`} href={`/forum/${categorySlug}`}>
            Back
          </Link>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.panel}>
          {loading && <div style={{ opacity: 0.7 }}>Loading…</div>}

          {!loading && data && (
            <div className={styles.postList}>
              {data.posts.map((p) => (
                <div key={p.id} className={styles.post}>
                  <div className={styles.postHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {p.author.avatarUrl ? (
                        <Image
                          src={p.author.avatarUrl}
                          alt={p.author.username}
                          width={22}
                          height={22}
                          style={{ borderRadius: 999 }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 999,
                            background: 'rgba(81, 104, 255, 0.2)',
                          }}
                        />
                      )}
                      <span>{p.author.username}</span>
                    </div>
                    <div>{new Date(p.createdAt).toLocaleString()}</div>
                  </div>

                  <div className={styles.postBody}>{p.body}</div>

                  {p.attachmentUrl && (
                    <div className={styles.attachment}>
                      <Image
                        src={p.attachmentUrl}
                        alt="Attachment"
                        width={1000}
                        height={600}
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {me ? (
          <div className={styles.panel} style={{ marginTop: 14 }}>
            <div style={{ fontWeight: 700 }}>Reply as {me.username}</div>
            <div className={styles.formRow}>
              <textarea
                className={styles.textarea}
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Write a reply…"
              />
              <input
                className={styles.input}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                onChange={(e) => setReplyAttachment(e.target.files?.[0] || null)}
              />
              <div className={styles.actions}>
                <button className={styles.button} type="button" onClick={handleReply}>
                  Post reply
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.panel} style={{ marginTop: 14, opacity: 0.8 }}>
            Create an account (Home page) to reply.
          </div>
        )}
      </div>
    </>
  );
}

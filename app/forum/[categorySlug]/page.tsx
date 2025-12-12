'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar/Navbar';
import styles from './page.module.css';

type MeResponse = { user: { id: string; username: string; avatarUrl: string | null } | null };

type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  threads: number;
  posts: number;
};

type Thread = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  posts: number;
  author: { username: string; avatarUrl: string | null };
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

export default function ForumCategoryPage({ params }: { params: { categorySlug: string } }) {
  const router = useRouter();
  const categorySlug = params.categorySlug;

  const [me, setMe] = useState<MeResponse['user']>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // new thread
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);

  const category = useMemo(
    () => categories.find((c) => c.slug === categorySlug) || null,
    [categories, categorySlug]
  );

  async function refreshAll() {
    setLoading(true);
    setError(null);
    try {
      const [meRes, catRes, threadsRes] = await Promise.all([
        fetch('/api/me', { cache: 'no-store' }),
        fetch('/api/forum/categories', { cache: 'no-store' }),
        fetch(`/api/forum/threads?category=${encodeURIComponent(categorySlug)}`, {
          cache: 'no-store',
        }),
      ]);

      const meData = (await meRes.json()) as MeResponse;
      const catData = await catRes.json();
      const threadsData = await threadsRes.json();

      setMe(meData.user);
      setCategories(Array.isArray(catData?.categories) ? catData.categories : []);
      setThreads(Array.isArray(threadsData?.threads) ? threadsData.threads : []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load forum data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySlug]);

  async function handleCreateThread() {
    setError(null);
    try {
      const uploaded = await uploadIfPresent(attachment);

      const res = await fetch('/api/forum/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categorySlug,
          title,
          body,
          attachmentUrl: uploaded?.url ?? null,
          attachmentMime: uploaded?.mime ?? null,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to create thread');

      const threadId = data?.threadId as string | undefined;
      if (threadId) {
        router.push(`/forum/${categorySlug}/${threadId}`);
        return;
      }

      await refreshAll();
    } catch (e: any) {
      setError(e?.message || 'Failed to create thread');
    }
  }

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{category?.name || categorySlug}</h1>
            {category?.description && <p className={styles.subtitle}>{category.description}</p>}
          </div>
          <Link className={`${styles.button} ${styles.buttonSecondary}`} href="/forum">
            Back to forum
          </Link>
        </div>

        {!me && (
          <div className={styles.panel} style={{ opacity: 0.85 }}>
            Create an account from the forum profile banner to post.
          </div>
        )}

        {me && (
          <div className={styles.panel}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 700 }}>Start a new thread</div>
                <div style={{ opacity: 0.75 }}>Posting as {me.username}</div>
              </div>
            </div>
            <div className={styles.formRow}>
              <input
                className={styles.input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Thread title"
              />
              <textarea
                className={styles.textarea}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write the first post…"
              />
              <input
                className={styles.input}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                onChange={(e) => setAttachment(e.target.files?.[0] || null)}
              />
              <div className={styles.actions}>
                <button className={styles.button} type="button" onClick={handleCreateThread}>
                  Post thread
                </button>
              </div>
            </div>
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.threadList}>
          {loading && <div style={{ opacity: 0.7 }}>Loading threads…</div>}
          {!loading && threads.length === 0 && <div style={{ opacity: 0.7 }}>No threads yet.</div>}
          {!loading &&
            threads.map((t) => (
              <Link key={t.id} className={styles.threadItem} href={`/forum/${categorySlug}/${t.id}`}>
                <div className={styles.threadTitle}>{t.title}</div>
                <div className={styles.threadMeta}>
                  {t.posts} posts • by {t.author.username}
                </div>
              </Link>
            ))}
        </div>
      </div>
    </>
  );
}

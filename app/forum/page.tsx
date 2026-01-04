'use client';

/* eslint-disable @next/next/no-img-element */

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import Navbar from '@/components/navbar/Navbar';
import { AccountBanner } from '@/components/forum/AccountBanner';
import { Footer } from '@/components/footer/Footer';
import styles from './page.module.css';

type MeResponse = { user: { id: string; username: string; avatarUrl: string | null } | null };

type Thread = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  posts: number;
  author: { username: string; avatarUrl: string | null };
  category: { slug: string; name: string };
};

type Post = {
  id: string;
  body: string;
  attachmentUrl: string | null;
  attachmentMime: string | null;
  createdAt: string;
  author: { username: string; avatarUrl: string | null };
};

type ThreadData = {
  thread: {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    category: { slug: string; name: string };
    author: { username: string; avatarUrl: string | null };
  };
  posts: Post[];
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

export default function Forum() {
  const [me, setMe] = useState<MeResponse['user']>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [categories, setCategories] = useState<Array<{ slug: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [selectedThreadData, setSelectedThreadData] = useState<ThreadData | null>(null);
  const [loadingThread, setLoadingThread] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // new thread
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);

  // reply to selected thread
  const [replyBody, setReplyBody] = useState('');
  const [replyAttachment, setReplyAttachment] = useState<File | null>(null);

  async function refreshAll() {
    setLoading(true);
    setError(null);
    try {
      const [meRes, catRes, threadsRes] = await Promise.all([
        fetch('/api/me', { cache: 'no-store' }),
        fetch('/api/forum/categories', { cache: 'no-store' }),
        fetch('/api/forum/threads', { cache: 'no-store' }),
      ]);

      const meData = (await meRes.json()) as MeResponse;
      const catData = await catRes.json();
      const threadsData = await threadsRes.json();

      setMe(meData.user);
      setCategories(Array.isArray(catData?.categories) ? catData.categories.map((c: any) => ({ slug: c.slug, name: c.name })) : []);
      setThreads(Array.isArray(threadsData?.threads) ? threadsData.threads : []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load forum data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshAll();
  }, []);

  const loadThread = useCallback(async (threadId: string) => {
    setLoadingThread(true);
    setError(null);
    try {
      const res = await fetch(`/api/forum/threads/${encodeURIComponent(threadId)}`, {
        cache: 'no-store',
      });
      const data = (await res.json()) as ThreadData;
      if ((data as any)?.error) throw new Error((data as any).error);
      setSelectedThreadData(data);
      setSelectedThreadId(threadId);
    } catch (e: any) {
      setError(e?.message || 'Failed to load thread');
    } finally {
      setLoadingThread(false);
    }
  }, []);

  async function handleCreateThread() {
    if (!selectedCategory) {
      setError('Please select a category first');
      return;
    }
    setError(null);
    try {
      const uploaded = await uploadIfPresent(attachment);

      const res = await fetch('/api/forum/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categorySlug: selectedCategory,
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
        setTitle('');
        setBody('');
        setAttachment(null);
        await refreshAll();
        await loadThread(threadId);
        return;
      }

      await refreshAll();
    } catch (e: any) {
      setError(e?.message || 'Failed to create thread');
    }
  }

  async function handleReply() {
    if (!selectedThreadId) return;
    setError(null);
    try {
      const uploaded = await uploadIfPresent(replyAttachment);

      const res = await fetch(`/api/forum/threads/${encodeURIComponent(selectedThreadId)}/posts`, {
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
      await loadThread(selectedThreadId);
      await refreshAll();
    } catch (e: any) {
      setError(e?.message || 'Failed to post reply');
    }
  }

  const filteredThreads = selectedCategory
    ? threads.filter((t) => t.category.slug === selectedCategory)
    : threads;

  // Auto-select first thread if available and none selected
  useEffect(() => {
    if (!loading && filteredThreads.length > 0 && !selectedThreadId) {
      loadThread(filteredThreads[0].id);
    }
  }, [loading, filteredThreads, selectedThreadId, loadThread]);

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Community Forum</h1>
            <p className={styles.subtitle}>Join discussions, share insights, and connect with the community.</p>
          </div>
          {me && (
            <button
              className={styles.createThreadCTA}
              type="button"
              onClick={() => {
                setTitle('');
                setBody('');
                setAttachment(null);
                const form = document.getElementById('new-thread-form');
                form?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              + Create Thread
            </button>
          )}
        </div>

        <div className={styles.bannerWrapper}>
          <AccountBanner />
        </div>

        <div className={styles.chatboxLayout}>
          {/* Left Sidebar - Thread List */}
          <div className={styles.threadSidebar}>
            <div className={styles.sidebarHeader}>
              <h2 className={styles.sidebarTitle}>Threads</h2>
              {me && (
                <button
                  className={styles.newThreadButton}
                  type="button"
                  onClick={() => {
                    setTitle('');
                    setBody('');
                    setAttachment(null);
                    const form = document.getElementById('new-thread-form');
                    form?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  + New
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className={styles.categoryFilter}>
              <button
                className={`${styles.categoryFilterButton} ${!selectedCategory ? styles.categoryFilterButtonActive : ''}`}
                type="button"
                onClick={() => setSelectedCategory(null)}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  className={`${styles.categoryFilterButton} ${selectedCategory === cat.slug ? styles.categoryFilterButtonActive : ''}`}
                  type="button"
                  onClick={() => setSelectedCategory(cat.slug)}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {loading && <div className={styles.sidebarLoading}>Loading threads…</div>}
            {!loading && filteredThreads.length === 0 && (
              <div className={styles.sidebarEmpty}>No threads yet.</div>
            )}
            {!loading && (
              <div className={styles.threadList}>
                {filteredThreads.map((t) => (
                  <button
                    key={t.id}
                    className={`${styles.threadItem} ${selectedThreadId === t.id ? styles.threadItemActive : ''}`}
                    type="button"
                    onClick={() => loadThread(t.id)}
                  >
                    <div className={styles.threadItemHeader}>
                      <div className={styles.threadTitle}>{t.title}</div>
                      <div className={styles.threadBadge}>{t.posts}</div>
                    </div>
                    <div className={styles.threadMeta}>
                      <span className={styles.threadCategory}>{t.category.name}</span> • by {t.author.username}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Chatbox */}
          <div className={styles.chatboxArea}>
            {loadingThread && (
              <div className={styles.chatboxLoading}>
                <div>Loading thread…</div>
              </div>
            )}

            {!loadingThread && selectedThreadData && (
              <>
                <div className={styles.chatboxHeader}>
                  <div>
                    <h2 className={styles.chatboxTitle}>{selectedThreadData.thread.title}</h2>
                    <div className={styles.chatboxMeta}>
                      {selectedThreadData.thread.category.name} • Started by {selectedThreadData.thread.author.username} •{' '}
                      {new Date(selectedThreadData.thread.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className={styles.messagesContainer}>
                  {selectedThreadData.posts.map((post) => (
                    <div key={post.id} className={styles.message}>
                      <div className={styles.messageHeader}>
                        <div className={styles.messageAuthor}>
                          {post.author.avatarUrl ? (
                            <img
                              src={post.author.avatarUrl}
                              alt={post.author.username}
                              className={styles.messageAvatar}
                            />
                          ) : (
                            <div className={styles.messageAvatarPlaceholder} />
                          )}
                          <span className={styles.messageUsername}>{post.author.username}</span>
                        </div>
                        <div className={styles.messageTime}>
                          {new Date(post.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className={styles.messageBody}>{post.body}</div>
                      {post.attachmentUrl && (
                        <div className={styles.messageAttachment}>
                          <Image
                            src={post.attachmentUrl}
                            alt="Attachment"
                            width={600}
                            height={400}
                            className={styles.messageImage}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {me ? (
                  <div className={styles.replyBox}>
                    <div className={styles.replyHeader}>Reply as {me.username}</div>
                    <textarea
                      className={styles.replyTextarea}
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      placeholder="Write a reply…"
                    />
                    <input
                      className={styles.replyInput}
                      type="file"
                      accept="image/png,image/jpeg,image/gif,image/webp"
                      onChange={(e) => setReplyAttachment(e.target.files?.[0] || null)}
                    />
                    <div className={styles.replyActions}>
                      <button className={styles.replyButton} type="button" onClick={handleReply}>
                        Post reply
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.replyBox}>
                    <div className={styles.replyGuest}>Create an account to reply.</div>
                  </div>
                )}
              </>
            )}

            {!loadingThread && !selectedThreadData && filteredThreads.length > 0 && (
              <div className={styles.chatboxEmpty}>
                <div>Select a thread to view messages</div>
              </div>
            )}

            {!loadingThread && !selectedThreadData && filteredThreads.length === 0 && (
              <div className={styles.chatboxEmpty}>
                <div>No threads yet. Create one to get started!</div>
              </div>
            )}
          </div>
        </div>

        {/* New Thread Form */}
        {me && (
          <div id="new-thread-form" className={styles.newThreadForm}>
            <div className={styles.newThreadHeader}>
              <div>
                <div className={styles.newThreadTitle}>Start a new thread</div>
                <div className={styles.newThreadSubtitle}>Posting as {me.username}</div>
              </div>
            </div>
            <div className={styles.formRow}>
              <select
                className={styles.input}
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
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
      </div>
      <Footer />
    </>
  );
}

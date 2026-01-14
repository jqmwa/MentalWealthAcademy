'use client';

import React, { useState, useEffect } from 'react';
import styles from './PadletBulletinBoard.module.css';

interface Post {
  id: string;
  title?: string;
  content: string;
  color?: string;
  created_at?: string;
  author?: {
    name?: string;
    avatar?: string;
  };
}

interface Board {
  id: string;
  title?: string;
  description?: string;
  posts?: Post[];
}

export function PadletBulletinBoard() {
  const [board, setBoard] = useState<Board | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    color: '#5168FF',
  });

  const fetchBoard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/padlet/board');
      
      if (!response.ok) {
        throw new Error('Failed to fetch board');
      }

      const data = await response.json();
      setBoard(data);
      setPosts(data.posts || []);
    } catch (err: any) {
      console.error('Error fetching board:', err);
      setError(err.message || 'Failed to load bulletin board');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoard();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPost.content.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/padlet/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newPost.content,
          title: newPost.title || undefined,
          color: newPost.color,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      // Reset form and refresh board
      setNewPost({ title: '', content: '', color: '#5168FF' });
      setShowAddForm(false);
      await fetchBoard();
    } catch (err: any) {
      console.error('Error creating post:', err);
      setError(err.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const colorOptions = [
    { value: '#5168FF', label: 'Blue' },
    { value: '#50599B', label: 'Purple' },
    { value: '#62BE8F', label: 'Green' },
    { value: '#FF8C42', label: 'Orange' },
    { value: '#9724A6', label: 'Pink' },
    { value: '#F59E0B', label: 'Yellow' },
  ];

  if (loading) {
    return (
      <div className={styles.bulletinWrapper}>
        <div className={styles.loading}>Loading bulletin board...</div>
      </div>
    );
  }

  if (error && !board) {
    return (
      <div className={styles.bulletinWrapper}>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={fetchBoard} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.bulletinWrapper}>
      <div className={styles.bulletinHeader}>
        <div>
          <h3 className={styles.bulletinTitle}>
            {board?.title || 'Community Bulletin Board'}
          </h3>
          {board?.description && (
            <p className={styles.bulletinDescription}>{board.description}</p>
          )}
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={styles.addButton}
        >
          {showAddForm ? 'Cancel' : '+ Add Post'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className={styles.addForm}>
          <div className={styles.formGroup}>
            <label htmlFor="post-title" className={styles.label}>
              Title (optional)
            </label>
            <input
              id="post-title"
              type="text"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              className={styles.input}
              placeholder="Post title..."
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="post-content" className={styles.label}>
              Content <span className={styles.required}>*</span>
            </label>
            <textarea
              id="post-content"
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              className={styles.textarea}
              placeholder="Share your thoughts, ideas, or announcements..."
              rows={4}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="post-color" className={styles.label}>
              Color
            </label>
            <div className={styles.colorPicker}>
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={`${styles.colorOption} ${
                    newPost.color === color.value ? styles.colorOptionActive : ''
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setNewPost({ ...newPost, color: color.value })}
                  aria-label={color.label}
                  title={color.label}
                />
              ))}
            </div>
          </div>
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setNewPost({ title: '', content: '', color: '#5168FF' });
              }}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !newPost.content.trim()}
              className={styles.submitButton}
            >
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className={styles.errorMessage}>
          {error}
          <button onClick={() => setError(null)} className={styles.dismissButton}>
            ×
          </button>
        </div>
      )}

      <div className={styles.postsGrid}>
        {posts.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No posts yet. Be the first to share something!</p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className={styles.postCard}
              style={{
                borderLeftColor: post.color || '#5168FF',
              }}
            >
              {post.title && (
                <h4 className={styles.postTitle}>{post.title}</h4>
              )}
              <div className={styles.postContent}>{post.content}</div>
              {post.created_at && (
                <div className={styles.postMeta}>
                  <time dateTime={post.created_at}>
                    {new Date(post.created_at).toLocaleDateString()}
                  </time>
                  {post.author?.name && (
                    <span className={styles.postAuthor}>{post.author.name}</span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PadletBulletinBoard;

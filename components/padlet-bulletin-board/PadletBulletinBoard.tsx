'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
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
  attachment?: {
    url?: string;
    type?: string;
    thumbnail?: string;
    title?: string;
  };
  attachments?: Array<{
    url?: string;
    type?: string;
    thumbnail?: string;
    title?: string;
  }>;
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
        let errorMessage = 'Failed to fetch board';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = `${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Handle JSON:API format response
      // Padlet API returns data in JSON:API format with 'data' and 'included' fields
      let boardData = data;
      let postsData: Post[] = [];
      
      if (data.data) {
        // JSON:API format
        boardData = data.data;
        // Posts might be in data.attributes.posts or in included array
        if (data.included) {
          postsData = data.included
            .filter((item: any) => item.type === 'post')
            .map((item: any) => {
              const content = item.attributes?.content || {};
              const attachment = content.attachment || item.attributes?.attachment;
              
              // Parse attachment data
              const attachmentData = attachment ? {
                url: attachment.url,
                type: attachment.type || attachment.mime_type || attachment.mimeType,
                thumbnail: attachment.thumbnail || attachment.thumbnail_url || attachment.thumbnailUrl,
                title: attachment.title || attachment.filename || attachment.name,
              } : undefined;
              
              // Use attachments array if available, otherwise use single attachment
              // Don't create duplicates - if attachments array exists, don't also set attachment
              const attachmentsArray = item.attributes?.attachments || 
                (attachmentData ? [attachmentData] : undefined);
              
              return {
                id: item.id,
                title: content.subject || '',
                content: content.body || '',
                color: item.attributes?.color,
                created_at: item.attributes?.created_at || item.attributes?.createdAt,
                author: item.attributes?.author || item.relationships?.author?.data,
                // Only set attachment if attachments array doesn't exist (to avoid duplicates)
                attachment: attachmentsArray && attachmentsArray.length > 0 ? undefined : attachmentData,
                attachments: attachmentsArray,
              };
            });
        } else if (data.data.attributes?.posts) {
          postsData = data.data.attributes.posts;
        }
      } else if (data.posts) {
        // Direct format (fallback)
        postsData = data.posts;
      }
      
      setBoard(boardData);
      setPosts(postsData);
    } catch (err: any) {
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

  if (error && !board && !loading) {
    return (
      <div className={styles.bulletinWrapper}>
        <div className={styles.bulletinHeader}>
          <div>
            <h3 className={styles.bulletinTitle}>Community Bulletin Board</h3>
            <p className={styles.bulletinDescription}>
              Share your thoughts, ideas, and announcements with the community.
            </p>
          </div>
        </div>
        <div className={styles.error}>
          <p>Unable to load bulletin board at this time.</p>
          {error.includes('API key') && (
            <p className={styles.errorHint}>
              The Padlet API key needs to be configured in the environment variables.
            </p>
          )}
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
              
              {/* Display attachments - prioritize attachments array, fallback to single attachment */}
              {post.attachments && post.attachments.length > 0 ? (
                <div className={styles.postAttachments}>
                  {post.attachments.map((att, idx) => (
                    <div key={idx} className={styles.postAttachment}>
                      {att.type?.startsWith('image/') || att.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        <div className={styles.postImageWrapper}>
                          <Image
                            src={att.url || att.thumbnail || ''}
                            alt={att.title || `Attachment ${idx + 1}`}
                            width={600}
                            height={400}
                            className={styles.postImage}
                            unoptimized
                          />
                        </div>
                      ) : att.url ? (
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.postLink}
                        >
                          {att.title || 'View attachment'} →
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : post.attachment ? (
                <div className={styles.postAttachment}>
                  {post.attachment.type?.startsWith('image/') || post.attachment.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <div className={styles.postImageWrapper}>
                      <Image
                        src={post.attachment.url || post.attachment.thumbnail || ''}
                        alt={post.attachment.title || 'Post attachment'}
                        width={600}
                        height={400}
                        className={styles.postImage}
                        unoptimized
                      />
                    </div>
                  ) : post.attachment.url ? (
                    <a
                      href={post.attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.postLink}
                    >
                      {post.attachment.title || 'View attachment'} →
                    </a>
                  ) : null}
                </div>
              ) : null}
              
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

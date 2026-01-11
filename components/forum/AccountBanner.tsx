'use client';

/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useMemo, useState } from 'react';
import styles from './AccountBanner.module.css';
import { getAssignedAvatars } from '@/lib/avatars';

type MeResponse = {
  user:
    | {
        id: string;
        username: string;
        avatarUrl: string | null;
        createdAt: string;
        shardCount: number;
      }
    | null;
  dbConfigured: boolean;
};

interface Avatar {
  id: string;
  image_url: string;
  metadata_url: string;
}

function EditIcon() {
  return (
    <svg
      className={styles.changeIcon}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 20h9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AccountBanner() {
  const [me, setMe] = useState<MeResponse['user']>(null);
  const [dbConfigured, setDbConfigured] = useState(false);
  const [open, setOpen] = useState(false);

  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [username, setUsername] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refreshMe() {
    const res = await fetch('/api/me', { cache: 'no-store' });
    const data = (await res.json()) as MeResponse;
    setDbConfigured(Boolean(data?.dbConfigured));
    setMe(data?.user || null);

    if (data?.user) {
      setUsername(data.user.username);
      // Load user's assigned avatars
      if (data.user.id) {
        const assignedAvatars = getAssignedAvatars(data.user.id);
        setAvatars(assignedAvatars);
        // If user has an avatar, find its ID
        const userAvatarUrl = data.user.avatarUrl;
        if (userAvatarUrl) {
          const currentAvatar = assignedAvatars.find(a => a.image_url === userAvatarUrl);
          if (currentAvatar) {
            setSelectedAvatarId(currentAvatar.id);
          } else if (assignedAvatars.length > 0) {
            // Default to first avatar if current one not found
            setSelectedAvatarId(assignedAvatars[0].id);
          }
        } else if (assignedAvatars.length > 0) {
          // Default to first avatar if none selected
          setSelectedAvatarId(assignedAvatars[0].id);
        }
      }
    }
  }

  useEffect(() => {
    refreshMe().catch(() => {});
  }, []);

  const rank = useMemo(() => {
    const shards = me?.shardCount ?? 0;
    if (!me) return 'Visitor';
    if (shards >= 2500) return 'Mythic';
    if (shards >= 1000) return 'Elite';
    if (shards >= 250) return 'Adept';
    if (shards >= 50) return 'Apprentice';
    return 'Initiate';
  }, [me]);

  const joined = useMemo(() => {
    if (!me?.createdAt) return '—';
    const d = new Date(me.createdAt);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }, [me]);

  async function handleSave() {
    setError(null);
    if (!dbConfigured) {
      setError('Database is not configured on the server yet.');
      return;
    }

    if (!selectedAvatarId) {
      setError('Please select an avatar');
      return;
    }

    setSaving(true);
    try {
      const selectedAvatar = avatars.find(a => a.id === selectedAvatarId);
      if (!selectedAvatar) {
        throw new Error('Invalid avatar selection');
      }

      const avatarUrl = selectedAvatar.image_url;

      if (!me) {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, avatarUrl }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || 'Signup failed');
      } else {
        // Use the avatar selection API
        const res = await fetch('/api/avatars/select', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar_id: selectedAvatarId }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || 'Update failed');

        // Also update username if it changed
        if (username !== me.username) {
          const usernameRes = await fetch('/api/me', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
          });
          const usernameData = await usernameRes.json().catch(() => ({}));
          if (!usernameRes.ok) throw new Error(usernameData?.error || 'Username update failed');
        }
      }

      await refreshMe();
      setOpen(false);
    } catch (e: any) {
      setError(e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setMe(null);
    setUsername('');
    setAvatars([]);
    setSelectedAvatarId('');
    setOpen(false);
  }

  const displayAvatar = useMemo(() => {
    if (me?.avatarUrl) return me.avatarUrl;
    if (selectedAvatarId) {
      const avatar = avatars.find(a => a.id === selectedAvatarId);
      return avatar?.image_url || null;
    }
    return null;
  }, [me?.avatarUrl, selectedAvatarId, avatars]);

  return (
    <div className={styles.banner}>
      <div className={styles.left}>
        <div className={styles.avatarOuter}>
          <div className={styles.avatarWrap}>
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt={me?.username || 'Avatar'}
                width={56}
                height={56}
                className={styles.avatarImg}
                loading="eager"
              />
            ) : (
              <div className={styles.avatarFallback} />
            )}
          </div>

          <button
            type="button"
            className={styles.changeButton}
            onClick={() => {
              setError(null);
              // Reload avatars when opening
              if (me?.id) {
                const assignedAvatars = getAssignedAvatars(me.id);
                setAvatars(assignedAvatars);
                if (!selectedAvatarId && assignedAvatars.length > 0) {
                  setSelectedAvatarId(assignedAvatars[0].id);
                }
              }
              setOpen(true);
            }}
            aria-label="Change avatar"
          >
            <EditIcon />
          </button>
        </div>

        <div className={styles.identity}>
          <div className={styles.nameRow}>
            <div className={styles.name}>{me?.username || 'Guest'}</div>
            <div className={styles.pill}>{rank}</div>
          </div>
          <div className={styles.metaRow}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Joined</span>
              <span className={styles.metaValue}>{joined}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Shards</span>
              <span className={styles.metaValue}>{me?.shardCount ?? 0}</span>
            </div>
          </div>
        </div>
      </div>

      {open && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>{me ? 'Account' : 'Create account'}</div>
              <button className={styles.modalClose} type="button" onClick={() => setOpen(false)}>
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              {!dbConfigured && (
                <div className={styles.note}>
                  Set <code>DATABASE_URL</code> to save your account/avatar to the server.
                </div>
              )}

              <label className={styles.label}>
                Username
                <input
                  className={styles.input}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="letters/numbers/underscore"
                />
              </label>

              <div className={styles.label}>
                Choose an avatar (5 unique avatars)
                <div className={styles.pickerGrid}>
                  {avatars.length > 0 ? avatars.map((avatar) => {
                    const selected = avatar.id === selectedAvatarId;
                    return (
                      <button
                        key={avatar.id}
                        type="button"
                        className={`${styles.avatarOption} ${selected ? styles.avatarOptionSelected : ''}`}
                        onClick={() => setSelectedAvatarId(avatar.id)}
                        aria-label={`Select avatar ${avatar.id}`}
                      >
                        <img
                          src={avatar.image_url}
                          alt={avatar.id}
                          width={120}
                          height={120}
                          className={styles.avatarOptionImg}
                          loading="lazy"
                        />
                      </button>
                    );
                  }) : (
                    <div className={styles.note}>Loading avatars...</div>
                  )}
                </div>
              </div>

              {error && <div className={styles.error}>{error}</div>}
            </div>

            <div className={styles.modalActions}>
              {me && (
                <button className={styles.secondaryButton} type="button" onClick={handleLogout} disabled={saving}>
                  Log out
                </button>
              )}
              <button className={styles.secondaryButton} type="button" onClick={() => setOpen(false)} disabled={saving}>
                Cancel
              </button>
              <button className={styles.primaryButton} type="button" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

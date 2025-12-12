'use client';

/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useMemo, useState } from 'react';
import styles from './AccountBanner.module.css';

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

const DICEBEAR_BASE = 'https://api.dicebear.com/9.x/adventurer/svg';

function dicebearUrl(seed: string) {
  return `${DICEBEAR_BASE}?seed=${encodeURIComponent(seed)}`;
}

function randomSeed(prefix = 'mwa') {
  // Prefer crypto when available; fallback to Math.random.
  const bytes =
    typeof crypto !== 'undefined' && 'getRandomValues' in crypto
      ? crypto.getRandomValues(new Uint8Array(8))
      : null;

  const token = bytes
    ? Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
    : Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2);

  return `${prefix}-${token.slice(0, 16)}`;
}

function generateAvatarSeeds(count: number) {
  const set = new Set<string>();
  while (set.size < count) set.add(randomSeed('avatar'));
  return Array.from(set);
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

  const [avatarSeeds, setAvatarSeeds] = useState<string[]>(() => generateAvatarSeeds(8));
  const [username, setUsername] = useState('');
  const [selectedSeed, setSelectedSeed] = useState<string>(avatarSeeds[0] ?? randomSeed('avatar'));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refreshMe() {
    const res = await fetch('/api/me', { cache: 'no-store' });
    const data = (await res.json()) as MeResponse;
    setDbConfigured(Boolean(data?.dbConfigured));
    setMe(data?.user || null);

    if (data?.user) {
      setUsername(data.user.username);
      // If user's avatar is a dicebear url, try to preselect by seed.
      const url = data.user.avatarUrl || '';
      const seedFromUrl = (() => {
        try {
          const u = new URL(url);
          if (u.hostname !== 'api.dicebear.com') return null;
          return u.searchParams.get('seed');
        } catch {
          return null;
        }
      })();
      if (seedFromUrl) setSelectedSeed(seedFromUrl);
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

    setSaving(true);
    try {
      const avatarUrl = dicebearUrl(selectedSeed);

      if (!me) {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, avatarUrl }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || 'Signup failed');
      } else {
        const res = await fetch('/api/me', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, avatarUrl }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || 'Update failed');
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
    const seeds = generateAvatarSeeds(8);
    setAvatarSeeds(seeds);
    setSelectedSeed(seeds[0]);
    setOpen(false);
  }

  const displayAvatar = me?.avatarUrl || dicebearUrl(selectedSeed);

  return (
    <div className={styles.banner}>
      <div className={styles.left}>
        <div className={styles.avatarOuter}>
          <div className={styles.avatarWrap}>
            {displayAvatar ? (
              // Dicebear serves SVGs; Next/Image blocks remote SVG by default.
              // Use <img> to ensure avatars always render.
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
              // Always refresh choices when opening so it feels dynamic.
              const seeds = generateAvatarSeeds(8);
              setAvatarSeeds(seeds);
              setSelectedSeed((prev) => prev || seeds[0]);
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
                Choose an avatar
                <div className={styles.pickerGrid}>
                  {avatarSeeds.map((seed) => {
                    const url = dicebearUrl(seed);
                    const selected = seed === selectedSeed;
                    return (
                      <button
                        key={seed}
                        type="button"
                        className={`${styles.avatarOption} ${selected ? styles.avatarOptionSelected : ''}`}
                        onClick={() => setSelectedSeed(seed)}
                        aria-label={`Select avatar ${seed}`}
                      >
                        <img
                          src={url}
                          alt={seed}
                          width={120}
                          height={120}
                          className={styles.avatarOptionImg}
                          loading="lazy"
                        />
                      </button>
                    );
                  })}
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

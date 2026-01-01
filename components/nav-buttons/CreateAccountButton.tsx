'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAccount, useDisconnect } from 'wagmi';
import { useModal } from 'connectkit';
import { getWalletAuthHeaders } from '@/lib/wallet-api';
import styles from './CreateAccountButton.module.css';

type MeResponse = { user: { id: string; username: string; avatarUrl: string | null } | null };

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

const CreateAccountButton: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { setOpen: setConnectKitOpen } = useModal();
  const [me, setMe] = useState<MeResponse['user']>(null);
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function refreshMe() {
    const res = await fetch('/api/me', { cache: 'no-store' });
    const data = (await res.json()) as MeResponse;
    setMe(data.user);
    if (data.user) setUsername(data.user.username);
  }

  useEffect(() => {
    refreshMe().catch(() => {});
  }, []);

  // Refresh user data when wallet connects
  useEffect(() => {
    if (isConnected) {
      refreshMe().catch(() => {});
    }
  }, [isConnected]);

  async function handleSave() {
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    setError(null);
    setSaving(true);
    try {
      const uploaded = await uploadIfPresent(avatarFile);

      if (!me) {
        // New account creation
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...getWalletAuthHeaders(address),
          },
          body: JSON.stringify({
            username,
            avatarUrl: uploaded?.url ?? null,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || 'Signup failed');
      } else {
        // Profile update
        const res = await fetch('/api/me', {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            ...getWalletAuthHeaders(address),
          },
          body: JSON.stringify({
            username,
            avatarUrl: uploaded?.url ?? me.avatarUrl,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || 'Update failed');
      }

      await refreshMe();
      setAvatarFile(null);
      setOpen(false);
    } catch (e: any) {
      setError(e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    // Disconnect wallet
    disconnect();
    // Also clear our session
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setMe(null);
    setUsername('');
    setAvatarFile(null);
    setOpen(false);
  }

  const handleOpen = () => {
    if (!isConnected) {
      // Open ConnectKit modal to connect wallet
      setConnectKitOpen(true);
      return;
    }
    setOpen(true);
  }

  return (
    <>
      <button
        className={styles.createAccountButton}
        data-intro="create-account"
        onClick={handleOpen}
        type="button"
      >
        <span className={styles.buttonText}>{me ? `Welcome ${me.username}!` : 'Create Account'}</span>
        <div className={styles.logo}>
          {me?.avatarUrl ? (
            <Image src={me.avatarUrl} alt={me.username} width={26} height={26} className={styles.logoImg} />
          ) : (
            <div className={styles.logoFallback} />
          )}
        </div>
      </button>

      {open && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>{me ? 'Edit profile' : 'Create account'}</div>
              <button className={styles.modalClose} type="button" onClick={() => setOpen(false)}>
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <label className={styles.label}>
                Username
                <input
                  className={styles.input}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="letters/numbers/underscore"
                />
              </label>
              <label className={styles.label}>
                Avatar (png/jpg/gif/webp)
                <input
                  className={styles.input}
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                />
              </label>
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
    </>
  );
};

export default CreateAccountButton;


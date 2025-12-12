'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import styles from './DaemonTerminal.module.css';

type Mode = 'rewrite' | 'tone' | 'critique' | 'summarize';

type Tone = 'concise' | 'warm' | 'formal' | 'friendly' | 'direct';

type View = 'toolGrid' | 'terminal';

const ICON_REVISER = '/icons/icon.svg%20(20).svg';
const ICON_SOON_1 = '/icons/icon.svg%20(17).svg';
const ICON_SOON_2 = '/icons/Eye.svg';
const ICON_SOON_3 = '/icons/ethlogo.svg';
const ICON_ARROW = '/icons/Arrow.svg';

export function DaemonTerminal() {
  const [view, setView] = useState<View>('toolGrid');
  const [mode, setMode] = useState<Mode>('rewrite');
  const [tone, setTone] = useState<Tone>('warm');
  const [contextEmail, setContextEmail] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modeCards = useMemo(
    () =>
      [
        { id: 'rewrite' as const, title: 'Reviser', desc: 'Polish and organize.' },
        { id: 'tone' as const, title: 'Tone Shift', desc: 'Change voice, keep meaning.' },
        { id: 'critique' as const, title: 'Critique', desc: 'Clarity + structure notes.' },
        { id: 'summarize' as const, title: 'Summarize', desc: 'Key points + next steps.' },
      ],
    []
  );

  async function runDaemon() {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/daemon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, tone, input, contextEmail }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Daemon request failed');

      setOutput(String(data?.output || ''));
    } catch (e: any) {
      setError(e?.message || 'Failed to run Daemon');
    } finally {
      setLoading(false);
    }
  }

  async function copyOutput() {
    try {
      await navigator.clipboard.writeText(output);
    } catch {
      // ignore
    }
  }

  return (
    <section className={styles.terminal}>
      <div className={styles.terminalHeader}>
        <div className={styles.headerLeft} aria-hidden="true">
          <div className={styles.dots}>
            <div className={`${styles.dot} ${styles.dotRed}`} />
            <div className={`${styles.dot} ${styles.dotYellow}`} />
            <div className={`${styles.dot} ${styles.dotGreen}`} />
          </div>
        </div>
        <div className={styles.headerTitle}>Academy AI — V1</div>
        <div className={styles.headerRight}>
          {view === 'terminal' ? (
            <button
              type="button"
              className={styles.backButton}
              onClick={() => setView('toolGrid')}
              aria-label="Back"
            >
              <Image
                src={ICON_ARROW}
                alt=""
                width={18}
                height={18}
                className={styles.backArrow}
              />
              <span className={styles.backText}>BACK</span>
            </button>
          ) : (
            <div style={{ width: 36 }} />
          )}
        </div>
      </div>

      {view === 'toolGrid' && (
        <div className={styles.toolGridWrap}>
          <div className={styles.toolGrid}>
            <button
              type="button"
              className={styles.toolCard}
              onClick={() => setView('terminal')}
            >
              <div className={styles.toolInner}>
                <div className={styles.toolIcon}>
                  <Image src={ICON_REVISER} alt="" width={44} height={44} />
                </div>
                <h1 className={styles.toolTitle}>Reviser</h1>
                <div className={styles.toolDesc}>Rewrite drafts with clarity and tone.</div>
              </div>
            </button>

            <button type="button" className={`${styles.toolCard} ${styles.toolCardDisabled}`} disabled>
              <div className={styles.toolInner}>
                <div className={styles.toolIcon}>
                  <Image src={ICON_SOON_1} alt="" width={44} height={44} />
                </div>
                <h1 className={styles.toolTitle}>Coming soon</h1>
                <div className={styles.toolDesc}>More tools are on the way.</div>
              </div>
            </button>

            <button type="button" className={`${styles.toolCard} ${styles.toolCardDisabled}`} disabled>
              <div className={styles.toolInner}>
                <div className={styles.toolIcon}>
                  <Image src={ICON_SOON_2} alt="" width={44} height={44} />
                </div>
                <h1 className={styles.toolTitle}>Coming soon</h1>
                <div className={styles.toolDesc}>More tools are on the way.</div>
              </div>
            </button>

            <button type="button" className={`${styles.toolCard} ${styles.toolCardDisabled}`} disabled>
              <div className={styles.toolInner}>
                <div className={styles.toolIcon}>
                  <Image src={ICON_SOON_3} alt="" width={44} height={44} />
                </div>
                <h1 className={styles.toolTitle}>Coming soon</h1>
                <div className={styles.toolDesc}>More tools are on the way.</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {view === 'terminal' && (
        <div className={styles.centerPanelEnter}>
          <div className={styles.centerPanel}>
            <div className={styles.actionGrid}>
              {modeCards.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`${styles.actionCard} ${mode === c.id ? styles.actionCardActive : ''}`}
                  onClick={() => setMode(c.id)}
                >
                  <div className={styles.actionTitle}>{c.title}</div>
                  <div className={styles.actionDesc}>{c.desc}</div>
                </button>
              ))}
            </div>

            <div className={styles.chat}>
              <div className={styles.row}>
                <div className={styles.label}>Tone</div>
                <select
                  className={`${styles.field} ${styles.select}`}
                  value={tone}
                  onChange={(e) => setTone(e.target.value as Tone)}
                >
                  <option value="concise">Concise</option>
                  <option value="warm">Warm</option>
                  <option value="formal">Formal</option>
                  <option value="friendly">Friendly</option>
                  <option value="direct">Direct</option>
                </select>
              </div>

              <div className={styles.row}>
                <div className={styles.label}>Context</div>
                <textarea
                  className={`${styles.field} ${styles.textarea}`}
                  value={contextEmail}
                  onChange={(e) => setContextEmail(e.target.value)}
                  placeholder="Optional: paste the email you're replying to…"
                />
              </div>

              <div className={styles.row}>
                <div className={styles.label}>Input</div>
                <textarea
                  className={`${styles.field} ${styles.textarea}`}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste text to refine…"
                />
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={`${styles.button} ${styles.secondary}`}
                  onClick={() => {
                    setContextEmail('');
                    setInput('');
                    setOutput('');
                    setError(null);
                  }}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className={`${styles.button} ${styles.primary}`}
                  onClick={runDaemon}
                  disabled={loading}
                >
                  {loading ? 'Generating…' : 'Generate'}
                </button>
              </div>

              <div className={styles.output}>
                <div className={styles.outputHeader}>
                  <div className={styles.outputTitle}>Output</div>
                  <button
                    type="button"
                    className={`${styles.button} ${styles.secondary}`}
                    onClick={copyOutput}
                    disabled={!output}
                  >
                    Copy
                  </button>
                </div>
                <div className={styles.outputBody}>{output || 'Your output will appear here.'}</div>
              </div>

              {error && <div className={styles.error}>{error}</div>}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

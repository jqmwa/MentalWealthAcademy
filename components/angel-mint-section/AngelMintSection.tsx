'use client'

import styles from './AngelMintSection.module.css'

interface AngelMintSectionProps {
  onOpenMintModal: () => void
}

export default function AngelMintSection({ onOpenMintModal }: AngelMintSectionProps) {
  return (
    <>
      <section className={styles.angelSection}>
        <div className={styles.container}>
          {/* Scrolling Images Section */}
          <div className={styles.scrollingImagesContainer}>
            {/* Top Row - Scrolls Left */}
            <div className={`${styles.scrollRow} ${styles.scrollRowLeft}`}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                <img
                  key={`top-${num}`}
                  src={`/anbel${num.toString().padStart(2, '0')}.png`}
                  alt={`Angel ${num}`}
                  className={styles.angelImage}
                />
              ))}
              {/* Duplicate for seamless loop */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                <img
                  key={`top-dup-${num}`}
                  src={`/anbel${num.toString().padStart(2, '0')}.png`}
                  alt={`Angel ${num}`}
                  className={styles.angelImage}
                />
              ))}
            </div>

            {/* Bottom Row - Scrolls Right */}
            <div className={`${styles.scrollRow} ${styles.scrollRowRight}`}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                <img
                  key={`bottom-${num}`}
                  src={`/anbel${num.toString().padStart(2, '0')}.png`}
                  alt={`Angel ${num}`}
                  className={styles.angelImage}
                />
              ))}
              {/* Duplicate for seamless loop */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                <img
                  key={`bottom-dup-${num}`}
                  src={`/anbel${num.toString().padStart(2, '0')}.png`}
                  alt={`Angel ${num}`}
                  className={styles.angelImage}
                />
              ))}
            </div>
          </div>

          {/* MINT YOUR ANGEL Button */}
          <div className={styles.mintButtonContainer}>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onOpenMintModal()
              }}
              className={styles.mintButton}
              type="button"
            >
              <span className={styles.mintButtonText}>
                MINT YOUR ANGEL
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={styles.mintButtonArrow}
              >
                <path
                  d="M6 3L11 8L6 13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </section>

    </>
  )
}

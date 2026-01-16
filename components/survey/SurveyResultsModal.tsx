'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import styles from './SurveyResultsModal.module.css'

interface SurveyResults {
  surveyId: string
  surveyTitle: string
  personalizedTitle: string
  answers: Record<number, string>
  analysis: string
  insights: string[]
  timestamp: string
}

interface SurveyResultsModalProps {
  isOpen: boolean
  onClose: () => void
  results: SurveyResults | null
}

export default function SurveyResultsModal({ isOpen, onClose, results }: SurveyResultsModalProps) {
  const [showContent, setShowContent] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (isOpen && results) {
      setTimeout(() => setShowContent(true), 300)
    } else {
      setShowContent(false)
    }
  }, [isOpen, results])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleClose = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    setShowContent(false)
    setTimeout(() => onClose(), 200)
  }, [onClose])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, handleClose])

  if (!isOpen || !results || !mounted) return null

  const modalContent = (
    <div
      className={styles.resultsModalOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose()
        }
      }}
    >
      <div
        className={`${styles.resultsModalContainer} ${showContent ? styles.resultsModalContainerVisible : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close button */}
        <div className={styles.resultsModalHeader}>
          <div className={styles.resultsModalHeaderContent}>
            <h2 className={styles.resultsModalTitle}>Survey Complete</h2>
            <button
              onClick={(e) => handleClose(e)}
              className={styles.resultsModalClose}
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
        </div>

        {/* Animated Content */}
        <div className={styles.resultsModalContent}>
          {/* Success Animation */}
          <div className={`${styles.resultsModalSuccessIcon} ${showContent ? styles.resultsModalSuccessIconVisible : ''}`}>
            <svg
              width="60"
              height="60"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>

          {/* Personalized Title */}
          <div className={`${styles.resultsModalTitleSection} ${showContent ? styles.resultsModalTitleSectionVisible : ''}`}>
            <h3 className={styles.resultsModalPersonalizedTitle}>
              {results.personalizedTitle || results.surveyTitle}
            </h3>
            <p className={styles.resultsModalSurveyTitle}>
              {results.surveyTitle}
            </p>
          </div>

          {/* Analysis Text */}
          <div className={`${styles.resultsModalAnalysis} ${showContent ? styles.resultsModalAnalysisVisible : ''}`}>
            <p className={styles.resultsModalAnalysisText}>
              {results.analysis}
            </p>
          </div>

          {/* Insights */}
          {results.insights && results.insights.length > 0 && (
            <div className={`${styles.resultsModalInsights} ${showContent ? styles.resultsModalInsightsVisible : ''}`}>
              <h4 className={styles.resultsModalInsightsTitle}>
                Key Insights
              </h4>
              <div className={styles.resultsModalInsightsList}>
                {results.insights.map((insight, index) => (
                  <div key={index} className={styles.resultsModalInsightItem}>
                    <p className={styles.resultsModalInsightText}>
                      • {insight}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`${styles.resultsModalFooter} ${showContent ? styles.resultsModalFooterVisible : ''}`}>
          <button
            onClick={handleClose}
            className={styles.resultsModalCloseButton}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

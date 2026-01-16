'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import styles from './QuizModal.module.css'

interface Question {
  id: number
  text: string
  options: string[]
}

interface Survey {
  id: string
  title: string
  description: string
  questions: Question[]
}

interface QuizModalProps {
  isOpen: boolean
  onClose: () => void
  survey: Survey | null
  onComplete?: (answers: Record<number, string>) => void
}

export default function QuizModal({ isOpen, onClose, survey, onComplete }: QuizModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

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
    setCurrentQuestionIndex(0)
    setAnswers({})
    onClose()
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

  if (!isOpen || !survey || !mounted) return null

  const currentQuestion = survey.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === survey.questions.length - 1
  const hasAnswer = answers[currentQuestion.id] !== undefined

  const handleAnswerSelect = (option: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: option
    })
  }

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit()
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      if (onComplete) {
        await onComplete(answers)
      }
      // Reset state
      setCurrentQuestionIndex(0)
      setAnswers({})
      setIsSubmitting(false)
      onClose()
    } catch (error) {
      console.error('[QuizModal] Error submitting quiz:', error)
      setIsSubmitting(false)
    }
  }

  const progress = ((currentQuestionIndex + 1) / survey.questions.length) * 100

  const modalContent = (
    <div
      className={styles.quizModalOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose()
        }
      }}
    >
      <div className={styles.quizModalContainer} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.quizModalHeader}>
          <div className={styles.quizModalHeaderContent}>
            <h2 className={styles.quizModalTitle}>{survey.title}</h2>
            <button
              onClick={(e) => handleClose(e)}
              className={styles.quizModalClose}
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className={styles.quizModalProgressContainer}>
            <div
              className={styles.quizModalProgressBar}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className={styles.quizModalProgressText}>
            Question {currentQuestionIndex + 1} of {survey.questions.length}
          </p>
        </div>

        {/* Question Content */}
        <div className={styles.quizModalContent}>
          <div className={styles.quizModalQuestion}>
            <h3 className={styles.quizModalQuestionText}>
              {currentQuestion.text}
            </h3>
          </div>

          {/* Answer Options */}
          <div className={styles.quizModalOptions}>
            {currentQuestion.options.map((option, index) => {
              const isSelected = answers[currentQuestion.id] === option

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  className={`${styles.quizModalOption} ${isSelected ? styles.quizModalOptionSelected : ''}`}
                >
                  <div className={styles.quizModalOptionContent}>
                    <div className={`${styles.quizModalOptionIndicator} ${isSelected ? styles.quizModalOptionIndicatorSelected : ''}`}>
                      {isSelected && (
                        <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                          <path
                            d="M2 6L5 9L10 3"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <span className={styles.quizModalOptionText}>
                      {option}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className={styles.quizModalFooter}>
          <div className={styles.quizModalFooterButtons}>
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={`${styles.quizModalButton} ${styles.quizModalButtonSecondary}`}
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={!hasAnswer || isSubmitting}
              className={`${styles.quizModalButton} ${styles.quizModalButtonPrimary}`}
            >
              {isSubmitting ? 'Submitting...' : isLastQuestion ? 'Submit' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

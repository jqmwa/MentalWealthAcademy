'use client';

import React, { useState, useEffect } from 'react';
import GuyDialogue from './GuyDialogue';
import styles from './GuyTutorial.module.css';

export interface GuyStep {
  message: string;
}

interface GuyTutorialProps {
  steps: GuyStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  title?: string;
  showProgress?: boolean;
}

const GuyTutorial: React.FC<GuyTutorialProps> = ({
  steps,
  isOpen,
  onClose,
  onComplete,
  title = 'Hey there!',
  showProgress = true,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setIsTyping(false);
      return;
    }

    setCurrentStep(0);
    setIsTyping(true);
  }, [isOpen]);

  const handleDialogueComplete = () => {
    setIsTyping(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setIsTyping(true);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setIsTyping(true);
    }
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
    onClose();
  };

  if (!isOpen || steps.length === 0) return null;

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />

      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          {showProgress && (
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          <button className={styles.closeButton} onClick={onClose} type="button" aria-label="Close">
            ×
          </button>
        </div>

        <div className={styles.content}>
          <GuyDialogue
            key={currentStep}
            message={currentStepData.message}
            onComplete={handleDialogueComplete}
            autoStart={isTyping}
            showSkip={false}
          />
        </div>

        <div className={styles.footer}>
          <div className={styles.stepIndicator}>
            Step {currentStep + 1} of {steps.length}
          </div>
          <div className={styles.actions}>
            {currentStep > 0 && (
              <button
                className={styles.prevButton}
                onClick={handlePrevious}
                type="button"
              >
                ← Previous
              </button>
            )}
            <div className={styles.spacer} />
            {currentStep < steps.length - 1 ? (
              <button
                className={styles.nextButton}
                onClick={handleNext}
                type="button"
                disabled={isTyping}
              >
                Next →
              </button>
            ) : (
              <button
                className={styles.completeButton}
                onClick={handleComplete}
                type="button"
                disabled={isTyping}
              >
                Got it!
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default GuyTutorial;

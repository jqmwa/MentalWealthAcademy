'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ExpertPaywall.module.css';

interface ExpertPaywallProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe?: () => void;
}

const benefits = [
  {
    icon: '🎓',
    title: 'Expert Insights',
    description: 'Access in-depth commentary from researchers and practitioners',
  },
  {
    icon: '📊',
    title: 'Evidence-Based',
    description: 'Learn the science behind each technique with cited research',
  },
  {
    icon: '🎯',
    title: 'Advanced Strategies',
    description: 'Unlock professional-level implementation tips',
  },
  {
    icon: '⚡',
    title: 'Early Access',
    description: 'Be first to explore new ideas before general release',
  },
];

export const ExpertPaywall: React.FC<ExpertPaywallProps> = ({
  isOpen,
  onClose,
  onSubscribe,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    
    // Simulate loading for UI feedback
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    
    // For now, just show coming soon message
    // Stripe integration will be added in a future phase
    if (onSubscribe) {
      onSubscribe();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.modal}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close"
              type="button"
            >
              <span>×</span>
            </button>

            {/* Header */}
            <div className={styles.header}>
              <div className={styles.iconWrapper}>
                <span className={styles.lockIcon}>🔓</span>
              </div>
              <h2 className={styles.title}>Unlock Expert Commentary</h2>
              <p className={styles.subtitle}>
                Go deeper with professional insights on every idea card
              </p>
            </div>

            {/* Pricing */}
            <div className={styles.pricing}>
              <div className={styles.priceTag}>
                <span className={styles.currency}>$</span>
                <span className={styles.amount}>4</span>
                <span className={styles.cents}>.99</span>
                <span className={styles.period}>/month</span>
              </div>
              <p className={styles.pricingNote}>Cancel anytime • 7-day free trial</p>
            </div>

            {/* Benefits */}
            <div className={styles.benefits}>
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  className={styles.benefitItem}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className={styles.benefitIcon}>{benefit.icon}</span>
                  <div className={styles.benefitContent}>
                    <h4 className={styles.benefitTitle}>{benefit.title}</h4>
                    <p className={styles.benefitDescription}>{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <button
              className={styles.subscribeButton}
              onClick={handleSubscribe}
              disabled={isLoading}
              type="button"
            >
              {isLoading ? (
                <span className={styles.loadingSpinner}>
                  <span className={styles.spinnerDot}></span>
                  <span className={styles.spinnerDot}></span>
                  <span className={styles.spinnerDot}></span>
                </span>
              ) : (
                <>
                  <span>Start Free Trial</span>
                  <span className={styles.arrowIcon}>→</span>
                </>
              )}
            </button>

            {/* Coming Soon Notice */}
            <div className={styles.comingSoon}>
              <span className={styles.comingSoonBadge}>Coming Soon</span>
              <p className={styles.comingSoonText}>
                Payment integration launching soon. Join the waitlist!
              </p>
            </div>

            {/* Footer */}
            <p className={styles.footer}>
              By subscribing, you agree to our{' '}
              <a href="#" className={styles.link}>Terms</a> and{' '}
              <a href="#" className={styles.link}>Privacy Policy</a>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExpertPaywall;

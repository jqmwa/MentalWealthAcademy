'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import styles from './LandingPage.module.css';

export const RotatingTextSection: React.FC = () => {
  const texts = useMemo(() => [
    'gain agency in their lives',
    'fund holistic decisions',
    'control their own destiny'
  ], []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentWidth, setCurrentWidth] = useState(0);
  const [textWidths, setTextWidths] = useState<number[]>([]);
  const textItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [texts.length]);

  useEffect(() => {
    const measureAllWidths = () => {
      const fontSize = window.innerWidth >= 768 ? '2.65rem' : '1.2rem';
      const widths = texts.map((text) => {
        const span = document.createElement('span');
        span.style.visibility = 'hidden';
        span.style.position = 'absolute';
        span.style.whiteSpace = 'nowrap';
        span.style.fontSize = fontSize;
        span.style.fontFamily = 'var(--font-primary)';
        span.style.fontWeight = 'inherit';
        span.style.letterSpacing = 'normal';
        span.style.textRendering = 'optimizeLegibility';
        (span.style as any).webkitFontSmoothing = 'antialiased';
        (span.style as any).mozOsxFontSmoothing = 'grayscale';
        span.textContent = text;
        document.body.appendChild(span);

        const rect = span.getBoundingClientRect();
        const width = Math.ceil(rect.width);

        document.body.removeChild(span);

        const percentageBuffer = Math.ceil(width * 0.05);
        const fixedBuffer = window.innerWidth >= 768 ? 20 : 10;
        const finalWidth = width + percentageBuffer + fixedBuffer;

        return finalWidth;
      });
      setTextWidths(widths);
    };

    measureAllWidths();
    window.addEventListener('resize', measureAllWidths);
    return () => window.removeEventListener('resize', measureAllWidths);
  }, [texts]);

  useEffect(() => {
    if (textItemRefs.current[currentIndex]) {
      const element = textItemRefs.current[currentIndex];
      if (element) {
        const rect = element.getBoundingClientRect();
        const actualWidth = Math.ceil(rect.width);
        if (actualWidth > currentWidth) {
          setCurrentWidth(actualWidth + 10);
        }
      }
    }
  }, [currentIndex, currentWidth]);

  useEffect(() => {
    if (textWidths.length > 0 && textWidths[currentIndex]) {
      setCurrentWidth(textWidths[currentIndex]);
    }
  }, [currentIndex, textWidths]);

  const rotation = currentIndex * 120;

  return (
    <div className={styles.rotatingTextContainer}>
      <div className={styles.rotatingTextLines}>
        <h3 className={styles.rotatingTextHeading}>
          <span className={styles.rotatingTextStatic}>Helping people</span>
          <div
            className={styles.rotatingTextWrapper}
            style={{
              width: currentWidth > 0 ? `${currentWidth}px` : 'auto',
              height: '50px',
              perspective: '1000px',
              overflow: 'visible',
              display: 'inline-block',
              verticalAlign: 'middle',
              transition: 'width 400ms cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <div
              className={styles.rotatingTextInner}
              style={{
                transformStyle: 'preserve-3d',
                transform: `rotateX(${-rotation}deg)`,
                transition: 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                width: '100%',
                height: '100%'
              }}
            >
              {texts.map((text, index) => {
                const itemRotation = index * 120;
                return (
                  <div
                    key={index}
                    ref={(el) => {
                      textItemRefs.current[index] = el;
                    }}
                    className={styles.rotatingTextItem}
                    style={{
                      transform: `translateX(-50%) rotateX(${itemRotation}deg) translateZ(60px)`,
                      backfaceVisibility: 'hidden',
                      width: 'auto',
                      left: '50%',
                      transformOrigin: 'center center'
                    }}
                  >
                    {text}
                  </div>
                );
              })}
            </div>
          </div>
        </h3>
        <p className={styles.rotatingTextStaticLine}>with other humans for a better world</p>
      </div>
    </div>
  );
};

export default RotatingTextSection;

'use client';

import { useEffect } from 'react';
import 'intro.js/introjs.css';
import { AzuraEmotion } from '../azura-dialogue/AzuraDialogue';

interface TourStep {
  title: string;
  intro: string;
  element: string;
  emotion: AzuraEmotion;
}

const getTourSteps = (): TourStep[] => [
  {
    title: 'Welcome to Mental Wealth Academy!',
    intro: 'Welcome. I\'m Azura, your AI co-pilot. We\'re here to explore how enframent and pattern-recognition shape behavior—and how we can build better systems. Let\'s begin.',
    element: 'body',
    emotion: 'happy',
  },
  {
    title: 'Active Quests',
    intro: 'Quests are your path to understanding. Each completion earns shards and deepens your grasp of decentralized systems. Start here to track your progress.',
    element: '[data-intro="quests"]',
    emotion: 'happy',
  },
  {
    title: 'Daily Shards',
    intro: 'Check in daily to earn shards. Consistency builds understanding—each check-in reinforces your engagement with decentralized systems.',
    element: '[data-intro="azurafaucet"]',
    emotion: 'happy',
  },
  {
    title: 'Events',
    intro: 'Workshops and events expose the mechanics behind governance systems. Join to see how technology shapes power structures in real-time.',
    element: '[data-intro="events"] h1',
    emotion: 'happy',
  },
  {
    title: 'Messageboard',
    intro: 'The messageboard is where the community debates, questions, and builds. This is where agentic systems emerge from collective intelligence.',
    element: '[data-intro="messageboard-card"]',
    emotion: 'happy',
  },
  {
    title: 'You\'re All Set!',
    intro: 'You\'re ready. Remember: we\'re not just learning—we\'re building the decentralized systems that will shape the future. Question everything. Build with intention.',
    element: 'body',
    emotion: 'happy',
  },
];

const injectAzuraDialogue = (tooltip: HTMLElement, message: string, emotion: AzuraEmotion) => {
  const contentDiv = tooltip.querySelector('.introjs-tooltipcontent') as HTMLElement;
  if (!contentDiv) return;

  // Check if AzuraDialogue is already injected
  if (contentDiv.querySelector('.azura-dialogue-container')) return;

  // Create container for AzuraDialogue
  const azuraContainer = document.createElement('div');
  azuraContainer.className = 'azura-dialogue-container';
  azuraContainer.innerHTML = `
    <div style="display: flex; gap: 20px; align-items: flex-start; margin-bottom: 20px;">
      <div style="display: flex; flex-direction: column; align-items: center; gap: 12px; flex-shrink: 0;">
        <div style="width: 80px; height: 80px; border-radius: 50%; overflow: hidden; background: linear-gradient(135deg, rgba(81, 104, 255, 0.1), rgba(98, 190, 143, 0.1)); border: 3px solid rgba(81, 104, 255, 0.2); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(81, 104, 255, 0.15);">
          <img src="/uploads/${emotion === 'happy' ? 'HappyEmote' : emotion === 'confused' ? 'ConfusedEmote' : emotion === 'sad' ? 'SadEmote' : 'PainEmote'}.png" alt="Azura ${emotion}" style="width: 100%; height: 100%; object-fit: contain; padding: 8px;" />
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
          <span style="font-family: var(--font-primary, 'Poppins'), sans-serif; font-weight: 700; font-size: 0.875rem; color: var(--color-text-dark, #000000);">Azura</span>
          <span style="font-family: var(--font-secondary, 'Space Grotesk'), sans-serif; font-weight: 400; font-size: 0.75rem; color: var(--color-primary, #5168FF); opacity: 0.8;">AI Co-pilot</span>
        </div>
      </div>
      <div style="flex: 1; background: white; border-radius: 12px; padding: 20px 24px; border: 2px solid rgba(81, 104, 255, 0.15); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); position: relative;">
        <p style="font-family: var(--font-secondary, 'Space Grotesk'), sans-serif; font-weight: 400; font-size: 1rem; line-height: 1.6; color: var(--color-text-dark, #000000); margin: 0; white-space: pre-wrap; word-wrap: break-word;" class="azura-message">${message}</p>
      </div>
    </div>
  `;

  // Insert before the original content
  const originalContent = contentDiv.innerHTML;
  contentDiv.innerHTML = '';
  contentDiv.appendChild(azuraContainer);
};

const applyStyles = () => {
  const tooltip = document.querySelector('.introjs-tooltip') as HTMLElement;
  if (!tooltip) return;

  // Inject style tag to override intro.js defaults
  let styleTag = document.getElementById('introjs-custom-styles');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'introjs-custom-styles';
    document.head.appendChild(styleTag);
    styleTag.textContent = `
      .introjs-overlay {
        background-color: rgba(0, 0, 0, 0.5) !important;
      }
      .introjs-tooltip {
        background-color: rgb(244, 245, 254) !important;
        border: 2px solid white !important;
        border-radius: 16px !important;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
        padding: 32px !important;
        overflow: hidden !important;
        min-width: 700px !important;
        max-width: 900px !important;
        width: auto !important;
        position: fixed !important;
        left: 50% !important;
        top: 50% !important;
        transform: translate(-50%, -50%) !important;
      }
      .introjs-tooltiptitle {
        font-family: var(--font-primary), Poppins, sans-serif !important;
        font-weight: var(--font-weight-bold) !important;
        font-size: 2.5rem !important;
        color: var(--color-text-dark) !important;
        margin-bottom: 20px !important;
        line-height: 1.2 !important;
      }
      .introjs-tooltipcontent {
        font-family: var(--font-secondary), "Space Grotesk", sans-serif !important;
        font-weight: var(--font-weight-regular) !important;
        font-size: 1.25rem !important;
        color: var(--color-text-dark) !important;
        line-height: 1.7 !important;
      }
      .introjs-tooltipbuttons {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        gap: 8px !important;
        border-top: 1px solid rgba(81, 104, 255, 0.2) !important;
        padding-top: 16px !important;
        margin-top: 16px !important;
      }
      .introjs-button {
        font-family: var(--font-button), "IBM Plex Mono", monospace !important;
        font-weight: var(--font-weight-semibold) !important;
        text-transform: uppercase !important;
        letter-spacing: 0.05em !important;
        padding: 12px 24px !important;
        border-radius: 8px !important;
        cursor: pointer !important;
        transition: all 0.3s ease !important;
        font-size: 0.875rem !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
        border: 2px solid !important;
      }
      .introjs-prevbutton {
        background-color: transparent !important;
        color: var(--color-text-dark) !important;
        border-color: var(--color-text-dark) !important;
        margin-right: auto !important;
        margin-left: 0 !important;
      }
      .introjs-prevbutton:hover {
        background-color: var(--color-text-dark) !important;
        color: var(--color-text-light) !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
      }
      .introjs-nextbutton {
        background-color: var(--color-primary) !important;
        color: var(--color-text-light) !important;
        border-color: var(--color-primary) !important;
        margin-left: auto !important;
        margin-right: 0 !important;
      }
      .introjs-nextbutton:hover {
        background-color: #3d52e6 !important;
        border-color: #3d52e6 !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 4px 12px rgba(81, 104, 255, 0.4) !important;
      }
      .introjs-donebutton {
        background-color: var(--color-secondary) !important;
        color: var(--color-text-light) !important;
        border-color: var(--color-secondary) !important;
      }
      .introjs-donebutton:hover {
        background-color: #4fa87a !important;
        border-color: #4fa87a !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 4px 12px rgba(98, 190, 143, 0.4) !important;
      }
      .introjs-skipbutton {
        white-space: nowrap !important;
        font-family: var(--font-button), "IBM Plex Mono", monospace !important;
        font-size: 0.875rem !important;
        background: transparent !important;
        border: none !important;
        text-decoration: underline !important;
        cursor: pointer !important;
        color: var(--color-text-dark) !important;
        position: absolute !important;
        right: 24px !important;
        top: 24px !important;
        margin: 0 !important;
      }
      .introjs-skipbutton:hover {
        color: var(--color-primary) !important;
      }
      .introjs-bullets {
        display: none !important;
      }
      .introjs-progress {
        background-color: rgba(81, 104, 255, 0.2) !important;
        border-radius: 10px !important;
        height: 6px !important;
        margin-bottom: 16px !important;
      }
      .introjs-progressbar {
        background: linear-gradient(90deg, var(--color-primary), var(--color-secondary)) !important;
        height: 100% !important;
        border-radius: 10px !important;
        transition: width 0.3s ease !important;
      }
    `;
  }

  // Hide bullets to fix duplicate progress bars
  const bullets = tooltip.querySelector('.introjs-bullets') as HTMLElement;
  if (bullets) {
    bullets.style.display = 'none';
  }
};

export const startOnboardingTour = async () => {
  if (typeof window === 'undefined') return;
  
  const introJs = (await import('intro.js')).default;
  const intro = introJs.tour();
  const steps = getTourSteps();
  
  // Helper to get current step index (using type assertion for private property)
  const getCurrentStepIndex = (): number => {
    const introAny = intro as any;
    return introAny._currentStep ?? introAny.currentStep ?? 0;
  };
  
  intro.setOptions({
    steps: steps.map(step => ({
      title: step.title,
      intro: step.intro,
      element: step.element,
    })),
    showProgress: true,
    showBullets: false,
    exitOnOverlayClick: false,
    exitOnEsc: true,
    nextLabel: 'Next →',
    prevLabel: '← Previous',
    skipLabel: 'Skip Tour',
    doneLabel: 'Got it!',
    overlayOpacity: 0.5,
  });

  intro.onbeforechange((targetElement: HTMLElement) => {
    setTimeout(() => {
      applyStyles();
      const currentStepIndex = getCurrentStepIndex();
      if (steps[currentStepIndex]) {
        const step = steps[currentStepIndex];
        const tooltip = document.querySelector('.introjs-tooltip') as HTMLElement;
        if (tooltip) {
          injectAzuraDialogue(tooltip, step.intro, step.emotion);
        }
      }
    }, 10);
    return true;
  });

  intro.onafterchange((targetElement: HTMLElement) => {
    setTimeout(() => {
      applyStyles();
      const currentStepIndex = getCurrentStepIndex();
      if (steps[currentStepIndex]) {
        const step = steps[currentStepIndex];
        const tooltip = document.querySelector('.introjs-tooltip') as HTMLElement;
        if (tooltip) {
          injectAzuraDialogue(tooltip, step.intro, step.emotion);
        }
      }
    }, 10);
    setTimeout(() => {
      applyStyles();
      const currentStepIndex = getCurrentStepIndex();
      if (steps[currentStepIndex]) {
        const step = steps[currentStepIndex];
        const tooltip = document.querySelector('.introjs-tooltip') as HTMLElement;
        if (tooltip) {
          injectAzuraDialogue(tooltip, step.intro, step.emotion);
        }
      }
    }, 100);
    
    // Ensure overlay is visible
    const overlay = document.querySelector('.introjs-overlay') as HTMLElement;
    if (overlay) {
      overlay.style.display = 'block';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    }
  });

  intro.start();
  
  // Inject AzuraDialogue for first step
  setTimeout(() => {
    const tooltip = document.querySelector('.introjs-tooltip') as HTMLElement;
    if (tooltip && steps[0]) {
      injectAzuraDialogue(tooltip, steps[0].intro, steps[0].emotion);
    }
  }, 100);
  
  intro.oncomplete(() => {
    localStorage.setItem('hasSeenOnboardingTour', 'true');
  });
  
  intro.onexit(() => {
    localStorage.setItem('hasSeenOnboardingTour', 'true');
  });
};

const OnboardingTour: React.FC = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const hasSeenTour = localStorage.getItem('hasSeenOnboardingTour');
    
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        startOnboardingTour();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, []);

  return null;
};

export default OnboardingTour;

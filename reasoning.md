# Mobile Onboarding Implementation - Reasoning Document

## Overview

This document explains the implementation of mobile onboarding screens for the Mental Wealth Academy. The feature introduces first-time mobile visitors to the platform's key concepts before they enter the main application.

## Problem Statement

Mobile users clicking "Enter Academy" on the landing page were immediately redirected to `/home` without any context about what the Academy offers. This missed an opportunity to:
- Set expectations about the platform's purpose
- Highlight key features (AI learning, communities, governance)
- Create a more engaging first impression
- Offer wallet connection at an appropriate moment

## Solution

A 5-screen onboarding flow that appears only for first-time mobile visitors, with localStorage persistence to ensure returning users skip directly to the app.

## Files Created

### 1. `components/mobile-onboarding/MobileOnboarding.tsx`

**Purpose:** Main React component managing the onboarding experience.

**Key Decisions:**

- **State Management:** Used React's `useState` for screen index and animation direction. No external state library needed for this isolated feature.

- **Animation:** Chose Framer Motion's `AnimatePresence` with `mode="wait"` for clean slide transitions. The `direction` state tracks whether user is moving forward or backward to animate appropriately.

- **Body Scroll Lock:** Implemented via `useEffect` that sets `document.body.style.overflow = 'hidden'` on mount and restores original value on unmount. This prevents background scrolling while the overlay is open.

- **localStorage Key:** Used `hasSeenMobileOnboarding` as the storage key. Checked on component mount in the parent (`MobileEnterButton`) to determine whether to show onboarding.

- **Icon Library:** Selected `@phosphor-icons/react` for icons because:
  - Consistent duotone style matches the design aesthetic
  - Tree-shakeable (only imports used icons)
  - Well-maintained with good TypeScript support

- **Screen Content:** Followed the brand voice guidelines with research-focused, community-oriented messaging. Each screen introduces one concept:
  1. Welcome - Platform identity
  2. AI Learning - Adaptive content
  3. Networks - Community aspect
  4. Governance - Participation/voting
  5. Call to Action - Wallet or guest entry

### 2. `components/mobile-onboarding/MobileOnboarding.module.css`

**Purpose:** Scoped styles for the onboarding component.

**Key Decisions:**

- **Design Tokens:** Used existing CSS custom properties exclusively:
  - `var(--gradient-futuristic-floss)` for background
  - `var(--font-secondary)` (Space Grotesk) for titles
  - `var(--font-primary)` (Poppins) for body text
  - `var(--font-button)` (IBM Plex Mono) for buttons
  - `var(--color-primary)` (#5168FF) for accent elements
  - `var(--z-modal)` (400) for overlay stacking

- **Mobile-Only Display:** Added `@media (min-width: 769px) { display: none; }` to ensure the overlay never appears on desktop, even if accidentally triggered.

- **Safe Area Handling:** Used `env(safe-area-inset-bottom)` in padding to account for notched devices and home indicators.

- **Progress Dots:** Active dot expands horizontally (8px → 24px) rather than changing color alone, providing clearer visual feedback.

- **Navigation Visibility:** Last screen hides Back/Next buttons via `visibility: hidden` (not `display: none`) to maintain layout stability while showing wallet action buttons instead.

## Files Modified

### `components/landing/MobileEnterButton.tsx`

**Changes Made:**

1. Added state variables:
   - `showOnboarding` - Controls overlay visibility
   - `hasCheckedStorage` - Prevents flash of incorrect content
   - `shouldShowOnboarding` - Cached localStorage result

2. Added `useEffect` to check localStorage on mount

3. Modified click handler to conditionally show onboarding or navigate directly

4. Added conditional rendering of `MobileOnboarding` component

**Why This Approach:**

- **Hydration Safety:** The `hasCheckedStorage` flag prevents server/client mismatch. The button renders disabled until client-side localStorage check completes.

- **Separation of Concerns:** The `MobileEnterButton` owns the decision logic (show onboarding vs navigate), while `MobileOnboarding` owns the onboarding experience. This keeps each component focused.

- **Navigation Method:** Used `window.location.replace('/home')` instead of Next.js router to match existing behavior and ensure a clean navigation without adding to browser history.

## Dependencies Added

### `@phosphor-icons/react`

**Rationale:**
- The plan specified Phosphor icons with specific icon names
- Provides duotone weight option for richer visual appearance
- Better tree-shaking than icon fonts
- Good TypeScript definitions

**Note:** The original plan specified a `Vote` icon which doesn't exist in Phosphor. Substituted with `Scales` which represents governance/balanced decision-making appropriately.

## Technical Considerations

### Animation Performance

- Used CSS transforms (`x` property) rather than `left`/`right` for GPU-accelerated animations
- Duration of 300ms (`var(--duration-normal)`) balances smoothness with responsiveness
- Easing curve `[0, 0, 0.2, 1]` matches `var(--ease-out)` for consistent feel

### Accessibility

- All buttons have `type="button"` to prevent form submission
- Semantic heading (`h1`) for screen titles
- Progress dots are decorative (screen readers would use Skip/navigation buttons)

### Future Improvements

1. **Wallet Integration:** The "Connect Wallet" button currently just completes onboarding. Should be wired to actual wallet connection flow.

2. **Swipe Gestures:** Could add touch swipe support for more natural mobile navigation.

3. **Analytics:** Could track which screen users skip from or complete to understand engagement.

4. **A/B Testing:** localStorage key could include a version number to re-show onboarding when content changes significantly.

## Testing Checklist

- [ ] Mobile viewport (<768px): Onboarding appears on first visit
- [ ] Desktop viewport (≥769px): Onboarding never appears
- [ ] Skip button: Completes onboarding, navigates to /home
- [ ] Navigate all 5 screens with Next/Back
- [ ] "Continue as Guest": Completes onboarding, navigates to /home
- [ ] Return visit: Skips directly to /home
- [ ] Clear localStorage: Onboarding reappears

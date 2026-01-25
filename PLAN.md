# Sealed Library Implementation Plan

## Overview
Transform the static Library page into a dynamic "Sealed Library" system where users progress through 12 courses (chapters) by completing daily writing prompts. Azura acts as the mystical gatekeeper who unseals chapters when users demonstrate consistent engagement.

## Core Mechanics

### Chapter Progression
- **12 Chapters** representing the 12-week mental wellness curriculum
- Each chapter starts **sealed** and must be unlocked through consistent writing
- Complete **7 days of writing** within a chapter to unseal the next one
- Visual progression: Sealed (locked) → In Progress (cracking) → Unsealed (open)

### Writing Prompts System
- Each chapter contains **7 daily writing prompts** themed to that chapter's topic
- Users write journal-style responses (minimum character count enforced)
- One prompt unlocks per day - can't speed run the course
- Miss a day? Continue from where you left off (no penalty for pauses)
- Writing history saved and viewable

### Azura Integration
- Azura appears as the **gatekeeper** for each sealed chapter
- Shows different emotions based on progress:
  - `confused` - Chapter sealed, hasn't started
  - `happy` - Making progress, encouragement
  - `pain` - Long absence, gentle nudge to return
- When 7 writings complete, Azura **unseals** the chapter with celebratory dialogue
- Short contextual messages about each chapter's theme

### Rewards
- **Shards awarded** for each completed writing (10 shards)
- **Bonus shards** (50) when unsealing a new chapter
- $MWG token rewards tracked for future distribution

---

## Database Schema Changes

### New Tables

```sql
-- Course chapters metadata
CREATE TABLE library_chapters (
  id SERIAL PRIMARY KEY,
  chapter_number INTEGER NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  theme VARCHAR(100),
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Writing prompts for each chapter
CREATE TABLE library_prompts (
  id SERIAL PRIMARY KEY,
  chapter_id INTEGER REFERENCES library_chapters(id),
  day_number INTEGER NOT NULL, -- 1-7
  prompt_text TEXT NOT NULL,
  placeholder_text VARCHAR(255),
  min_characters INTEGER DEFAULT 100,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(chapter_id, day_number)
);

-- User progress tracking
CREATE TABLE user_chapter_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  chapter_id INTEGER REFERENCES library_chapters(id),
  status VARCHAR(20) DEFAULT 'locked', -- locked, in_progress, unsealed
  started_at TIMESTAMP,
  unsealed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, chapter_id)
);

-- User writing entries
CREATE TABLE user_writings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  chapter_id INTEGER REFERENCES library_chapters(id),
  prompt_id INTEGER REFERENCES library_prompts(id),
  content TEXT NOT NULL,
  word_count INTEGER,
  shards_awarded INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);
```

---

## API Endpoints

### GET `/api/library/chapters`
Returns all chapters with user's progress status.

### GET `/api/library/chapters/[id]`
Returns chapter details with prompts and user's writings.

### GET `/api/library/chapters/[id]/current-prompt`
Returns the next available prompt for the user (or null if day already complete).

### POST `/api/library/writings`
Submit a writing entry. Awards shards, checks for chapter completion.

### GET `/api/library/writings`
Get user's writing history.

### POST `/api/library/chapters/[id]/unseal`
Called when 7 writings complete. Awards bonus shards, updates status.

---

## Component Structure

### New Components

```
components/
  sealed-library/
    SealedLibrary.tsx           # Main container replacing current library content
    SealedLibrary.module.css
    ChapterCard.tsx             # Individual chapter card with seal state
    ChapterCard.module.css
    ChapterDetail.tsx           # Full chapter view with prompts
    ChapterDetail.module.css
    WritingPrompt.tsx           # Writing interface with editor
    WritingPrompt.module.css
    ProgressIndicator.tsx       # 7-day progress dots
    ProgressIndicator.module.css
    AzuraGatekeeper.tsx         # Azura dialogue for chapter gatekeeper
    AzuraGatekeeper.module.css
    UnsealAnimation.tsx         # Celebration animation when unsealing
    UnsealAnimation.module.css
```

### Component Details

**ChapterCard.tsx**
- Shows chapter number, title, and seal status
- Three visual states: locked (greyed seal), in_progress (cracking seal), unsealed (open)
- Progress indicator showing days completed (e.g., "4/7")
- Click to open ChapterDetail modal

**ChapterDetail.tsx**
- Full chapter view with Azura at top
- List of 7 prompts with completion status
- Current/next prompt highlighted
- Writing history accordion for completed prompts

**WritingPrompt.tsx**
- Textarea with character counter
- Minimum character validation
- Save button with loading state
- Auto-save draft to localStorage

**AzuraGatekeeper.tsx**
- Wraps existing AzuraDialogue component
- Different messages per chapter theme
- Different emotions based on progress state
- Animated seal-breaking sequence when chapter unlocked

---

## File Changes

### Modified Files
1. `app/library/page.tsx` - Replace static content with SealedLibrary component
2. `app/library/page.module.css` - Keep hero section, add sealed library styles
3. `lib/db.ts` - Add database queries for new tables (if not using separate file)

### New Files
1. `components/sealed-library/*` - All new components listed above
2. `app/api/library/chapters/route.ts` - List chapters endpoint
3. `app/api/library/chapters/[id]/route.ts` - Single chapter details
4. `app/api/library/chapters/[id]/current-prompt/route.ts` - Next prompt
5. `app/api/library/writings/route.ts` - Submit/list writings
6. `lib/library-queries.ts` - Database queries for library system
7. Database migration file for new tables

---

## Implementation Order

### Phase 1: Database & API (Backend)
1. Create database migration with all tables
2. Seed 12 chapters with titles/descriptions
3. Seed 7 prompts per chapter (84 total prompts)
4. Implement all API endpoints
5. Test endpoints with curl/Postman

### Phase 2: Core Components (Frontend)
1. Create ChapterCard component with visual states
2. Create SealedLibrary grid layout
3. Integrate with chapters API
4. Add loading states and error handling

### Phase 3: Writing Experience
1. Create WritingPrompt component
2. Create ChapterDetail modal
3. Implement writing submission flow
4. Add character counter and validation

### Phase 4: Azura Integration
1. Create AzuraGatekeeper component
2. Write dialogue scripts per chapter
3. Implement emotion logic based on progress
4. Add unseal animation/celebration

### Phase 5: Polish
1. Add ProgressIndicator component
2. Implement shard rewards with animation
3. Add writing history view
4. Mobile responsiveness pass
5. Performance optimization

---

## Chapter Content (Seed Data)

| # | Title | Theme | Azura Intro |
|---|-------|-------|-------------|
| 1 | The First Step | Self-Awareness | "Every journey begins with a single thought. Let us explore who you truly are..." |
| 2 | Emotional Currents | Emotional Intelligence | "Emotions are like water - they shape us even when we don't notice..." |
| 3 | The Inner Critic | Self-Compassion | "That voice inside that judges you? Let's learn to quiet it together..." |
| 4 | Building Bridges | Relationships | "Connection is the foundation of wellness. Who are the pillars in your life?" |
| 5 | Stillness Within | Mindfulness | "In silence, we find clarity. Let us practice the art of presence..." |
| 6 | Resilient Spirit | Coping Skills | "Life's storms will come. Here, you'll learn to weather them..." |
| 7 | Purpose & Meaning | Values Exploration | "What lights the fire within you? Let's discover your north star..." |
| 8 | Body & Mind | Physical Wellness | "Your body carries your spirit. How do we honor this vessel?" |
| 9 | Creative Flow | Expression & Art | "Creativity heals what words cannot reach. Let your spirit speak..." |
| 10 | Community Bonds | Social Support | "No one walks alone. Your community is your strength..." |
| 11 | Future Self | Goal Setting | "Who do you wish to become? Let's paint that vision together..." |
| 12 | The Unsealed Path | Integration | "You've journeyed far. Now, all your wisdom becomes one..." |

---

## Visual Design Notes

### Sealed State
- Brutalist card with heavy border
- Azura seal image overlaid (greyscale)
- Lock icon in corner
- Muted colors, opacity reduced

### In Progress State
- Seal shows cracks/breaks
- Some color returning
- Progress dots visible (filled = complete)
- Azura's eye peeks through crack

### Unsealed State
- Full color card
- Seal broken/removed
- Chapter content fully visible
- Golden border accent
- Checkmark badge

### Writing Interface
- Clean, distraction-free textarea
- Brutalist border styling
- Character counter at bottom
- Azura small avatar in corner with encouraging expression

---

## Success Metrics
- User completes first writing
- User unseals first chapter (completes 7 days)
- User reaches chapter 6 (halfway)
- User completes all 12 chapters
- Average words per writing entry
- Retention rate (return after 3+ days)

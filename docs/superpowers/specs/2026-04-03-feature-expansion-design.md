# AMA 214 Practice Exam — Feature Expansion

## Overview

Six new features for the existing Hydraulics & Pneumatics practice exam app. All features are client-side only (localStorage, no backend), mobile-first, and follow the existing black/white/orange design system.

## Feature 1: Progress Persistence (Data Layer)

Foundation for all history-dependent features.

### Data Model

A `HistoryContext` React context backed by localStorage stores two data structures:

**Exam attempts** — array of:
```js
{
  id: string,         // crypto.randomUUID()
  date: number,       // Date.now()
  mode: string,       // "exam" | "study" | "weak"
  section: string,    // section key if mode is "study", null otherwise
  score: number,      // correct count
  total: number,      // total questions
  elapsed: number,    // seconds
  sectionScores: [    // per-section breakdown
    { key: string, correct: number, total: number }
  ],
  missedQuestionIds: number[]
}
```

**Per-question stats** — object keyed by question ID:
```js
{
  [questionId]: {
    timesAnswered: number,
    timesCorrect: number
  }
}
```

### Implementation

- `HistoryContext.jsx` provides `{ attempts, questionStats, saveAttempt, clearHistory }`
- `saveAttempt(data)` writes to both structures atomically and persists to localStorage
- JSON stored under keys `hydr-pnu-attempts` and `hydr-pnu-qstats`
- `clearHistory()` wipes both keys with a confirmation prompt handled by the caller
- Context provider wraps the app at the same level as `ThemeProvider`

### Mobile

localStorage is reliable on iOS Safari and Android Chrome. Payloads are small — only IDs and numbers, never full question text. Worst case at 1000 attempts is ~200KB, well within the 5MB localStorage limit.

---

## Feature 2: Study Mode

Drill a specific section without timer pressure.

### UX Flow

1. On the home screen, each section row becomes tappable
2. Tapping a section starts a study session with only that section's questions (randomized)
3. The exam header shows "STUDY: {Section Name}" instead of the timer
4. Navigation, feedback, and diagrams work identically to full exam mode
5. On finish, results are shown and saved to history with `mode: "study"` and the section key

### Changes

- **HomeScreen**: Section rows get `onClick` handlers and a hover/active state. Add a subtle "tap to practice" hint text below the sections card.
- **App.jsx**: New `startStudy(sectionKey)` function that filters questions by section, sets `mode` state
- **ExamScreen**: Accept a `mode` prop. When `mode === "study"`, show the study badge instead of timer. Timer still runs internally for results tracking but is not displayed.
- **ResultsScreen**: Show mode badge ("Study: Hydraulic Fluids") in the results header

### Mobile

Section rows are already full-width. Adding tap targets keeps the same touch-friendly layout. No new UI patterns.

---

## Feature 3: Weak Area Focus

Auto-generated practice set from your most-missed questions.

### Algorithm

1. From `questionStats`, find all questions with `timesAnswered >= 1` and `timesCorrect / timesAnswered < 0.5`
2. Sort by correctness rate ascending (worst first)
3. If fewer than 5 weak questions, backfill with least-answered questions (prioritizes coverage)
4. Randomize the final set

### UX Flow

1. A "DRILL WEAK AREAS" button appears on the home screen below the sections card, only when at least 1 attempt exists in history
2. If no weak questions exist yet, the button text changes to "DRILL LEAST PRACTICED" and uses the backfill set
3. Tapping starts an exam session with `mode: "weak"`
4. Same exam/results flow, saved to history with `mode: "weak"`

### Changes

- **HomeScreen**: Conditional "DRILL WEAK AREAS" button. Receives `questionStats` and `attempts` from history context to determine visibility and question set.
- **App.jsx**: New `startWeakDrill()` function that computes the weak set and starts the exam

### Mobile

Single button, same width as "BEGIN EXAM". No layout changes.

---

## Feature 4: Exam History Dashboard

Track your progress over time.

### New Component: `HistoryScreen`

**Stats summary** (top of screen):
- Total attempts
- Best score (%)
- Average score (%)
- Total study time (formatted)

**Trend chart:**
- Inline SVG line chart showing score % over time for full exam attempts
- Hand-drawn SVG (no chart library) following the existing diagram pattern
- Orange (`#F97316`) line, theme-aware gray axes and labels
- X-axis: attempt number. Y-axis: score %. 70% threshold shown as a dashed line
- Scales to container width. If fewer than 2 full exam attempts, chart is hidden

**Attempt list:**
- Cards sorted newest-first, scrollable
- Each card shows: date (formatted), score %, time taken, mode badge, pass/fail color
- Mode badges: "Full Exam" / "Study: {Section}" / "Weak Areas"
- Tapping a card does not navigate anywhere (no review of past attempts — questions were randomized)

**Clear History:**
- "Clear All History" button at the bottom
- Shows a confirmation prompt before clearing
- Returns to home screen after clearing

### Changes

- **New files**: `HistoryScreen.jsx`, `HistoryScreen.css`
- **HomeScreen**: Add "HISTORY" button (only when attempts exist)
- **App.jsx**: New `screen: "history"` state, navigation to/from history

### Mobile

Cards stack vertically, full-width. SVG chart scales like existing diagrams. Standard scroll behavior.

---

## Feature 5: Share Results

Share your score with classmates after finishing an exam.

### UX Flow

1. "SHARE" button on the results screen, alongside "RETAKE EXAM" and "HOME"
2. Generates formatted text:
   ```
   AMA 214: Hydraulics & Pneumatics
   Score: 87% (126/145) — PASSED
   Time: 01:23:45
   Weakest: Pneumatic Systems (60%)
   Practice at: xaraphimm.github.io/hydr-pnu-exam
   ```
3. On mobile: uses Web Share API (`navigator.share({ text })`) — opens native share sheet
4. On desktop: falls back to `navigator.clipboard.writeText()` — button text changes to "COPIED!" for 2 seconds

### Share Text Logic

- "Weakest" line shows the section with the lowest percentage (only if at least one section scored below 100%)
- If mode is "study", the first line becomes "AMA 214: Hydraulic Fluids (Study)"
- The practice URL uses `window.location.origin + window.location.pathname` so it works regardless of deploy target

### Changes

- **ResultsScreen**: Add share button, share text generation function, Web Share API call with clipboard fallback

### Mobile

Web Share API is supported on iOS Safari 15+ and Android Chrome. The native share sheet is the ideal mobile UX. No fallback needed on modern mobile browsers, but the clipboard fallback handles edge cases.

---

## Feature 6: PWA / Offline Support

App works without internet after first load. Installable on mobile home screens.

### Manifest

`public/manifest.json`:
- `name`: "AMA 214: Hydraulics & Pneumatics"
- `short_name`: "AMA 214 Exam"
- `theme_color`: "#F97316"
- `background_color`: "#000000"
- `display`: "standalone"
- `icons`: Generated from the PHNX logo at 192x192 and 512x512

### Service Worker

Use `vite-plugin-pwa` (VitePWA) for automatic service worker generation:
- **Strategy**: Precache all built assets (JS, CSS, images, logo)
- Total app size is ~100KB gzipped — precaching everything is appropriate
- No runtime caching strategy needed (no API calls)
- Auto-update: when a new version is deployed, prompt the user to refresh

### Icons

Generate PWA icons from the existing PHNX logo:
- 192x192 PNG
- 512x512 PNG
- Place in `public/` directory

### Changes

- **New files**: `public/manifest.json`, `public/icon-192.png`, `public/icon-512.png`
- **Modify**: `vite.config.js` (add VitePWA plugin), `index.html` (manifest link, meta tags)
- **New dependency**: `vite-plugin-pwa`

### Mobile

This is primarily a mobile feature. iOS Safari and Android Chrome both support PWA install. The app launches full-screen from the home screen with an orange splash screen. All localStorage data persists offline.

---

## Implementation Order

Features should be built in this order due to dependencies:

1. **Progress Persistence** — foundation, no dependencies
2. **Study Mode** — depends on persistence for saving results
3. **Weak Area Focus** — depends on persistence for question stats
4. **Exam History Dashboard** — depends on persistence for attempt data
5. **Share Results** — independent, but makes more sense after modes exist
6. **PWA / Offline** — independent, best done last as a final polish

## Design Constraints

- **No backend, no database** — all client-side localStorage
- **No new CSS framework** — continue with scoped CSS and existing custom properties
- **No chart library** — hand-drawn SVG for the trend chart
- **Mobile-first** — all new UI must work on 320px+ screens with 48px+ touch targets
- **Follow existing patterns** — BEM-style class names, component structure, theme variables

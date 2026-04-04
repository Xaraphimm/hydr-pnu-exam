# Flashcard Mode

## Overview

A separate flashcard study mode accessible via a persistent bottom tab bar. Users pick a section (or all questions), flip through cards one at a time, self-grade "Got It" or "Missed It", and can turn missed cards into a focused study deck. Shares the existing `questionStats` from HistoryContext — both flashcards and exams contribute to the same mastery data.

## Navigation: Bottom Tab Bar

A fixed tab bar at the bottom of the viewport with two tabs:

- **Exam** (clipboard icon) — All existing screens: home, exam, results, history
- **Flashcards** (card-stack icon) — Flashcard home, card screen, session complete

### Behavior

- Always visible on all screens (exam and flashcard flows)
- Active tab highlighted with orange accent color (`--color-accent`)
- Subtle top border (`--color-border-light`)
- Tab icons are simple inline SVG, no icon library
- Switching tabs preserves state within each tab (e.g. mid-exam progress is not lost when switching to flashcards and back)
- Fixed position at viewport bottom, content scrolls above it
- Height: ~56px with 48px+ touch targets

### Architecture Impact

The current `App.jsx` uses a `screen` state to route between screens. Adding a tab bar means introducing a top-level `tab` state (`"exam"` | `"flashcards"`) that determines which flow is shown. Each tab has its own internal screen state:

- Exam tab: `home` | `exam` | `results` | `history` (existing)
- Flashcards tab: `flashcard-home` | `flashcard-session` | `flashcard-complete`

Both tabs render simultaneously but only the active tab is visible (`display: none` on the inactive tab to preserve state).

## Flashcard Home Screen

Shown when the Flashcards tab is active and no session is in progress.

### Content

- **Header:** "Flashcards" title
- **"All Questions" row** at the top — shows total card count and overall mastery
- **Section list** — Same 7 sections as the exam home screen. Each row shows:
  - Section name
  - Card count (e.g. "27 cards")
  - Mastery indicator when stats exist (e.g. "12/27 mastered") in green text
- Tapping a row starts a flashcard session for that section/all

### Mastery Definition

A question is "mastered" when it has been answered at least 4 times via flashcards or exams AND `timesCorrect / timesAnswered >= 0.75`. This means getting it right at least 3 out of 4 times.

## Card Screen

Shows one card at a time during a flashcard session.

### Layout

- **Top bar:** Progress counter ("Card 5 / 27"), section name badge
- **Card area:** Large card component centered on screen
  - **Front (unflipped):** Question text (fill-in-the-blank). Diagram rendered below the question if one exists for this question.
  - **Back (flipped):** Correct answer highlighted in orange, explanation text below
- **Flip interaction:** Tap anywhere on the card to flip. CSS 3D transform animation (`rotateY(180deg)`, ~0.4s transition). Card has `perspective` on the container for depth effect.
- **Grading buttons:** Appear below the card ONLY after flipping:
  - "GOT IT" — green background (`--color-correct`), white text
  - "MISSED IT" — red background (`--color-incorrect`), white text
  - Both are large touch targets (full-width, stacked vertically, 48px+ height)
- Tapping either button records the result and advances to the next card
- Cards are shuffled at session start

### Data Recording

Each "Got It" or "Missed It" updates the existing `questionStats` in HistoryContext:
- "Got It" → `timesAnswered + 1`, `timesCorrect + 1`
- "Missed It" → `timesAnswered + 1`, `timesCorrect` unchanged

This uses a new `recordFlashcard(questionId, gotIt)` function on HistoryContext that updates only the per-question stats (no attempt record created — flashcard sessions are lighter than exams).

## Session Complete Screen

Shown after the last card in a session.

### Content

- **Score summary:** "15 Got It / 12 Missed" with green and red coloring
- **Visual bar:** Horizontal bar split green (got it) and red (missed), proportional widths
- **Missed cards list** (if any missed):
  - Each missed card shows the question text and correct answer
  - Scrollable list
- **Actions:**
  - "STUDY MISSED CARDS" button (orange, prominent) — starts a new flashcard session using only the missed cards from this session. Only shown if there are missed cards.
  - "DONE" button (secondary) — returns to flashcard home

## New Files

```
src/
├── components/
│   ├── TabBar.jsx              — Bottom tab bar component
│   ├── TabBar.css              — Tab bar styles (fixed bottom, icons, active state)
│   ├── FlashcardHome.jsx       — Section picker for flashcards
│   ├── FlashcardHome.css       — Flashcard home styles
│   ├── FlashcardSession.jsx    — Card flip, grading, progression
│   ├── FlashcardSession.css    — Card styles, 3D flip animation
│   ├── FlashcardComplete.jsx   — Session results, missed cards, study-missed
│   └── FlashcardComplete.css   — Complete screen styles
```

## Modified Files

- `src/App.jsx` — Add tab state, render TabBar, route flashcard screens, hide/show tabs
- `src/HistoryContext.jsx` — Add `recordFlashcard(questionId, gotIt)` function
- `src/styles/global.css` — Add bottom padding to `.container` to account for tab bar height

## Design Constraints

- No new dependencies — CSS 3D transforms for the flip animation, inline SVG for tab icons
- Mobile-first — all touch targets 48px+, card fills available width
- Follow existing patterns — BEM-style class names, CSS custom properties, component structure
- Cards reuse existing question data and diagram components
- Flashcard stats feed into the same `questionStats` that power weak area focus

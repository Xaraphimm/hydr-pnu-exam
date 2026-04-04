# PHNX A&P Exam Prep — Multi-Topic Redesign

**Date:** 2026-04-04
**Status:** Draft
**Author:** xaraphimm + Claude

## Overview

Transform the existing single-topic Hydraulics & Pneumatics exam review app into a comprehensive FAA Airframe & Powerplant (A&P) study platform. The app will cover all Airframe (15 subtopics) and Powerplant (14 subtopics) exam areas with three study modes per subtopic: textbook chapter reading, flashcards, and exam-style testing with progress tracking.

The goal is to replace the need for PrepWare or Dauntless by providing a free, offline-capable PWA that the user and their classmates can use to study for the FAA A&P knowledge exams.

## Scope

### In Scope
- Airframe (AMA) — 15 subtopics
- Powerplant (AMP) — 13 subtopics
- Three study modes per subtopic: Study (PDF), Flashcards, Test
- Per-question confidence tracking (1-5 levels)
- Global and per-subtopic progress dashboards
- Bookmarks, search, and personal notes
- PDF chapter viewer with pre-split chapter files
- Light and dark mode theming
- PWA with offline support

### Out of Scope
- General (AMG) exam section — explicitly excluded per user request
- User accounts or cloud sync — all data stays in localStorage
- Backend/API — remains a fully client-side static app
- Oral & Practical study guide sections from the ASA books (written exam focus only)

## Topic Structure

### Airframe (AMA — 100 questions, 2 hours, 70% to pass)

| ID | Subtopic | ASA Test Guide Pages | FAA Handbook Chapter |
|----|----------|---------------------|---------------------|
| AF-01 | Metallic Structures | 1-16 | TBD from FAA-H-8083-31B |
| AF-02 | Non-Metallic Structures | 17-28 | TBD |
| AF-03 | Flight Controls | 29-37 | TBD |
| AF-04 | Airframe Inspection | 38-39 | TBD |
| AF-05 | Landing Gear Systems | 40-52 | TBD |
| AF-06 | Hydraulic & Pneumatic Systems | 53-67 | TBD |
| AF-07 | Environmental Systems | 68-79 | TBD |
| AF-08 | Aircraft Instrument Systems | 80-88 | TBD |
| AF-09 | Communication & Navigation Systems | 89-96 | TBD |
| AF-10 | Aircraft Fuel Systems | 97-110 | TBD |
| AF-11 | Aircraft Electrical Systems | 111-127 | TBD |
| AF-12 | Ice & Rain Control Systems | 128-131 | TBD |
| AF-13 | Airframe Fire Protection Systems | 132-135 | TBD |
| AF-14 | Rotorcraft Fundamentals | 136-137 | TBD |
| AF-15 | Water & Waste Systems | 138 | TBD |

### Powerplant (AMP — 100 questions, 2 hours, 70% to pass)

| ID | Subtopic | ASA Test Guide Pages | FAA Handbook Chapter |
|----|----------|---------------------|---------------------|
| PP-01 | Reciprocating Engines | 1-17 | TBD from Aircraft Propulsion 2ed |
| PP-02 | Turbine Engines | 18-34 | TBD |
| PP-03 | Engine Inspection | 35-39 | TBD |
| PP-04 | Engine Instrument Systems | 40-47 | TBD |
| PP-05 | Engine Fire Protection Systems | 48-51 | TBD |
| PP-06 | Engine Electrical Systems | 52-61 | TBD |
| PP-07 | Engine Lubrication Systems | 62-74 | TBD |
| PP-08 | Ignition & Starting Systems | 75-92 | TBD |
| PP-09 | Engine Fuel & Fuel Metering Systems | 93-111 | TBD |
| PP-10 | Reciprocating Induction & Cooling Systems | 112-120 | TBD |
| PP-11 | Turbine Engine Air Systems | 121-122 | TBD |
| PP-12 | Engine Exhaust & Reverser Systems | 123-126 | TBD |
| PP-13 | Propellers | 127-143 | TBD |

Note: The "TBD" entries for FAA Handbook chapter page ranges will be filled in by cross-referencing the FAA-H-8083-31B table of contents (Airframe) and Aircraft Propulsion 2ed table of contents (Powerplant) during implementation.

## Source Materials

### Textbooks (for Study mode PDF viewer)
- **FAA-H-8083-31B** — Aviation Maintenance Technician Handbook (Airframe). 108MB. US government publication, public domain. Located at: `~/Library/Mobile Documents/com~apple~CloudDocs/A&P/ATA_Airframe/FAA-H-8083-31B_Aviation_Maintenance_Technician_Handbook.pdf`
- **Aircraft Propulsion 2ed** — Powerplant textbook. 19MB. Educational distribution exemption granted. Located at: `~/Library/Mobile Documents/com~apple~CloudDocs/A&P/Powerplant/Aircraft Propulsion 2ed.pdf`

### Question Banks (for Test and Flashcard modes)
- **2024 ASA Airframe Mechanic Test Guide Plus** — 29MB. Educational distribution exemption granted. Located at: `~/Downloads/2024 ASA Airframe.pdf`. Contains questions organized by the 15 Airframe subtopics with explanations and FAA ACS codes.
- **2024 ASA Powerplant Mechanic Test Guide Plus** — 29MB. Educational distribution exemption granted. Located at: `~/Downloads/2024 ASA Powerplant.pdf`. Contains questions organized by the 14 Powerplant subtopics.

### Question Format (from ASA Test Guides)
Each question follows this structure:
```
Question Number (e.g., 8107)
Question text
A — Choice A
B — Choice B
C — Choice C

Explanation in italics (ASA's explanation of the correct answer)
(FAA ACS Code) — Reference (e.g., (AM.II.A.K1) — FAA-H-8083-31)

Correct answer listed at bottom of page: 8107 [C]
```

## Architecture

### Navigation Flow

```
Homepage (scrollable topic list)
├── Global Readiness Ring (overall mastery %)
├── Search Bar
├── AIRFRAME section header (AMA, readiness %)
│   ├── Metallic Structures [compact row card]
│   ├── Non-Metallic Structures [compact row card]
│   ├── ... (15 total)
│   └── Water & Waste Systems [compact row card]
├── POWERPLANT section header (AMP, readiness %)
│   ├── Reciprocating Engines [compact row card]
│   ├── ... (13 total)
│   └── Propellers [compact row card]
└── Bottom Tab Bar: Home | Search | Bookmarks | Progress

Subtopic Interior (after tapping a topic card)
├── Back arrow + topic name + breadcrumb
├── Progress summary (%, tri-count bar, mastered/learning/new)
├── Three mode tiles
│   ├── Study → PDF chapter viewer (react-pdf)
│   ├── Flashcards → Card flip with Got It / Missed It
│   └── Test → Sub-mode selection
│       ├── All Questions (randomized, instant feedback)
│       ├── Weak Areas Only (confidence < threshold)
│       └── Mock Exam (timed, no feedback until end)
└── Recent Attempts (last 3 scores, link to full history)
```

### Bottom Tab Bar
- **Home** — The main topic list
- **Search** — Search across all questions by keyword
- **Bookmarks** — Saved questions and PDF pages
- **Progress** — Full dashboard showing mastery across all 28 subtopics

### Routing
Continue using React state-based routing (no router library). The navigation state expands to:

```
Top-level:
  tab: 'home' | 'search' | 'bookmarks' | 'progress'

Within Home tab:
  screen: 'topic-list' | 'subtopic'
  activeSubtopic: subtopic ID (e.g., 'AF-06')

Within Subtopic:
  mode: null | 'study' | 'flashcards' | 'test'
  testMode: 'all' | 'weak' | 'mock' (when mode === 'test')

Within Test/Flashcard sessions:
  (same session state as current app: questions, answers, flagged, etc.)
```

## Homepage Design

### Compact Row Cards
Each subtopic appears as a single compact row (~48px tall):
- **Left border** (3px) — color-coded by mastery state (non-overlapping ranges):
  - Green (#22c55e): 70%+ mastery (passing)
  - Orange (#F97316): 50-69% mastery (close to passing)
  - Red (#ef4444): 1-49% mastery (struggling)
  - Gray (#555 dark / #ccc light): not started (0 attempts)
- **Topic name** — 13px, semi-bold, left-aligned
- **Progress bar** — thin (3px) horizontal bar showing mastered (green) / learning (orange) / new (gray) segments
- **Mastery percentage** — right-aligned, color matches left border. Shows "--" if not started.

### Section Headers
Each category (AIRFRAME, POWERPLANT) gets a header showing:
- Category name in bold caps
- Exam code and format: "AMA - 100 Questions - 2 hrs"
- Overall readiness percentage for that category

### Global Readiness Ring
Top of homepage, shows:
- Circular progress ring with overall mastery percentage
- "X of Y questions mastered" subtitle
- "70% needed to pass" reminder
- Orange accent color for the ring

## Subtopic Interior Design

### Progress Summary Card
At the top of the subtopic view:
- Large mastery percentage (color-coded)
- Three-state progress bar (mastered/learning/new)
- Tri-count: "19 mastered - 5 learning - 2 new"

### Mode Tiles
Three equal-width tiles in a horizontal row:
- **Study** (book icon) — "Read the chapter"
- **Flashcards** (cards icon) — "Quick recall"
- **Test** (pencil icon) — "Exam practice" (highlighted with orange border)

### Test Sub-Options
When Test is selected, an options panel appears:
- **All Questions** — "[N] questions, randomized" — immediate feedback after each answer
- **Weak Areas Only** — "[N] questions below confidence" (red text for count) — focuses on weak material
- **Mock Exam** — "Timed, no feedback until end" — mirrors actual FAA test format (2-hour timer proportional to question count)

### Recent Attempts
Shows last 3 test attempts with:
- Date and time
- Score percentage and fraction (e.g., "92% (24/26)")
- Color-coded: green if >= 70%, orange if < 70%
- Link to full history with trend chart

## Study Mode (PDF Viewer)

### PDF Splitting Strategy
At build time, a Node.js script using `pdf-lib` splits each source textbook into per-chapter PDF files:

```
public/
  pdfs/
    airframe/
      metallic-structures.pdf      (pages X-Y from FAA-H-8083-31B)
      non-metallic-structures.pdf
      flight-controls.pdf
      ...
    powerplant/
      reciprocating-engines.pdf    (pages X-Y from Aircraft Propulsion 2ed)
      turbine-engines.pdf
      ...
```

### Build Script
- Input: source PDFs + page range config (defined in a JSON or JS config file)
- Output: per-chapter PDF files in `public/pdfs/`
- Library: `pdf-lib` (pure JS, no native deps)
- Source PDFs are in `.gitignore` — they live in iCloud, not the repo
- Split chapter PDFs are committed to the repo (they're small enough, 5-15MB each)
- Script runs as part of `npm run prebuild` or manually via `npm run split-pdfs`

### PDF Viewer Component
- Library: `react-pdf` (wraps Mozilla pdf.js)
- Renders the chapter PDF with:
  - Vertical scroll through all chapter pages
  - Pinch-to-zoom on mobile
  - Text selection (via pdf.js text layer)
  - Page indicator ("Page 3 of 15")
- Back button returns to the subtopic interior
- Bookmark button on each page to save the page for quick return

### PWA Caching
- Service worker caches chapter PDFs with a cache-first strategy
- Each chapter is a separate cache entry (5-15MB)
- Only chapters the user has opened get cached — no prefetching the full set
- Total worst-case cache: ~200-300MB if every chapter is cached, but typical usage will be much less

## Flashcard Mode

### Card Experience
Same core experience as the current app:
- Card shows question text on the front
- Tap to flip — reveals correct answer + explanation
- Two buttons: **Got It** (green) / **Missed It** (red)
- Progress bar at top showing position in the deck
- Back button to return to subtopic interior

### Deck Composition
- Scoped to the current subtopic's questions
- Shuffled on each session start (Fisher-Yates, same as current)
- At completion: summary screen showing missed cards with "Study Missed Cards" option

### Confidence Tracking Integration
Each "Got It" increments the question's confidence level (up to 5). Each "Missed It" decrements it (down to 1). This feeds into the mastery calculations on the homepage.

## Test Mode

### All Questions Mode
- All questions for the subtopic, randomized
- Instant feedback after each answer (correct/incorrect + explanation)
- Question navigator grid (existing feature)
- Flag questions for review (existing feature)
- Results screen at end with section breakdown and missed questions

### Weak Areas Only Mode
- Selects questions with confidence level 1-2 (below threshold)
- Backfills with least-practiced questions up to 20 if not enough weak questions
- Same UI as All Questions mode
- Helps target struggling areas specifically

### Mock Exam Mode
- Mirrors actual FAA exam format
- Timed: proportional to FAA exam (2 hours for 100 questions, scaled to subtopic question count)
- No feedback during the exam — just answer and move on
- Score revealed only at the end
- Results screen shows score, pass/fail against 70% threshold, missed questions with explanations

### Question Confidence System (Dauntless-inspired)
Every question has a confidence level from 1 to 5:
- **Level 1** — Consistently wrong. Priority for weak drills.
- **Level 2** — Getting wrong more than right. Below confidence threshold.
- **Level 3** — Starting to learn. Answered correctly a few times.
- **Level 4** — Solid. Consistently correct.
- **Level 5** — Mastered. Correct multiple times in a row.

Rules:
- New questions start at level 1 with 0 attempts
- Correct answer: level + 1 (max 5)
- Wrong answer: level - 1 (min 1)

Question states (for progress bar segments and tri-counts):
- "New" = 0 attempts (never seen by the student)
- "Learning" = level 1-3 with at least 1 attempt (seen but not yet mastered)
- "Mastered" = level 4 or 5 (consistently correct)

This replaces the current simple `timesAnswered` / `timesCorrect` tracking with a richer model that powers the homepage progress bars, weak area drills, and readiness calculations.

### Mastery Calculations
- **Subtopic mastery %** = (questions at level 4-5) / (total questions) * 100
- **Category readiness %** = weighted average of subtopic mastery percentages (weighted by question count)
- **Global readiness %** = (all questions at level 4-5) / (all questions) * 100
- **Passing threshold**: 70% (matches FAA exam requirement)

## Data Model

### Question Data Structure
Questions are stored in separate files per subtopic to keep file sizes manageable and allow incremental loading:

```
src/data/
  airframe/
    metallic-structures.js
    non-metallic-structures.js
    ...
  powerplant/
    reciprocating-engines.js
    ...
  index.js          (exports topic config + lazy loaders)
```

Each question file exports an array:
```js
export const questions = [
  {
    id: "AF01-8107",           // category + subtopic + ASA question number
    q: "Which statement is true regarding...",
    a: ["Choice A text", "Choice B text", "Choice C text"],
    c: 2,                      // correct answer index (0-based)
    exp: "Explanation text...",
    acs: "AM.II.A.K1",         // FAA ACS code
    ref: "FAA-H-8083-31",     // reference document
    diagram: null              // optional: diagram component name
  },
  // ...
];
```

### Topic Configuration
```js
export const TOPICS = {
  "AF-01": {
    id: "AF-01",
    name: "Metallic Structures",
    subtitle: "Rivets, sheet metal, structural repair",
    category: "airframe",
    questionFile: () => import('./airframe/metallic-structures.js'),
    pdfFile: "/pdfs/airframe/metallic-structures.pdf",
    asaPages: [1, 16],        // pages in ASA test guide
    textbookPages: [TBD],     // pages in FAA handbook
    questionCount: 26
  },
  // ... 28 more topics
};

export const CATEGORIES = {
  airframe: {
    name: "Airframe",
    code: "AMA",
    examQuestions: 100,       // FAA exam format: 100 questions drawn from the pool
    timeHours: 2,
    passingScore: 70,
    topics: ["AF-01", "AF-02", ..., "AF-15"]
  },
  powerplant: {
    name: "Powerplant",
    code: "AMP",
    examQuestions: 100,       // FAA exam format: 100 questions drawn from the pool
    timeHours: 2,
    passingScore: 70,
    topics: ["PP-01", "PP-02", ..., "PP-13"]
  }
};
```

### localStorage Schema
Each key is namespaced to avoid collisions:

```
phnx-confidence     → { "AF01-8107": { level: 4, attempts: 12, lastSeen: "2026-04-04" }, ... }
phnx-attempts       → [ { id, topicId, mode, score, total, time, missed: [], date }, ... ]
phnx-bookmarks      → { questions: ["AF01-8107", ...], pdfPages: [{ topicId, page }] }
phnx-notes          → { "AF-01": "My notes for metallic structures...", ... }
phnx-theme          → "dark" | "light"
```

The current `hydr-pnu-attempts` and `hydr-pnu-qstats` keys will be migrated on first load of the new version. A migration function checks for old keys, converts the data to the new schema, and removes the old keys.

## Additional Features

### Search
- Accessible from the Search tab in the bottom bar
- Full-text search across all question text, choices, and explanations
- Results show matching questions grouped by subtopic
- Tapping a result navigates to that question in context (test review mode)
- Implemented client-side. On first search, all question files are loaded via their lazy importers and cached in memory. Subsequent searches filter the cached arrays. This is a one-time cost (~100-200KB of question data across all subtopics) that enables instant search without a backend.

### Bookmarks
- Accessible from the Bookmarks tab in the bottom bar
- Two bookmark types:
  - **Question bookmarks** — save specific questions for quick review
  - **PDF page bookmarks** — save specific textbook pages
- Bookmark button appears on each question during test/flashcard sessions and on each PDF page during study
- Bookmarks persist in localStorage
- Bookmark list shows question text preview + subtopic label

### Progress Dashboard
- Accessible from the Progress tab in the bottom bar
- Shows all 28 subtopics in a compact view with mastery percentage and progress bar
- Grouped by category (Airframe / Powerplant)
- Category-level stats: overall readiness %, total questions mastered, study time
- Trend chart showing readiness over time (reuses existing TrendChart component)
- Option to clear all progress data (with confirmation)

### Notes
- Per-subtopic text notes stored in localStorage
- Accessible from the subtopic interior view (small notes icon)
- Simple text editor — no rich formatting needed
- Useful for jotting down mnemonics, instructor tips, or personal reminders

## Theming

### Color System
The app uses CSS custom properties for theming. All mastery/status colors are consistent across both themes:

| Purpose | Color | Notes |
|---------|-------|-------|
| Brand accent | #F97316 (orange) | Unchanged from current app |
| Mastered/passing | #22c55e (green) | High contrast on both black and white |
| Learning/in-progress | #F97316 (orange) | Doubles as brand accent |
| Struggling/below passing | #ef4444 (red) | Clear warning on both backgrounds |
| Not started | #555 (dark) / #ccc (light) | Adapts per theme |
| Card background | #111 (dark) / #f5f5f5 (light) | Adapts per theme |
| Progress bar track | #333 (dark) / #e0e0e0 (light) | Adapts per theme |
| Primary text | #fff (dark) / #111 (light) | Adapts per theme |
| Secondary text | #888 (dark) / #666 (light) | Adapts per theme |

### Theme Variables
Extend the existing `theme.css` with new variables for the multi-topic UI:
```css
:root[data-theme="dark"] {
  --card-bg: #111;
  --card-border: #2a2a2a;
  --bar-track: #333;
  --text-muted: #666;
  --not-started: #555;
}
:root[data-theme="light"] {
  --card-bg: #f5f5f5;
  --card-border: #e0e0e0;
  --bar-track: #e0e0e0;
  --text-muted: #999;
  --not-started: #ccc;
}
```

## Component Structure

### New Components
- `TopicListScreen` — Homepage with scrollable topic cards
- `SubtopicScreen` — Interior view with mode tiles and progress
- `PdfViewer` — Wrapper around react-pdf for chapter display
- `SearchScreen` — Full-text search across questions
- `BookmarksScreen` — Saved questions and PDF pages
- `ProgressScreen` — Full dashboard with all subtopics
- `MockExamScreen` — Test mode with no feedback, timer
- `TopicCard` — Compact row card for homepage
- `ProgressBar` — Three-state horizontal bar (mastered/learning/new)
- `ReadinessRing` — Circular SVG progress indicator
- `NotesEditor` — Simple text editor for per-subtopic notes

### Modified Components
- `App.jsx` — New routing state for multi-topic navigation
- `TabBar.jsx` — Updated tabs: Home, Search, Bookmarks, Progress (replaces Exam/Flashcards split)
- `ExamScreen.jsx` — Adapted to receive questions from any subtopic (currently hardcoded)
- `FlashcardSession.jsx` — Adapted for per-subtopic scoping
- `FlashcardComplete.jsx` — No changes needed (already generic)
- `ResultsScreen.jsx` — Adapted for per-subtopic scoring
- `HistoryScreen.jsx` — Adapted to show per-subtopic history
- `TrendChart.jsx` — No changes needed (already generic)
- `ThemeToggle.jsx` — No changes needed

### Removed/Replaced Components
- `HomeScreen.jsx` — Replaced by `TopicListScreen`
- `FlashcardHome.jsx` — Replaced by subtopic interior mode selection

### Context Providers
- `HistoryContext` — Refactored to use new localStorage schema with per-question confidence levels, per-subtopic attempts, bookmarks, and notes
- `ThemeContext` — No changes needed

## Diagrams

The existing 12 SVG diagrams (Pascal's Law, cylinders, pumps, etc.) are all specific to Hydraulic & Pneumatic Systems (AF-06). They continue to work as-is — questions in the AF-06 subtopic that reference diagrams will display them the same way.

Future subtopics may add their own diagrams, but that's not in scope for this redesign. The diagram registry pattern (`src/diagrams/index.js`) already supports adding new diagrams without changing the rendering logic.

## Build & Deployment

### New Dependencies
- `pdf-lib` (dev dependency) — for splitting PDFs at build time
- `react-pdf` — for rendering chapter PDFs in-app
- `pdfjs-dist` — peer dependency of react-pdf (pdf.js worker)

### Build Scripts
```json
{
  "scripts": {
    "split-pdfs": "node scripts/split-pdfs.js",
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "gh-pages -d dist"
  }
}
```

Note: `split-pdfs` is a manual script, not part of the regular build. It reads source PDFs from iCloud and outputs chapter files to `public/pdfs/`. The chapter files are committed to the repo. The script only needs to re-run if page ranges change or source PDFs are updated.

### Vite Configuration Updates
- Configure pdf.js worker for react-pdf
- Update PWA manifest: app name, scope, icons
- Update base path if the repo/deployment URL changes
- Add chapter PDFs to the service worker precache or use runtime caching with cache-first strategy

### Deployment
- Continues to deploy to GitHub Pages via `gh-pages`
- Repo may need to enable Git LFS for the chapter PDF files if they push the repo past GitHub's size recommendations
- PWA manifest updated with new app name: "PHNX A&P Exam Prep"

## Migration Path

### From Current App to Multi-Topic
1. Create a feature branch for the redesign
2. Existing Hydraulics & Pneumatics questions (145) become the AF-06 subtopic
3. Migrate localStorage keys on first load:
   - `hydr-pnu-attempts` → converted to `phnx-attempts` with `topicId: "AF-06"`
   - `hydr-pnu-qstats` → converted to `phnx-confidence` with confidence levels derived from `timesCorrect / timesAnswered`
   - `phnx-theme` key stays as-is (already uses `phnx-theme`)
4. Old keys are deleted after migration
5. Existing diagram components continue to work without changes

### Question Data Entry
Questions need to be extracted from the ASA test guide PDFs and entered into the data files. This is a significant manual effort for ~28 subtopics. Approach:
- Start with the existing 145 Hydraulics & Pneumatics questions (already done)
- Extract questions from the ASA PDFs subtopic by subtopic
- Each subtopic can be added incrementally — the app works with however many subtopics have data
- Topics with no questions yet show as "Coming Soon" on the homepage

## Open Questions

None — all design decisions have been resolved through the brainstorming session.

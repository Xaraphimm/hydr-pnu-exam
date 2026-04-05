# FAA Exam & Flashcard System — Design Spec

**Date:** 2026-04-04
**Status:** Approved
**Scope:** Airframe only (15 subtopics, AF-01 through AF-15)

---

## 1. Overview

Build a comprehensive FAA Knowledge Test simulation and flashcard study system into the PHNX Foundries A&P exam prep app. The system replicates the real FAA Airframe Mechanic (AMA) exam experience with multiple exam versions, two distinct modes (Study and Test), detailed per-question feedback with FAA reference citations, per-topic performance breakdowns, and flashcard integration for targeted review of missed questions.

### Goals

- Replicate the real FAA AMA exam: 100 multiple-choice questions, 3 answer choices (A/B/C), 2-hour time limit, 70% passing score
- Provide 5 reproducible exam versions plus unlimited random exams (seeded PRNG)
- Support two modes: **Study** (instant feedback with explanations) and **Test** (no feedback until submission)
- Extract all questions from the ASA 2024 Airframe Mechanic Test Guide for all 15 subtopics
- Integrate with existing flashcard system for targeted review of missed questions
- Clean, responsive UI that works on both web and mobile

---

## 2. Question Data

### 2.1 Source

All questions extracted from the **ASA 2024 Airframe Mechanic Test Guide** (ISBN 978-1-64425-317-5). The book contains FAA sample questions organized by the 15 airframe subtopics, with explanations, ACS codes, and FAA handbook references.

### 2.2 Data Format

Each question follows the existing app format established by `src/data/airframe/hydraulic-pneumatic-systems.js`:

```js
{
  id: "AF01-8107",         // {topicPrefix}-{ASA question number}
  q: "Which statement is true regarding the inspection of a stressed skin metal wing assembly known to have been critically loaded?",
  a: [
    "If rivets show no visible distortion, further investigation is unnecessary.",
    "If bearing failure has occurred, the rivet shanks will be joggled.",
    "If genuine rivet tipping has occurred, groups of consecutive rivet heads will be tipped in the same direction."
  ],
  c: 2,                    // correct answer index (0-based)
  exp: "If the structure has actually been damaged, this would be indicated by groups of consecutive rivet heads being tipped in the same direction caused by a major deflection of the skin under load.",
  ref: "FAA-H-8083-31",   // primary FAA reference document
  acs: "AM.II.A.K1",      // ACS code from the book
  diagram: null            // optional diagram component name
}
```

### 2.3 File Organization

One JS file per subtopic in `src/data/airframe/`, following the existing naming convention:

| Topic ID | File Name | ASA Pages | Est. Questions |
|----------|-----------|-----------|----------------|
| AF-01 | `metallic-structures.js` | 1–16 | ~90 |
| AF-02 | `non-metallic-structures.js` | 17–28 | ~70 |
| AF-03 | `flight-controls.js` | 29–37 | ~50 |
| AF-04 | `airframe-inspection.js` | 38–39 | ~15 |
| AF-05 | `landing-gear-systems.js` | 40–52 | ~75 |
| AF-06 | `hydraulic-pneumatic-systems.js` | 53–67 | exists (~1000, will be replaced with ASA-sourced) |
| AF-07 | `environmental-systems.js` | 68–79 | ~65 |
| AF-08 | `aircraft-instrument-systems.js` | 80–88 | ~50 |
| AF-09 | `communication-navigation-systems.js` | 89–96 | ~45 |
| AF-10 | `aircraft-fuel-systems.js` | 97–110 | ~75 |
| AF-11 | `aircraft-electrical-systems.js` | 111–127 | ~95 |
| AF-12 | `ice-rain-control-systems.js` | 128–131 | ~25 |
| AF-13 | `airframe-fire-protection.js` | 132–135 | ~25 |
| AF-14 | `rotorcraft-fundamentals.js` | 136–137 | ~10 |
| AF-15 | `water-waste-systems.js` | 138 | ~5 |

**Note:** AF-06 currently has ~1000 custom questions. These will be replaced with the ASA-sourced questions to maintain consistency across all topics. The ASA questions include proper ACS codes and FAA references that the custom questions lack.

### 2.4 Question Loader Updates

The existing `src/data/index.js` question loader already supports async loading with caching. It needs to be updated to register all 15 airframe topic files (currently only AF-06 is registered). The loader's `loadQuestions(topicId)` and `loadAllQuestions()` functions remain unchanged in API.

---

## 3. Exam Generation Engine

### 3.1 Seeded PRNG

A deterministic pseudo-random number generator (e.g., mulberry32 or similar) seeded by version number. Given the same seed and question pool, always produces the same set of questions in the same order.

```
Seed formula:
  Versions 1-5:  seed = version_number (1, 2, 3, 4, 5)
  Random:        seed = Date.now()
```

### 3.2 ACS-Weighted Distribution

For full category exams (100 questions across all subtopics), questions are distributed proportionally based on ACS knowledge element count per subtopic. This is derived from the number of distinct ACS codes appearing in each topic's question pool.

**Distribution calculation:**
1. Count distinct ACS codes per subtopic from the question data
2. Calculate each subtopic's share: `topicAcsCodes / totalAcsCodes`
3. Multiply by 100 (total exam questions) and round, ensuring sum = 100
4. Minimum 1 question per subtopic that has questions in the pool

**Approximate distribution** (final numbers derived from actual ACS code counts at build time):

| Topic | ACS Weight | ~Questions per Exam |
|-------|-----------|---------------------|
| AF-01 Metallic Structures | Heavy | ~12 |
| AF-02 Non-Metallic Structures | Heavy | ~10 |
| AF-03 Flight Controls | Medium | ~7 |
| AF-04 Airframe Inspection | Light | ~3 |
| AF-05 Landing Gear Systems | Heavy | ~10 |
| AF-06 Hydraulic & Pneumatic | Medium | ~8 |
| AF-07 Environmental Systems | Medium | ~8 |
| AF-08 Instrument Systems | Medium | ~7 |
| AF-09 Comm & Nav Systems | Medium | ~6 |
| AF-10 Fuel Systems | Heavy | ~10 |
| AF-11 Electrical Systems | Heavy | ~12 |
| AF-12 Ice & Rain Control | Light | ~3 |
| AF-13 Fire Protection | Light | ~2 |
| AF-14 Rotorcraft Fundamentals | Light | ~1 |
| AF-15 Water & Waste | Light | ~1 |

### 3.3 Exam Generation Algorithm

```
generateExam(seed, topicId = null):
  1. Initialize PRNG with seed
  2. If topicId is provided (per-subtopic exam):
     - Load that topic's question pool
     - Shuffle pool using PRNG
     - Return all questions (or cap at pool size)
  3. If topicId is null (full category exam):
     - Calculate ACS-weighted distribution (question count per topic)
     - For each topic:
       a. Load topic's question pool
       b. Shuffle pool using PRNG
       c. Take first N questions (where N = that topic's allocation)
     - Concatenate all selected questions
     - Shuffle the final list using PRNG (so topics are interleaved)
     - Return 100 questions
```

### 3.4 Utility Module

New file: `src/utils/exam-generator.js`

Exports:
- `generateExam(seed, topicId?)` — returns array of question objects
- `getAcsDistribution()` — returns map of topicId → question count for a 100-question exam
- `seededRandom(seed)` — returns a deterministic PRNG function

---

## 4. Exam Modes

### 4.1 Study Mode

**Purpose:** Learning-oriented exam with instant feedback after each question.

**Behavior:**
- Timer runs but is informational only (not enforced, does not auto-submit)
- After selecting an answer:
  - Selected wrong answer highlighted **red** with filled circle
  - Correct answer highlighted **green** with filled circle and checkmark
  - Unchosen wrong answer dimmed (reduced opacity)
  - **Inline explanation panel** expands below the answer choices:
    - Green "EXPLANATION" header
    - Explanation text from the ASA book
    - "References:" section listing FAA document refs (e.g., "FAA-H-8083-31") and ACS code (e.g., "AM.II.A.K1")
  - "Next Question →" button appears below the explanation
- Can flag/bookmark questions at any time
- Progress bar at top showing current position (e.g., "Question 12 of 100")
- Can navigate backward to review previous answers (already locked in)
- Subtopic label and ASA question number shown above each question

**Records:** Each answer updates the existing confidence tracking system via `recordAnswer()`.

### 4.2 Test Mode

**Purpose:** Simulates the real FAA testing center experience.

**Behavior:**
- 2-hour countdown timer (enforced — auto-submits at 0:00)
- No feedback after selecting an answer — selection is recorded and student moves to next question
- Can flag questions for review
- Can navigate freely between questions (previous/next, or jump to flagged)
- "Submit Exam" button (with confirmation dialog: "Are you sure? You have X unanswered questions.")
- After submission → Results Screen with full review and explanations

**Records:** Answers are batched and recorded to confidence tracking after submission.

---

## 5. UI Screens

### 5.1 Exam Selection Screen

**Entry points:**
- **Full category exam:** New "Airframe Exam" card/button on the TopicListScreen, positioned above the individual subtopic list
- **Per-subtopic exam:** Existing test button on SubtopicScreen opens same selection UI scoped to that topic

**Layout:** Tab-based design with two tabs:

| Tab | Label |
|-----|-------|
| Tab 1 | **Study** |
| Tab 2 | **Test** |

Below the tabs:
- Subtitle: "Select a version — each draws 100 questions weighted by ACS topics"
- **Version grid** (3 columns on mobile, responsive):
  - Cards for Exam 1, Exam 2, Exam 3, Exam 4, Exam 5
  - Each card shows: version number, "Best: XX%" if previously taken or "Not taken"
  - **Random card**: visually distinct (dashed border, accent color), labeled "Random" with subtitle "Unique exam"
- **Info bar** at bottom: "100 questions · 2 hr time limit · 70% to pass"
  - For per-subtopic exams: shows actual question count instead of 100, no time limit (informational timer only), and 70% to pass

**New component:** `ExamSelectionScreen.jsx` + `ExamSelectionScreen.css`

### 5.2 Question Screen (Study Mode)

**Header bar:**
- Back button (← Back)
- "Question N of M" centered
- Timer (⏱ H:MM:SS) in accent color

**Progress bar:** thin horizontal bar below header showing completion percentage

**Question area:**
- Subtopic label + ASA question number (e.g., "Landing Gear Systems · #8327")
- Question text

**Answer choices:** Three cards (A, B, C) with letter circles on the left

**Before answering:** All three cards neutral (dark background, subtle border)

**After answering (wrong):**
- Selected answer: red background tint, red border, red letter circle
- Correct answer: green background tint, green border, green letter circle with checkmark
- Other answer: dimmed to 50% opacity

**After answering (correct):**
- Selected answer: green background tint, green border, green letter circle with checkmark
- Other answers: dimmed to 50% opacity

**Explanation panel** (appears after answering):
- Dark green-tinted background with green border
- "EXPLANATION" header in green, uppercase, small
- Explanation text
- Separator line
- "References:" in accent color
- ACS code and FAA document reference(s)

**"Next Question →" button** in accent color below explanation

**Reuses and extends:** Existing `ExamScreen.jsx` component, adding the inline explanation panel and reference display.

### 5.3 Question Screen (Test Mode)

Same layout as Study Mode header, progress bar, question, and answer choices, but:
- No feedback coloring after selection (selected answer gets a subtle highlight, that's it)
- No explanation panel
- Navigation: Previous / Next buttons, plus "Flag" button
- "Submit Exam" button appears on the last question (or accessible from any question via a persistent button)

**Reuses and extends:** Existing `MockExamScreen.jsx` component.

### 5.4 Results Screen

Shown after completing a Study mode exam or submitting a Test mode exam.

**Score section:**
- Exam metadata: "Exam Version 1 · Study Mode" (subtle, centered)
- Large score circle: percentage in center, colored ring (green ≥70%, red <70%)
- "PASS" or "FAIL" label inside the circle
- Below circle: "78 of 100 correct · 1h 23m"

**Stats row** (three cards):
- Correct count (green tint)
- Wrong count (red tint)
- Flagged count (accent tint)

**Performance by Topic section:**
- Header: "Performance by Topic"
- List of subtopics, each showing:
  - Topic name
  - Score fraction (e.g., "6/7")
  - Horizontal progress bar, colored by performance:
    - Green: ≥80%
    - Orange/accent: 60–79%
    - Red: <60%
- Collapsed by default with "+ N more topics" if many topics shown

**Action buttons row:**
- "Study Missed as Flashcards" — primary button (accent color)
- "Retake Exam" — secondary button (dark)

**Question Review section:**
- Header: "Question Review" with subtitle "Tap to expand explanation"
- Scrollable list of all questions:
  - Each row shows: ✓/✗ icon, truncated question text, question number
  - Correct questions: green check, neutral text
  - Wrong questions: red X, red-tinted text
  - Tapping any question expands to show:
    - "Your answer: A — [text]" in red (wrong) or green (correct)
    - "Correct: C — [text]" in green (shown for wrong answers)
    - Explanation text
    - FAA reference in accent color

**New component:** `ExamResultsScreen.jsx` + `ExamResultsScreen.css`
(Extends concepts from existing `ResultsScreen.jsx` but with topic breakdown and enhanced review)

### 5.5 Navigation Flow

```
TopicListScreen
  ├── "Airframe Exam" card → ExamSelectionScreen (full category)
  │     ├── [Study tab] → pick version → ExamScreen (study mode) → ExamResultsScreen
  │     └── [Test tab]  → pick version → MockExamScreen (test mode) → ExamResultsScreen
  │
  └── SubtopicScreen (e.g., AF-05)
        ├── "Test" button → ExamSelectionScreen (per-subtopic)
        │     ├── [Study tab] → ExamScreen → ExamResultsScreen
        │     └── [Test tab]  → MockExamScreen → ExamResultsScreen
        ├── "Flashcards" button → FlashcardSession (existing)
        └── "Study" button → PdfViewer (existing)
```

---

## 6. Flashcard Integration

### 6.1 Same Question Pool

Flashcards draw from the same ASA question data files. The existing `FlashcardSession` component works unchanged:
- Front: question text + optional diagram
- Back: correct answer + explanation + FAA references
- Grading: "GOT IT" / "MISSED IT"

### 6.2 Study Missed as Flashcards

After any exam (Study or Test mode), the "Study Missed as Flashcards" button on the Results Screen:
1. Collects all question objects where the student answered incorrectly
2. Passes them to `FlashcardSession` as a filtered deck
3. On completion → `FlashcardComplete` screen with option to re-study missed

This uses the existing flashcard components with no modifications — just a filtered question array input.

### 6.3 Per-Subtopic Flashcards

Continue working as they do now — drawing from the full topic pool, shuffled. The only change is that more topics will now have question data (all 15 instead of just AF-06).

---

## 7. Data & Progress Tracking

### 7.1 Confidence Tracking

Uses existing `HistoryContext.recordAnswer(questionId, correct)` for each question. No changes to the confidence level algorithm (1–5 scale, +1 for correct, -1 for wrong).

### 7.2 Attempt Storage

Uses existing `HistoryContext.saveAttempt()` with extended metadata:

```js
{
  topicId: 'airframe' | 'AF-01' | ... ,  // 'airframe' for full category exams
  mode: 'study' | 'test',
  version: 1-5 | 'random',
  seed: number,                           // for reproducibility
  questions: [...questionIds],
  answers: [...selectedIndexes],
  correct: [...booleans],
  startTime: ISO string,
  endTime: ISO string,
  score: number,                          // percentage
  topicBreakdown: {                       // per-subtopic scores
    'AF-01': { correct: 6, total: 7 },
    'AF-05': { correct: 8, total: 9 },
    ...
  }
}
```

### 7.3 Version Best Scores

The ExamSelectionScreen shows "Best: XX%" per version by querying `HistoryContext.getTopicAttempts()` and filtering by version number. Computed at render time, not stored separately.

---

## 8. Component Summary

### New Components
| Component | Purpose |
|-----------|---------|
| `ExamSelectionScreen.jsx` | Tab-based Study/Test mode and version picker |
| `ExamResultsScreen.jsx` | Score circle, topic breakdown, question review |

### Modified Components
| Component | Changes |
|-----------|---------|
| `ExamScreen.jsx` | Add inline explanation panel with FAA refs after answering |
| `MockExamScreen.jsx` | Add submit confirmation, navigation to ExamResultsScreen |
| `TopicListScreen.jsx` | Add "Airframe Exam" entry point above subtopic list |
| `SubtopicScreen.jsx` | Wire test button to ExamSelectionScreen instead of directly to ExamScreen |
| `App.jsx` | Add screen states for exam selection and exam results |
| `src/data/index.js` | Register all 15 airframe question files |

### New Utility
| File | Purpose |
|------|---------|
| `src/utils/exam-generator.js` | Seeded PRNG, ACS-weighted distribution, exam generation |

### New Data Files (14 new, 1 replacement)
All 15 `src/data/airframe/*.js` files populated from ASA 2024 Test Guide.

---

## 9. Styling & Responsiveness

All new components follow the existing PHNX design language:
- **Colors:** Black/white base with `#E8651A` accent (orange), green for correct, red for incorrect
- **Typography:** System font stack (`-apple-system, system-ui, sans-serif`)
- **Spacing:** Uses existing CSS custom properties (`--spacing-*`)
- **Dark/light mode:** Respects existing `ThemeContext` toggle
- **Mobile-first:** All layouts designed for 375px+ width, scales up for tablet/desktop
- **Touch targets:** Minimum 44px height for all interactive elements
- CSS Modules pattern (component-scoped `.css` files) matching existing codebase

---

## 10. Testing

### Data Validation Tests
- Each subtopic file exports a valid `questions` array
- Every question has: `id`, `q`, `a` (array of 3), `c` (0–2), `exp`, `ref`
- No duplicate question IDs across all files
- Question IDs follow `{topicPrefix}-{number}` format

### Exam Generator Tests
- Seeded PRNG produces same output for same seed
- ACS distribution sums to exactly 100 questions
- Every subtopic with questions is represented in full category exams
- Per-subtopic exams contain only questions from that topic
- No duplicate questions within a single exam

### Component Tests
- ExamSelectionScreen renders correct tabs and version cards
- Study mode shows explanation panel after answering
- Test mode does not show feedback until submission
- Results screen computes correct per-topic breakdown
- "Study Missed as Flashcards" passes correct filtered question set

---

## 11. Out of Scope

- Powerplant questions and exams (future work)
- General (AMG) exam simulation
- Online/cloud sync of progress
- Figure/diagram questions requiring the FAA Knowledge Testing Supplement images (FAA-CT-8080-4G) — questions referencing figures will include a note but not the figure itself
- Oral & Practical study guide questions (pages 139–167 of the ASA book) — these are open-ended Q&A, not multiple choice

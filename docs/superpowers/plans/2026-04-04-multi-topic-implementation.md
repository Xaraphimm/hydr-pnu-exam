# Multi-Topic A&P Exam Prep — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the single-topic Hydraulics & Pneumatics exam app into a multi-topic FAA A&P study platform covering 15 Airframe and 13 Powerplant subtopics (28 total) with PDF textbook chapters, flashcards, and exam testing.

**Architecture:** React 19 + Vite 8 PWA. State-based routing (no router library). Data stored in localStorage with per-question confidence tracking. Pre-split PDF chapters rendered with react-pdf. All client-side, deployed to GitHub Pages.

**Tech Stack:** React 19, Vite 8, react-pdf, pdf-lib (build tool), pdfjs-dist, Vitest + React Testing Library (tests), CSS custom properties for theming.

**Spec:** `docs/superpowers/specs/2026-04-04-multi-topic-exam-prep-design.md`

---

## File Structure

### New Files
```
src/
  data/
    topics.js                          — TOPICS config, CATEGORIES config, topic metadata
    airframe/
      hydraulic-pneumatic-systems.js   — AF-06 questions (migrated from questions.js)
    index.js                           — re-exports topics + lazy question loaders
  utils/
    mastery.js                         — confidence level logic, mastery %, readiness calculations
    migration.js                       — one-time localStorage migration from old → new schema
    shuffle.js                         — Fisher-Yates shuffle (extracted from App.jsx)
  components/
    TopicListScreen.jsx + .css         — Homepage with compact rows, readiness ring
    TopicCard.jsx                      — Single compact row card
    SubtopicScreen.jsx + .css          — Interior view with mode tiles
    ReadinessRing.jsx                  — Circular SVG progress ring
    ProgressBarMulti.jsx               — Three-state horizontal bar (mastered/learning/new)
    MockExamScreen.jsx + .css          — Timed test, no feedback until end
    PdfViewer.jsx + .css               — react-pdf wrapper for chapter display
    SearchScreen.jsx + .css            — Full-text search across questions
    BookmarksScreen.jsx + .css         — Saved questions and PDF pages
    ProgressScreen.jsx + .css          — Full mastery dashboard
    NotesEditor.jsx + .css             — Per-subtopic text notes
scripts/
  split-pdfs.mjs                       — Node.js script to split textbook PDFs into chapters
tests/
  utils/
    mastery.test.js                    — Tests for confidence and mastery calculations
    migration.test.js                  — Tests for localStorage migration
    shuffle.test.js                    — Tests for shuffle utility
```

### Modified Files
```
src/
  App.jsx                              — New routing state, multi-topic navigation
  HistoryContext.jsx                    — Refactored: new localStorage keys, confidence tracking, bookmarks, notes
  styles/theme.css                     — New CSS variables for mastery colors, card styles
  components/
    TabBar.jsx + .css                  — 4 tabs: Home, Search, Bookmarks, Progress
    ExamScreen.jsx                     — Accept topicId prop, remove hardcoded section refs
    FlashcardSession.jsx               — Accept topicId, use confidence tracking
    ResultsScreen.jsx                  — Per-subtopic scoring, updated share text
    HistoryScreen.jsx                  — Per-subtopic history filtering
vite.config.js                         — pdf.js worker config, PDF caching in workbox
package.json                           — New dependencies and scripts
public/manifest.json                   — Updated app name and scope
```

### Removed Files (after migration)
```
src/
  components/HomeScreen.jsx + .css     — Replaced by TopicListScreen
  components/FlashcardHome.jsx + .css  — Replaced by SubtopicScreen mode selection
  data/questions.js                    — Replaced by per-subtopic files in data/airframe/
```

---

## Phase 1: Foundation

### Task 1: Create feature branch and install dependencies

**Files:**
- Modify: `package.json`
- Create: `vitest.config.js`

- [ ] **Step 1: Create feature branch**

```bash
cd /Users/xaraphim/Documents/hydr-pnu-exam
git checkout -b feature/multi-topic
```

- [ ] **Step 2: Install new runtime dependencies**

```bash
npm install react-pdf pdfjs-dist
```

- [ ] **Step 3: Install new dev dependencies**

```bash
npm install -D pdf-lib vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 4: Create Vitest config**

Create `vitest.config.js` at project root:

```js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
  },
});
```

- [ ] **Step 5: Create test setup file**

Create `tests/setup.js`:

```js
import '@testing-library/jest-dom';
```

- [ ] **Step 6: Add test script to package.json**

Add to the `"scripts"` section in `package.json`:

```json
"test": "vitest run",
"test:watch": "vitest",
"split-pdfs": "node scripts/split-pdfs.mjs"
```

- [ ] **Step 7: Verify test setup works**

Run: `npx vitest run`
Expected: "No test files found" (no failures — just confirms vitest runs)

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: create feature branch, install deps, set up vitest"
```

---

### Task 2: Shuffle utility and first test

**Files:**
- Create: `src/utils/shuffle.js`
- Create: `tests/utils/shuffle.test.js`

- [ ] **Step 1: Write the test**

Create `tests/utils/shuffle.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { shuffle } from '../../src/utils/shuffle.js';

describe('shuffle', () => {
  it('returns an array of the same length', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle([...input]);
    expect(result).toHaveLength(5);
  });

  it('contains all original elements', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle([...input]);
    expect(result.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('does not modify the original array', () => {
    const input = [1, 2, 3, 4, 5];
    const copy = [...input];
    shuffle(copy);
    // shuffle mutates in place and returns, but we pass a copy
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });

  it('returns empty array for empty input', () => {
    expect(shuffle([])).toEqual([]);
  });

  it('returns single-element array unchanged', () => {
    expect(shuffle([42])).toEqual([42]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/utils/shuffle.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: Implement shuffle**

Create `src/utils/shuffle.js`:

```js
/**
 * Fisher-Yates shuffle. Returns a new shuffled array.
 */
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/utils/shuffle.test.js`
Expected: All 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/shuffle.js tests/utils/shuffle.test.js
git commit -m "feat: extract shuffle utility with tests"
```

---

### Task 3: Mastery utility functions

**Files:**
- Create: `src/utils/mastery.js`
- Create: `tests/utils/mastery.test.js`

- [ ] **Step 1: Write the tests**

Create `tests/utils/mastery.test.js`:

```js
import { describe, it, expect } from 'vitest';
import {
  updateConfidence,
  getQuestionState,
  getTopicMastery,
  getMasteryColor,
  getTopicCounts,
} from '../../src/utils/mastery.js';

describe('updateConfidence', () => {
  it('increments level on correct answer (max 5)', () => {
    expect(updateConfidence({ level: 1, attempts: 0 }, true)).toEqual({ level: 2, attempts: 1, lastSeen: expect.any(String) });
    expect(updateConfidence({ level: 4, attempts: 5 }, true)).toEqual({ level: 5, attempts: 6, lastSeen: expect.any(String) });
    expect(updateConfidence({ level: 5, attempts: 10 }, true)).toEqual({ level: 5, attempts: 11, lastSeen: expect.any(String) });
  });

  it('decrements level on wrong answer (min 1)', () => {
    expect(updateConfidence({ level: 3, attempts: 4 }, false)).toEqual({ level: 2, attempts: 5, lastSeen: expect.any(String) });
    expect(updateConfidence({ level: 1, attempts: 2 }, false)).toEqual({ level: 1, attempts: 3, lastSeen: expect.any(String) });
  });

  it('creates new entry when no prior data', () => {
    expect(updateConfidence(null, true)).toEqual({ level: 2, attempts: 1, lastSeen: expect.any(String) });
    expect(updateConfidence(null, false)).toEqual({ level: 1, attempts: 1, lastSeen: expect.any(String) });
  });
});

describe('getQuestionState', () => {
  it('returns "new" for 0 attempts', () => {
    expect(getQuestionState(null)).toBe('new');
    expect(getQuestionState({ level: 1, attempts: 0 })).toBe('new');
  });

  it('returns "mastered" for level 4-5', () => {
    expect(getQuestionState({ level: 4, attempts: 8 })).toBe('mastered');
    expect(getQuestionState({ level: 5, attempts: 12 })).toBe('mastered');
  });

  it('returns "learning" for level 1-3 with attempts', () => {
    expect(getQuestionState({ level: 1, attempts: 3 })).toBe('learning');
    expect(getQuestionState({ level: 2, attempts: 5 })).toBe('learning');
    expect(getQuestionState({ level: 3, attempts: 7 })).toBe('learning');
  });
});

describe('getTopicMastery', () => {
  it('returns 0 when no questions attempted', () => {
    const questionIds = ['q1', 'q2', 'q3'];
    const confidence = {};
    expect(getTopicMastery(questionIds, confidence)).toBe(0);
  });

  it('calculates percentage of mastered questions', () => {
    const questionIds = ['q1', 'q2', 'q3', 'q4'];
    const confidence = {
      q1: { level: 5, attempts: 10 },  // mastered
      q2: { level: 4, attempts: 8 },   // mastered
      q3: { level: 2, attempts: 3 },   // learning
      // q4 missing = new
    };
    expect(getTopicMastery(questionIds, confidence)).toBe(50); // 2/4 = 50%
  });

  it('returns 100 when all mastered', () => {
    const questionIds = ['q1', 'q2'];
    const confidence = {
      q1: { level: 5, attempts: 10 },
      q2: { level: 4, attempts: 8 },
    };
    expect(getTopicMastery(questionIds, confidence)).toBe(100);
  });

  it('returns 0 for empty question list', () => {
    expect(getTopicMastery([], {})).toBe(0);
  });
});

describe('getMasteryColor', () => {
  it('returns correct color for each mastery range', () => {
    expect(getMasteryColor(0, false)).toBe('not-started');   // 0%, no attempts
    expect(getMasteryColor(0, true)).toBe('struggling');     // 0%, has attempts
    expect(getMasteryColor(30, true)).toBe('struggling');    // 1-49%
    expect(getMasteryColor(49, true)).toBe('struggling');
    expect(getMasteryColor(50, true)).toBe('learning');      // 50-69%
    expect(getMasteryColor(69, true)).toBe('learning');
    expect(getMasteryColor(70, true)).toBe('passing');       // 70%+
    expect(getMasteryColor(100, true)).toBe('passing');
  });
});

describe('getTopicCounts', () => {
  it('counts new, learning, and mastered questions', () => {
    const questionIds = ['q1', 'q2', 'q3', 'q4', 'q5'];
    const confidence = {
      q1: { level: 5, attempts: 10 },  // mastered
      q2: { level: 3, attempts: 5 },   // learning
      q3: { level: 1, attempts: 2 },   // learning
      // q4, q5 missing = new
    };
    expect(getTopicCounts(questionIds, confidence)).toEqual({
      mastered: 1,
      learning: 2,
      new: 2,
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/utils/mastery.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: Implement mastery utilities**

Create `src/utils/mastery.js`:

```js
/**
 * Update a question's confidence level after an answer.
 * @param {object|null} current - Current confidence data, or null for new question
 * @param {boolean} correct - Whether the answer was correct
 * @returns {object} Updated confidence data
 */
export function updateConfidence(current, correct) {
  const base = current || { level: 1, attempts: 0 };
  const newLevel = correct
    ? Math.min(base.level + 1, 5)
    : Math.max(base.level - 1, 1);

  return {
    level: newLevel,
    attempts: base.attempts + 1,
    lastSeen: new Date().toISOString().slice(0, 10),
  };
}

/**
 * Get the display state of a question based on confidence data.
 * @param {object|null} conf - Confidence data
 * @returns {'new'|'learning'|'mastered'}
 */
export function getQuestionState(conf) {
  if (!conf || conf.attempts === 0) return 'new';
  if (conf.level >= 4) return 'mastered';
  return 'learning';
}

/**
 * Calculate mastery percentage for a topic.
 * @param {string[]} questionIds - All question IDs in this topic
 * @param {object} confidence - Full confidence map { qId: { level, attempts } }
 * @returns {number} Mastery percentage (0-100), rounded
 */
export function getTopicMastery(questionIds, confidence) {
  if (questionIds.length === 0) return 0;
  const mastered = questionIds.filter(
    (id) => confidence[id] && confidence[id].level >= 4
  ).length;
  return Math.round((mastered / questionIds.length) * 100);
}

/**
 * Get the color category for a mastery percentage.
 * @param {number} pct - Mastery percentage (0-100)
 * @param {boolean} hasAttempts - Whether any questions have been attempted
 * @returns {'not-started'|'struggling'|'learning'|'passing'}
 */
export function getMasteryColor(pct, hasAttempts) {
  if (!hasAttempts && pct === 0) return 'not-started';
  if (pct >= 70) return 'passing';
  if (pct >= 50) return 'learning';
  return 'struggling';
}

/**
 * Count questions in each state for a topic.
 * @param {string[]} questionIds - All question IDs in this topic
 * @param {object} confidence - Full confidence map
 * @returns {{ mastered: number, learning: number, new: number }}
 */
export function getTopicCounts(questionIds, confidence) {
  const counts = { mastered: 0, learning: 0, new: 0 };
  for (const id of questionIds) {
    const state = getQuestionState(confidence[id]);
    counts[state]++;
  }
  return counts;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/utils/mastery.test.js`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/mastery.js tests/utils/mastery.test.js
git commit -m "feat: mastery utility functions with confidence tracking"
```

---

### Task 4: Topic configuration data

**Files:**
- Create: `src/data/topics.js`
- Create: `src/data/index.js`

- [ ] **Step 1: Create topic configuration**

Create `src/data/topics.js`. This is the central registry of all 29 subtopics. Every subtopic is defined here, even if it has no questions yet.

```js
export const TOPICS = {
  // === AIRFRAME (15 subtopics) ===
  'AF-01': {
    id: 'AF-01',
    name: 'Metallic Structures',
    subtitle: 'Rivets, sheet metal, structural repair',
    category: 'airframe',
    pdfFile: '/pdfs/airframe/metallic-structures.pdf',
    asaPages: [1, 16],
  },
  'AF-02': {
    id: 'AF-02',
    name: 'Non-Metallic Structures',
    subtitle: 'Composites, wood, fabric, plastics',
    category: 'airframe',
    pdfFile: '/pdfs/airframe/non-metallic-structures.pdf',
    asaPages: [17, 28],
  },
  'AF-03': {
    id: 'AF-03',
    name: 'Flight Controls',
    subtitle: 'Primary, secondary, trim systems',
    category: 'airframe',
    pdfFile: '/pdfs/airframe/flight-controls.pdf',
    asaPages: [29, 37],
  },
  'AF-04': {
    id: 'AF-04',
    name: 'Airframe Inspection',
    subtitle: 'NDT methods, inspection intervals',
    category: 'airframe',
    pdfFile: '/pdfs/airframe/airframe-inspection.pdf',
    asaPages: [38, 39],
  },
  'AF-05': {
    id: 'AF-05',
    name: 'Landing Gear Systems',
    subtitle: 'Retraction, brakes, tires, shock struts',
    category: 'airframe',
    pdfFile: '/pdfs/airframe/landing-gear-systems.pdf',
    asaPages: [40, 52],
  },
  'AF-06': {
    id: 'AF-06',
    name: 'Hydraulic & Pneumatic Systems',
    subtitle: 'Pressure, actuators, pumps, reservoirs',
    category: 'airframe',
    pdfFile: '/pdfs/airframe/hydraulic-pneumatic-systems.pdf',
    asaPages: [53, 67],
  },
  'AF-07': {
    id: 'AF-07',
    name: 'Environmental Systems',
    subtitle: 'Pressurization, heating, cooling, oxygen',
    category: 'airframe',
    pdfFile: '/pdfs/airframe/environmental-systems.pdf',
    asaPages: [68, 79],
  },
  'AF-08': {
    id: 'AF-08',
    name: 'Aircraft Instrument Systems',
    subtitle: 'Pitot-static, gyroscopic, engine instruments',
    category: 'airframe',
    pdfFile: '/pdfs/airframe/aircraft-instrument-systems.pdf',
    asaPages: [80, 88],
  },
  'AF-09': {
    id: 'AF-09',
    name: 'Communication & Navigation Systems',
    subtitle: 'Radios, antennas, transponders, ELT',
    category: 'airframe',
    pdfFile: '/pdfs/airframe/communication-navigation-systems.pdf',
    asaPages: [89, 96],
  },
  'AF-10': {
    id: 'AF-10',
    name: 'Aircraft Fuel Systems',
    subtitle: 'Tanks, pumps, vents, fuel quantity',
    category: 'airframe',
    pdfFile: '/pdfs/airframe/aircraft-fuel-systems.pdf',
    asaPages: [97, 110],
  },
  'AF-11': {
    id: 'AF-11',
    name: 'Aircraft Electrical Systems',
    subtitle: 'Generators, batteries, wiring, circuits',
    category: 'airframe',
    pdfFile: '/pdfs/airframe/aircraft-electrical-systems.pdf',
    asaPages: [111, 127],
  },
  'AF-12': {
    id: 'AF-12',
    name: 'Ice & Rain Control Systems',
    subtitle: 'De-icing, anti-icing, rain removal',
    category: 'airframe',
    pdfFile: '/pdfs/airframe/ice-rain-control-systems.pdf',
    asaPages: [128, 131],
  },
  'AF-13': {
    id: 'AF-13',
    name: 'Airframe Fire Protection',
    subtitle: 'Detection, extinguishing, fire zones',
    category: 'airframe',
    pdfFile: '/pdfs/airframe/airframe-fire-protection.pdf',
    asaPages: [132, 135],
  },
  'AF-14': {
    id: 'AF-14',
    name: 'Rotorcraft Fundamentals',
    subtitle: 'Rotor systems, autorotation, vibration',
    category: 'airframe',
    pdfFile: '/pdfs/airframe/rotorcraft-fundamentals.pdf',
    asaPages: [136, 137],
  },
  'AF-15': {
    id: 'AF-15',
    name: 'Water & Waste Systems',
    subtitle: 'Potable water, lavatory, waste disposal',
    category: 'airframe',
    pdfFile: '/pdfs/airframe/water-waste-systems.pdf',
    asaPages: [138, 138],
  },

  // === POWERPLANT (14 subtopics) ===
  'PP-01': {
    id: 'PP-01',
    name: 'Reciprocating Engines',
    subtitle: 'Cylinders, valves, crankshafts, timing',
    category: 'powerplant',
    pdfFile: '/pdfs/powerplant/reciprocating-engines.pdf',
    asaPages: [1, 17],
  },
  'PP-02': {
    id: 'PP-02',
    name: 'Turbine Engines',
    subtitle: 'Turbojets, turbofans, turboshafts',
    category: 'powerplant',
    pdfFile: '/pdfs/powerplant/turbine-engines.pdf',
    asaPages: [18, 34],
  },
  'PP-03': {
    id: 'PP-03',
    name: 'Engine Inspection',
    subtitle: 'Borescope, compression, oil analysis',
    category: 'powerplant',
    pdfFile: '/pdfs/powerplant/engine-inspection.pdf',
    asaPages: [35, 39],
  },
  'PP-04': {
    id: 'PP-04',
    name: 'Engine Instrument Systems',
    subtitle: 'Tachometers, EGT, oil pressure, fuel flow',
    category: 'powerplant',
    pdfFile: '/pdfs/powerplant/engine-instrument-systems.pdf',
    asaPages: [40, 47],
  },
  'PP-05': {
    id: 'PP-05',
    name: 'Engine Fire Protection',
    subtitle: 'Fire detection loops, extinguisher systems',
    category: 'powerplant',
    pdfFile: '/pdfs/powerplant/engine-fire-protection.pdf',
    asaPages: [48, 51],
  },
  'PP-06': {
    id: 'PP-06',
    name: 'Engine Electrical Systems',
    subtitle: 'Starters, alternators, ignition circuits',
    category: 'powerplant',
    pdfFile: '/pdfs/powerplant/engine-electrical-systems.pdf',
    asaPages: [52, 61],
  },
  'PP-07': {
    id: 'PP-07',
    name: 'Engine Lubrication Systems',
    subtitle: 'Oil types, wet/dry sump, filters, coolers',
    category: 'powerplant',
    pdfFile: '/pdfs/powerplant/engine-lubrication-systems.pdf',
    asaPages: [62, 74],
  },
  'PP-08': {
    id: 'PP-08',
    name: 'Ignition & Starting Systems',
    subtitle: 'Magnetos, spark plugs, turbine igniters',
    category: 'powerplant',
    pdfFile: '/pdfs/powerplant/ignition-starting-systems.pdf',
    asaPages: [75, 92],
  },
  'PP-09': {
    id: 'PP-09',
    name: 'Engine Fuel & Fuel Metering',
    subtitle: 'Carburetors, fuel injection, fuel control units',
    category: 'powerplant',
    pdfFile: '/pdfs/powerplant/engine-fuel-metering.pdf',
    asaPages: [93, 111],
  },
  'PP-10': {
    id: 'PP-10',
    name: 'Recip Induction & Cooling',
    subtitle: 'Superchargers, turbochargers, baffles',
    category: 'powerplant',
    pdfFile: '/pdfs/powerplant/recip-induction-cooling.pdf',
    asaPages: [112, 120],
  },
  'PP-11': {
    id: 'PP-11',
    name: 'Turbine Engine Air Systems',
    subtitle: 'Bleed air, anti-ice, pressurization',
    category: 'powerplant',
    pdfFile: '/pdfs/powerplant/turbine-engine-air-systems.pdf',
    asaPages: [121, 122],
  },
  'PP-12': {
    id: 'PP-12',
    name: 'Engine Exhaust & Reverser',
    subtitle: 'Exhaust systems, thrust reversers, augmentors',
    category: 'powerplant',
    pdfFile: '/pdfs/powerplant/engine-exhaust-reverser.pdf',
    asaPages: [123, 126],
  },
  'PP-13': {
    id: 'PP-13',
    name: 'Propellers',
    subtitle: 'Fixed-pitch, constant-speed, governors',
    category: 'powerplant',
    pdfFile: '/pdfs/powerplant/propellers.pdf',
    asaPages: [127, 143],
  },
};

export const CATEGORIES = {
  airframe: {
    name: 'Airframe',
    code: 'AMA',
    examQuestions: 100,
    timeHours: 2,
    passingScore: 70,
    topics: [
      'AF-01', 'AF-02', 'AF-03', 'AF-04', 'AF-05',
      'AF-06', 'AF-07', 'AF-08', 'AF-09', 'AF-10',
      'AF-11', 'AF-12', 'AF-13', 'AF-14', 'AF-15',
    ],
  },
  powerplant: {
    name: 'Powerplant',
    code: 'AMP',
    examQuestions: 100,
    timeHours: 2,
    passingScore: 70,
    topics: [
      'PP-01', 'PP-02', 'PP-03', 'PP-04', 'PP-05',
      'PP-06', 'PP-07', 'PP-08', 'PP-09', 'PP-10',
      'PP-11', 'PP-12', 'PP-13',
    ],
  },
};
```

- [ ] **Step 2: Create data index with lazy question loaders**

Create `src/data/index.js`:

```js
export { TOPICS, CATEGORIES } from './topics.js';

/**
 * Lazy-load questions for a given topic ID.
 * Returns an empty array for topics with no question data yet.
 */
const questionLoaders = {
  'AF-06': () => import('./airframe/hydraulic-pneumatic-systems.js'),
  // Add more loaders as question files are created:
  // 'AF-01': () => import('./airframe/metallic-structures.js'),
};

const questionCache = {};

export async function loadQuestions(topicId) {
  if (questionCache[topicId]) return questionCache[topicId];

  const loader = questionLoaders[topicId];
  if (!loader) return [];

  const mod = await loader();
  questionCache[topicId] = mod.questions;
  return mod.questions;
}

/**
 * Load all questions across all topics (for search).
 * Returns { topicId: questions[] }
 */
export async function loadAllQuestions() {
  const results = {};
  for (const topicId of Object.keys(questionLoaders)) {
    results[topicId] = await loadQuestions(topicId);
  }
  return results;
}

/**
 * Get all question IDs for a topic from the cache.
 * Returns [] if not yet loaded.
 */
export function getCachedQuestionIds(topicId) {
  const qs = questionCache[topicId];
  return qs ? qs.map((q) => q.id) : [];
}

/**
 * Check if a topic has question data available.
 */
export function hasQuestionData(topicId) {
  return topicId in questionLoaders;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/data/topics.js src/data/index.js
git commit -m "feat: topic configuration for all 29 A&P subtopics"
```

---

### Task 5: Migrate existing questions to AF-06 format

**Files:**
- Create: `src/data/airframe/hydraulic-pneumatic-systems.js`
- Modify: `src/data/questions.js` (read only — source for migration)

This task converts the existing 145 questions from `src/data/questions.js` into the new per-subtopic format. The existing file uses numeric IDs (1-145) and 4-option answers. The new format uses string IDs and preserves the answer count as-is (the ASA format uses 3 options, but existing questions have 4 — both work fine since ExamScreen renders all options dynamically).

- [ ] **Step 1: Create the AF-06 question file**

Read the existing `src/data/questions.js` and create `src/data/airframe/hydraulic-pneumatic-systems.js`. The conversion rules:
- `id`: Change from numeric `1` to string `"AF06-1"` (prefix with topic code)
- `section`: Remove this field (no longer needed — the file IS the section)
- `q`, `a`, `c`, `exp`, `diagram`: Keep as-is
- Add `acs: null` and `ref: null` (these weren't in the original data)

Write a small Node script or do it manually. The file should export:

```js
export const questions = [
  {
    id: 'AF06-1',
    q: 'The study of...',          // original question text
    a: ['option1', 'option2', ...], // original choices (3 or 4)
    c: 0,                          // original correct index
    exp: 'Explanation...',         // original explanation
    acs: null,
    ref: null,
    diagram: null,                 // or original diagram key
  },
  // ... all 145 questions
];
```

**Important:** Preserve the original `diagram` values exactly (e.g., `"pascalLaw"`, `"reservoir"`, etc.) — the diagram registry in `src/diagrams/index.js` will still work with these keys.

- [ ] **Step 2: Verify the file loads correctly**

Add a quick sanity test. Create `tests/data/af06.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { questions } from '../../src/data/airframe/hydraulic-pneumatic-systems.js';

describe('AF-06 questions', () => {
  it('has 145 questions', () => {
    expect(questions).toHaveLength(145);
  });

  it('every question has required fields', () => {
    for (const q of questions) {
      expect(q.id).toMatch(/^AF06-/);
      expect(typeof q.q).toBe('string');
      expect(Array.isArray(q.a)).toBe(true);
      expect(q.a.length).toBeGreaterThanOrEqual(3);
      expect(typeof q.c).toBe('number');
      expect(q.c).toBeLessThan(q.a.length);
      expect(typeof q.exp).toBe('string');
    }
  });

  it('has no duplicate IDs', () => {
    const ids = questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
```

- [ ] **Step 3: Run tests**

Run: `npx vitest run tests/data/af06.test.js`
Expected: All 3 tests PASS

- [ ] **Step 4: Commit**

```bash
mkdir -p src/data/airframe
git add src/data/airframe/hydraulic-pneumatic-systems.js tests/data/af06.test.js
git commit -m "feat: migrate 145 hydraulic questions to AF-06 format"
```

---

### Task 6: localStorage migration utility

**Files:**
- Create: `src/utils/migration.js`
- Create: `tests/utils/migration.test.js`

- [ ] **Step 1: Write the tests**

Create `tests/utils/migration.test.js`:

```js
import { describe, it, expect, beforeEach } from 'vitest';
import { migrateLocalStorage } from '../../src/utils/migration.js';

beforeEach(() => {
  localStorage.clear();
});

describe('migrateLocalStorage', () => {
  it('does nothing when no old data exists', () => {
    migrateLocalStorage();
    expect(localStorage.getItem('phnx-confidence')).toBeNull();
    expect(localStorage.getItem('phnx-attempts')).toBeNull();
  });

  it('migrates hydr-pnu-qstats to phnx-confidence', () => {
    localStorage.setItem('hydr-pnu-qstats', JSON.stringify({
      1: { timesAnswered: 10, timesCorrect: 8 },
      2: { timesAnswered: 5, timesCorrect: 1 },
      3: { timesAnswered: 0, timesCorrect: 0 },
    }));

    migrateLocalStorage();

    const confidence = JSON.parse(localStorage.getItem('phnx-confidence'));
    // 8/10 = 80% → level 4
    expect(confidence['AF06-1'].level).toBe(4);
    expect(confidence['AF06-1'].attempts).toBe(10);
    // 1/5 = 20% → level 1
    expect(confidence['AF06-2'].level).toBe(1);
    expect(confidence['AF06-2'].attempts).toBe(5);
    // 0 attempts → not migrated (stays new)
    expect(confidence['AF06-3']).toBeUndefined();
  });

  it('migrates hydr-pnu-attempts to phnx-attempts', () => {
    localStorage.setItem('hydr-pnu-attempts', JSON.stringify([
      { id: 'abc', date: 1000, mode: 'exam', score: 100, total: 145, elapsed: 3600, missedQuestionIds: [5, 10] },
    ]));

    migrateLocalStorage();

    const attempts = JSON.parse(localStorage.getItem('phnx-attempts'));
    expect(attempts).toHaveLength(1);
    expect(attempts[0].topicId).toBe('AF-06');
    expect(attempts[0].score).toBe(100);
    expect(attempts[0].missed).toEqual(['AF06-5', 'AF06-10']);
  });

  it('removes old keys after migration', () => {
    localStorage.setItem('hydr-pnu-qstats', '{}');
    localStorage.setItem('hydr-pnu-attempts', '[]');

    migrateLocalStorage();

    expect(localStorage.getItem('hydr-pnu-qstats')).toBeNull();
    expect(localStorage.getItem('hydr-pnu-attempts')).toBeNull();
  });

  it('does not re-migrate if new keys already exist', () => {
    localStorage.setItem('phnx-confidence', '{"existing": true}');
    localStorage.setItem('hydr-pnu-qstats', '{"1": {"timesAnswered": 5, "timesCorrect": 5}}');

    migrateLocalStorage();

    const confidence = JSON.parse(localStorage.getItem('phnx-confidence'));
    expect(confidence.existing).toBe(true);
    expect(confidence['AF06-1']).toBeUndefined(); // should NOT have migrated
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/utils/migration.test.js`
Expected: FAIL

- [ ] **Step 3: Implement migration**

Create `src/utils/migration.js`:

```js
/**
 * One-time migration from old localStorage schema to new.
 * Old keys: hydr-pnu-attempts, hydr-pnu-qstats
 * New keys: phnx-attempts, phnx-confidence
 *
 * Safe to call multiple times — skips if new keys already exist.
 */
export function migrateLocalStorage() {
  const oldStatsKey = 'hydr-pnu-qstats';
  const oldAttemptsKey = 'hydr-pnu-attempts';
  const newConfidenceKey = 'phnx-confidence';
  const newAttemptsKey = 'phnx-attempts';

  // Don't re-migrate if new data already exists
  if (localStorage.getItem(newConfidenceKey) || localStorage.getItem(newAttemptsKey)) {
    return;
  }

  // Migrate question stats → confidence levels
  const oldStats = safeParseJSON(localStorage.getItem(oldStatsKey), null);
  if (oldStats) {
    const confidence = {};
    for (const [oldId, stats] of Object.entries(oldStats)) {
      if (stats.timesAnswered === 0) continue;
      const newId = `AF06-${oldId}`;
      const accuracy = stats.timesCorrect / stats.timesAnswered;
      let level;
      if (accuracy >= 0.8) level = 4;
      else if (accuracy >= 0.6) level = 3;
      else if (accuracy >= 0.4) level = 2;
      else level = 1;
      confidence[newId] = {
        level,
        attempts: stats.timesAnswered,
        lastSeen: new Date().toISOString().slice(0, 10),
      };
    }
    localStorage.setItem(newConfidenceKey, JSON.stringify(confidence));
  }

  // Migrate attempts
  const oldAttempts = safeParseJSON(localStorage.getItem(oldAttemptsKey), null);
  if (oldAttempts) {
    const newAttempts = oldAttempts.map((a) => ({
      id: a.id,
      topicId: 'AF-06',
      mode: a.mode,
      score: a.score,
      total: a.total,
      time: a.elapsed,
      missed: (a.missedQuestionIds || []).map((id) => `AF06-${id}`),
      date: a.date,
    }));
    localStorage.setItem(newAttemptsKey, JSON.stringify(newAttempts));
  }

  // Clean up old keys
  localStorage.removeItem(oldStatsKey);
  localStorage.removeItem(oldAttemptsKey);
}

function safeParseJSON(str, fallback) {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch {
    return fallback;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/utils/migration.test.js`
Expected: All 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/migration.js tests/utils/migration.test.js
git commit -m "feat: localStorage migration from old schema to new"
```

---

## Phase 2: Navigation & UI Components

### Task 7: Theme CSS updates

**Files:**
- Modify: `src/styles/theme.css`

- [ ] **Step 1: Add new CSS variables**

Add the following new variables to `src/styles/theme.css`. Keep all existing variables intact — only add new ones.

Add inside the existing `:root` (light theme) block:

```css
  --color-mastered: #22c55e;
  --color-learning: #F97316;
  --color-struggling: #ef4444;
  --color-not-started: #ccc;
  --color-card-bg: #f5f5f5;
  --color-card-border: #e0e0e0;
  --color-bar-track: #e0e0e0;
  --color-text-muted: #999;
```

Add inside the existing `[data-theme="dark"]` block:

```css
  --color-mastered: #22c55e;
  --color-learning: #F97316;
  --color-struggling: #ef4444;
  --color-not-started: #555;
  --color-card-bg: #111;
  --color-card-border: #2a2a2a;
  --color-bar-track: #333;
  --color-text-muted: #666;
```

- [ ] **Step 2: Verify the app still builds**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/styles/theme.css
git commit -m "feat: add mastery color CSS variables for both themes"
```

---

### Task 8: Refactor HistoryContext for new schema

**Files:**
- Modify: `src/HistoryContext.jsx`

This is a significant refactor. The context expands from tracking attempts + question stats to tracking confidence levels, bookmarks, and notes — all with the new `phnx-*` localStorage keys.

- [ ] **Step 1: Rewrite HistoryContext**

Replace the contents of `src/HistoryContext.jsx` with the new implementation. Key changes:
- New localStorage keys: `phnx-confidence`, `phnx-attempts`, `phnx-bookmarks`, `phnx-notes`
- `updateConfidence()` replaces `recordFlashcard()` — uses the level 1-5 system
- `saveAttempt()` updated to include `topicId` and use new missed ID format
- New functions: `toggleBookmark()`, `isBookmarked()`, `getNote()`, `saveNote()`
- Calls `migrateLocalStorage()` on mount (one-time migration)

The full implementation:

```jsx
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { updateConfidence as calcConfidence } from './utils/mastery.js';
import { migrateLocalStorage } from './utils/migration.js';

const HistoryContext = createContext();

const CONFIDENCE_KEY = 'phnx-confidence';
const ATTEMPTS_KEY = 'phnx-attempts';
const BOOKMARKS_KEY = 'phnx-bookmarks';
const NOTES_KEY = 'phnx-notes';

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function HistoryProvider({ children }) {
  // Run migration once on mount
  useEffect(() => {
    migrateLocalStorage();
  }, []);

  const [confidence, setConfidence] = useState(() => loadJSON(CONFIDENCE_KEY, {}));
  const [attempts, setAttempts] = useState(() => loadJSON(ATTEMPTS_KEY, []));
  const [bookmarks, setBookmarks] = useState(() =>
    loadJSON(BOOKMARKS_KEY, { questions: [], pdfPages: [] })
  );
  const [notes, setNotes] = useState(() => loadJSON(NOTES_KEY, {}));

  // Persist confidence to localStorage
  const persistConfidence = useCallback((next) => {
    setConfidence(next);
    localStorage.setItem(CONFIDENCE_KEY, JSON.stringify(next));
  }, []);

  // Update confidence for a single question
  const recordAnswer = useCallback(
    (questionId, correct) => {
      setConfidence((prev) => {
        const next = {
          ...prev,
          [questionId]: calcConfidence(prev[questionId] || null, correct),
        };
        localStorage.setItem(CONFIDENCE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  // Save a test attempt
  const saveAttempt = useCallback(
    ({ topicId, mode, questions: qs, answers, startTime, endTime }) => {
      const score = qs.reduce(
        (acc, q) => acc + (answers[q.id] === q.c ? 1 : 0),
        0
      );
      const missed = qs
        .filter((q) => answers[q.id] !== q.c)
        .map((q) => q.id);

      const attempt = {
        id: crypto.randomUUID(),
        topicId,
        mode,
        score,
        total: qs.length,
        time: Math.round((endTime - startTime) / 1000),
        missed,
        date: Date.now(),
      };

      setAttempts((prev) => {
        const next = [attempt, ...prev];
        localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(next));
        return next;
      });

      return attempt;
    },
    []
  );

  // Bookmark a question
  const toggleQuestionBookmark = useCallback(
    (questionId) => {
      setBookmarks((prev) => {
        const qs = prev.questions.includes(questionId)
          ? prev.questions.filter((id) => id !== questionId)
          : [...prev.questions, questionId];
        const next = { ...prev, questions: qs };
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  // Bookmark a PDF page
  const togglePdfBookmark = useCallback(
    (topicId, page) => {
      setBookmarks((prev) => {
        const exists = prev.pdfPages.some(
          (p) => p.topicId === topicId && p.page === page
        );
        const pages = exists
          ? prev.pdfPages.filter(
              (p) => !(p.topicId === topicId && p.page === page)
            )
          : [...prev.pdfPages, { topicId, page }];
        const next = { ...prev, pdfPages: pages };
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const isQuestionBookmarked = useCallback(
    (questionId) => bookmarks.questions.includes(questionId),
    [bookmarks.questions]
  );

  // Notes
  const getNote = useCallback(
    (topicId) => notes[topicId] || '',
    [notes]
  );

  const saveNote = useCallback(
    (topicId, text) => {
      setNotes((prev) => {
        const next = { ...prev, [topicId]: text };
        localStorage.setItem(NOTES_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  // Get attempts filtered by topic
  const getTopicAttempts = useCallback(
    (topicId) => attempts.filter((a) => a.topicId === topicId),
    [attempts]
  );

  // Clear all data
  const clearHistory = useCallback(() => {
    setConfidence({});
    setAttempts([]);
    setBookmarks({ questions: [], pdfPages: [] });
    setNotes({});
    localStorage.removeItem(CONFIDENCE_KEY);
    localStorage.removeItem(ATTEMPTS_KEY);
    localStorage.removeItem(BOOKMARKS_KEY);
    localStorage.removeItem(NOTES_KEY);
  }, []);

  return (
    <HistoryContext.Provider
      value={{
        confidence,
        attempts,
        bookmarks,
        recordAnswer,
        saveAttempt,
        toggleQuestionBookmark,
        togglePdfBookmark,
        isQuestionBookmarked,
        getNote,
        saveNote,
        getTopicAttempts,
        clearHistory,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error('useHistory must be used within HistoryProvider');
  return ctx;
}
```

- [ ] **Step 2: Verify the app still starts**

Run: `npm run dev`

The app will be broken at this point because other components still use the old `useHistory` API (e.g., `saveAttempt` signature changed, `questionStats` removed). That's expected — we'll fix those in later tasks.

- [ ] **Step 3: Commit**

```bash
git add src/HistoryContext.jsx
git commit -m "refactor: HistoryContext with confidence tracking, bookmarks, notes"
```

---

### Task 9: ReadinessRing and ProgressBarMulti components

**Files:**
- Create: `src/components/ReadinessRing.jsx`
- Create: `src/components/ProgressBarMulti.jsx`

- [ ] **Step 1: Create ReadinessRing**

Create `src/components/ReadinessRing.jsx`:

```jsx
const CIRCUMFERENCE = 2 * Math.PI * 15.5; // radius = 15.5

export default function ReadinessRing({ percentage, mastered, total }) {
  const dashArray = (percentage / 100) * CIRCUMFERENCE;
  const remainder = CIRCUMFERENCE - dashArray;

  return (
    <div className="readiness-ring">
      <div className="readiness-ring__circle">
        <svg viewBox="0 0 36 36" style={{ width: 72, height: 72, transform: 'rotate(-90deg)' }}>
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--color-bar-track)" strokeWidth="3" />
          <circle
            cx="18" cy="18" r="15.5" fill="none"
            stroke="var(--color-accent)"
            strokeWidth="3"
            strokeDasharray={`${dashArray} ${remainder}`}
            strokeLinecap="round"
          />
        </svg>
        <span className="readiness-ring__pct">{percentage}%</span>
      </div>
      <div className="readiness-ring__info">
        <span className="readiness-ring__label">Exam Readiness</span>
        <span className="readiness-ring__detail">{mastered} of {total} questions mastered</span>
        <span className="readiness-ring__threshold">70% needed to pass</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create ProgressBarMulti**

Create `src/components/ProgressBarMulti.jsx`:

```jsx
export default function ProgressBarMulti({ mastered, learning, total }) {
  if (total === 0) return null;
  const masteredPct = (mastered / total) * 100;
  const learningPct = (learning / total) * 100;

  return (
    <div
      className="progress-bar-multi"
      style={{ height: 3, background: 'var(--color-bar-track)', borderRadius: 2, display: 'flex', overflow: 'hidden' }}
    >
      {masteredPct > 0 && (
        <div style={{ width: `${masteredPct}%`, background: 'var(--color-mastered)' }} />
      )}
      {learningPct > 0 && (
        <div style={{ width: `${learningPct}%`, background: 'var(--color-learning)' }} />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ReadinessRing.jsx src/components/ProgressBarMulti.jsx
git commit -m "feat: ReadinessRing and ProgressBarMulti components"
```

---

### Task 10: TopicCard and TopicListScreen

**Files:**
- Create: `src/components/TopicCard.jsx`
- Create: `src/components/TopicListScreen.jsx`
- Create: `src/components/TopicListScreen.css`

- [ ] **Step 1: Create TopicCard**

Create `src/components/TopicCard.jsx`. This is the compact row card from the mockup:

```jsx
import ProgressBarMulti from './ProgressBarMulti.jsx';
import { getMasteryColor } from '../utils/mastery.js';

const BORDER_COLORS = {
  'passing': 'var(--color-mastered)',
  'learning': 'var(--color-learning)',
  'struggling': 'var(--color-struggling)',
  'not-started': 'var(--color-not-started)',
};

const PCT_COLORS = {
  'passing': 'var(--color-mastered)',
  'learning': 'var(--color-learning)',
  'struggling': 'var(--color-struggling)',
  'not-started': 'var(--color-not-started)',
};

export default function TopicCard({ topic, mastery, counts, onClick }) {
  const hasAttempts = counts.mastered + counts.learning > 0;
  const colorKey = getMasteryColor(mastery, hasAttempts);

  return (
    <button
      className="topic-card"
      onClick={onClick}
      style={{ borderLeftColor: BORDER_COLORS[colorKey] }}
    >
      <div className="topic-card__body">
        <span className="topic-card__name">{topic.name}</span>
        <ProgressBarMulti
          mastered={counts.mastered}
          learning={counts.learning}
          total={counts.mastered + counts.learning + counts.new}
        />
      </div>
      <span className="topic-card__pct" style={{ color: PCT_COLORS[colorKey] }}>
        {hasAttempts ? `${mastery}%` : '--'}
      </span>
    </button>
  );
}
```

- [ ] **Step 2: Create TopicListScreen**

Create `src/components/TopicListScreen.jsx`:

```jsx
import { useMemo } from 'react';
import { TOPICS, CATEGORIES } from '../data/index.js';
import { useHistory } from '../HistoryContext.jsx';
import { getTopicMastery, getTopicCounts } from '../utils/mastery.js';
import { getCachedQuestionIds } from '../data/index.js';
import ReadinessRing from './ReadinessRing.jsx';
import TopicCard from './TopicCard.jsx';
import './TopicListScreen.css';

import logo from '../assets/phnx-logo.jpeg';

export default function TopicListScreen({ onSelectTopic }) {
  const { confidence } = useHistory();

  // Calculate mastery for each topic
  const topicStats = useMemo(() => {
    const stats = {};
    for (const [id, topic] of Object.entries(TOPICS)) {
      const qIds = getCachedQuestionIds(id);
      stats[id] = {
        mastery: getTopicMastery(qIds, confidence),
        counts: getTopicCounts(qIds, confidence),
        questionCount: qIds.length,
      };
    }
    return stats;
  }, [confidence]);

  // Global readiness
  const globalStats = useMemo(() => {
    let totalMastered = 0;
    let totalQuestions = 0;
    for (const s of Object.values(topicStats)) {
      totalMastered += s.counts.mastered;
      totalQuestions += s.questionCount;
    }
    return {
      mastered: totalMastered,
      total: totalQuestions,
      pct: totalQuestions > 0 ? Math.round((totalMastered / totalQuestions) * 100) : 0,
    };
  }, [topicStats]);

  // Category readiness
  const categoryReadiness = (catKey) => {
    const topicIds = CATEGORIES[catKey].topics;
    let mastered = 0;
    let total = 0;
    for (const id of topicIds) {
      mastered += topicStats[id].counts.mastered;
      total += topicStats[id].questionCount;
    }
    return total > 0 ? Math.round((mastered / total) * 100) : 0;
  };

  return (
    <div className="topic-list">
      {/* Header */}
      <div className="topic-list__header">
        <img src={logo} alt="PHNX" className="topic-list__logo" />
        <span className="topic-list__title">PHNX FOUNDRIES</span>
      </div>

      {/* Readiness Ring */}
      <ReadinessRing
        percentage={globalStats.pct}
        mastered={globalStats.mastered}
        total={globalStats.total}
      />

      {/* Categories */}
      {Object.entries(CATEGORIES).map(([catKey, cat]) => (
        <div key={catKey} className="topic-list__category">
          <div className="topic-list__cat-header">
            <div>
              <h2 className="topic-list__cat-name">{cat.name.toUpperCase()}</h2>
              <span className="topic-list__cat-meta">
                {cat.code} &middot; {cat.examQuestions} Questions &middot; {cat.timeHours} hrs
              </span>
            </div>
            <span className="topic-list__cat-ready">{categoryReadiness(catKey)}% ready</span>
          </div>

          {cat.topics.map((topicId) => {
            const topic = TOPICS[topicId];
            const stats = topicStats[topicId];
            return (
              <TopicCard
                key={topicId}
                topic={topic}
                mastery={stats.mastery}
                counts={stats.counts}
                onClick={() => onSelectTopic(topicId)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create TopicListScreen.css**

Create `src/components/TopicListScreen.css` with styles for the compact row layout. Key classes: `.topic-list`, `.topic-list__header`, `.topic-list__category`, `.topic-list__cat-header`, `.topic-card`, `.topic-card__body`, `.topic-card__name`, `.topic-card__pct`, `.readiness-ring` and children. Follow the mockup dimensions: 48px tall cards, 3px left border, 13px font, 4px gaps between cards.

- [ ] **Step 4: Commit**

```bash
git add src/components/TopicCard.jsx src/components/TopicListScreen.jsx src/components/TopicListScreen.css
git commit -m "feat: TopicListScreen with compact row cards and readiness ring"
```

---

### Task 11: TabBar update

**Files:**
- Modify: `src/components/TabBar.jsx`
- Modify: `src/components/TabBar.css`

- [ ] **Step 1: Update TabBar to 4 tabs**

Replace the content of `src/components/TabBar.jsx`. The new tabs are: Home, Search, Bookmarks, Progress. Use simple SVG icons or Unicode symbols.

```jsx
import './TabBar.css';

const TABS = [
  { id: 'home', label: 'Home', icon: '⌂' },
  { id: 'search', label: 'Search', icon: '⌕' },
  { id: 'bookmarks', label: 'Bookmarks', icon: '★' },
  { id: 'progress', label: 'Progress', icon: '▤' },
];

export default function TabBar({ activeTab, onTabChange }) {
  return (
    <nav className="tab-bar">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`tab-bar-item ${activeTab === tab.id ? 'tab-bar-item--active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="tab-bar-item__icon">{tab.icon}</span>
          <span className="tab-bar-item__label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
```

- [ ] **Step 2: Update TabBar.css**

Update `src/components/TabBar.css` to accommodate 4 tabs instead of 2. The layout should use `display: flex; justify-content: space-around;` with a fixed bottom position. Each tab gets 25% width.

- [ ] **Step 3: Commit**

```bash
git add src/components/TabBar.jsx src/components/TabBar.css
git commit -m "feat: update TabBar to 4 tabs (Home, Search, Bookmarks, Progress)"
```

---

### Task 12: SubtopicScreen

**Files:**
- Create: `src/components/SubtopicScreen.jsx`
- Create: `src/components/SubtopicScreen.css`

The SubtopicScreen is what you see after tapping a topic card. It shows progress summary, three mode tiles (Study, Flashcards, Test), test sub-options, and recent attempts.

- [ ] **Step 1: Create SubtopicScreen**

Create `src/components/SubtopicScreen.jsx`:

```jsx
import { useMemo } from 'react';
import { TOPICS } from '../data/index.js';
import { useHistory } from '../HistoryContext.jsx';
import { getTopicMastery, getTopicCounts, getMasteryColor } from '../utils/mastery.js';
import { getCachedQuestionIds, hasQuestionData } from '../data/index.js';
import ProgressBarMulti from './ProgressBarMulti.jsx';
import './SubtopicScreen.css';

const CATEGORY_LABELS = { airframe: 'Airframe', powerplant: 'Powerplant' };

export default function SubtopicScreen({
  topicId,
  onBack,
  onStartStudy,
  onStartFlashcards,
  onStartTest,
  onStartMockExam,
  onViewHistory,
}) {
  const topic = TOPICS[topicId];
  const { confidence, getTopicAttempts } = useHistory();

  const qIds = getCachedQuestionIds(topicId);
  const mastery = getTopicMastery(qIds, confidence);
  const counts = getTopicCounts(qIds, confidence);
  const hasAttempts = counts.mastered + counts.learning > 0;
  const colorKey = getMasteryColor(mastery, hasAttempts);
  const recentAttempts = getTopicAttempts(topicId).slice(0, 3);
  const hasQuestions = hasQuestionData(topicId);

  // Count weak questions (confidence level 1-2 with attempts)
  const weakCount = qIds.filter((id) => {
    const c = confidence[id];
    return c && c.attempts > 0 && c.level <= 2;
  }).length;

  const formatDate = (ts) => {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="subtopic">
      {/* Top nav */}
      <div className="subtopic__nav">
        <button className="subtopic__back" onClick={onBack}>&larr;</button>
        <div>
          <h1 className="subtopic__title">{topic.name}</h1>
          <span className="subtopic__breadcrumb">
            {CATEGORY_LABELS[topic.category]} &middot; {qIds.length} Questions
          </span>
        </div>
      </div>

      {/* Progress summary */}
      {hasQuestions && (
        <div className="subtopic__progress">
          <span className={`subtopic__pct subtopic__pct--${colorKey}`}>
            {hasAttempts ? `${mastery}%` : '--'}
          </span>
          <div className="subtopic__counts">
            <span className="subtopic__count subtopic__count--mastered">&#9679; {counts.mastered} mastered</span>
            <span className="subtopic__count subtopic__count--learning">&#9679; {counts.learning} learning</span>
            <span className="subtopic__count subtopic__count--new">&#9679; {counts.new} new</span>
          </div>
          <ProgressBarMulti mastered={counts.mastered} learning={counts.learning} total={qIds.length} />
        </div>
      )}

      {/* Mode tiles */}
      <div className="subtopic__modes">
        <button className="subtopic__mode" onClick={onStartStudy}>
          <span className="subtopic__mode-icon">&#128214;</span>
          <span className="subtopic__mode-label">Study</span>
          <span className="subtopic__mode-desc">Read the chapter</span>
        </button>

        <button
          className="subtopic__mode"
          onClick={onStartFlashcards}
          disabled={!hasQuestions}
        >
          <span className="subtopic__mode-icon">&#127183;</span>
          <span className="subtopic__mode-label">Flashcards</span>
          <span className="subtopic__mode-desc">Quick recall</span>
        </button>

        <button
          className="subtopic__mode subtopic__mode--accent"
          onClick={() => onStartTest('all')}
          disabled={!hasQuestions}
        >
          <span className="subtopic__mode-icon">&#9997;&#65039;</span>
          <span className="subtopic__mode-label">Test</span>
          <span className="subtopic__mode-desc">Exam practice</span>
        </button>
      </div>

      {/* Test sub-options */}
      {hasQuestions && (
        <div className="subtopic__test-options">
          <h3 className="subtopic__section-title">TEST OPTIONS</h3>

          <button className="subtopic__option" onClick={() => onStartTest('all')}>
            <div>
              <span className="subtopic__option-name">All Questions</span>
              <span className="subtopic__option-desc">{qIds.length} questions, randomized</span>
            </div>
            <span className="subtopic__option-arrow">&rsaquo;</span>
          </button>

          {weakCount > 0 && (
            <button className="subtopic__option" onClick={() => onStartTest('weak')}>
              <div>
                <span className="subtopic__option-name">Weak Areas Only</span>
                <span className="subtopic__option-desc subtopic__option-desc--weak">
                  {weakCount} questions below confidence
                </span>
              </div>
              <span className="subtopic__option-arrow">&rsaquo;</span>
            </button>
          )}

          <button className="subtopic__option" onClick={onStartMockExam}>
            <div>
              <span className="subtopic__option-name">Mock Exam</span>
              <span className="subtopic__option-desc">Timed, no feedback until end</span>
            </div>
            <span className="subtopic__option-arrow">&rsaquo;</span>
          </button>
        </div>
      )}

      {!hasQuestions && (
        <div className="subtopic__coming-soon">
          <p>Questions coming soon for this topic.</p>
          <p>Study mode (PDF chapter) is available.</p>
        </div>
      )}

      {/* Recent attempts */}
      {recentAttempts.length > 0 && (
        <div className="subtopic__recent">
          <h3 className="subtopic__section-title">RECENT ATTEMPTS</h3>
          {recentAttempts.map((a) => (
            <div key={a.id} className="subtopic__attempt">
              <span className="subtopic__attempt-date">
                {formatDate(a.date)}, {formatTime(a.date)}
              </span>
              <span
                className="subtopic__attempt-score"
                style={{ color: (a.score / a.total) * 100 >= 70 ? 'var(--color-mastered)' : 'var(--color-learning)' }}
              >
                {Math.round((a.score / a.total) * 100)}% ({a.score}/{a.total})
              </span>
            </div>
          ))}
          <button className="subtopic__history-link" onClick={onViewHistory}>
            View full history &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create SubtopicScreen.css**

Create `src/components/SubtopicScreen.css` with styles matching the mockup: nav bar with back arrow, progress card, mode tiles in a 3-column grid, test option rows, recent attempts list. Use the CSS variables defined in Task 7.

- [ ] **Step 3: Commit**

```bash
git add src/components/SubtopicScreen.jsx src/components/SubtopicScreen.css
git commit -m "feat: SubtopicScreen with mode tiles, test options, recent attempts"
```

---

### Task 13: Rewire App.jsx routing

**Files:**
- Modify: `src/App.jsx`

This is the biggest single change — replacing the old 2-tab routing with the new multi-topic navigation. The new App.jsx manages:
- Top-level tabs: home, search, bookmarks, progress
- Home tab screens: topic-list, subtopic, study, flashcards, test, mock-exam, results, history
- Active topic state
- Question loading (async)

- [ ] **Step 1: Rewrite App.jsx**

Replace the contents of `src/App.jsx`. Key changes:
- Remove import of old `questions` and `SECTIONS` from `./data/questions.js`
- Import new `TOPICS`, `loadQuestions`, `getCachedQuestionIds` from `./data/index.js`
- Replace `tab: 'exam'|'flashcards'` with `tab: 'home'|'search'|'bookmarks'|'progress'`
- Replace `screen: 'home'|'exam'|'results'|'history'` with expanded screen states
- Add `activeTopicId` state
- Question loading: when entering a subtopic, call `loadQuestions(topicId)` and store result
- Wire screens that exist at this point: TopicListScreen, SubtopicScreen, ExamScreen, FlashcardSession, FlashcardComplete, ResultsScreen, HistoryScreen
- For SearchScreen, BookmarksScreen, and ProgressScreen: create minimal placeholder components (a single div with the screen name) so the imports work. These will be fully implemented in Tasks 21-23.
- MockExamScreen will be created in Task 15 — use a placeholder until then
- Keep the shuffle import from new location `./utils/shuffle.js`
- Pass `topicId` to ExamScreen, ResultsScreen, FlashcardSession
- For test mode 'weak': filter questions where `confidence[q.id]` has level <= 2, backfill to 20

The component should render the current screen based on `tab` and `screen` state. Use a `switch` or conditional rendering chain.

- [ ] **Step 2: Remove old HomeScreen and FlashcardHome imports**

Delete the imports for `HomeScreen` and `FlashcardHome` from App.jsx. These components are no longer used.

- [ ] **Step 3: Verify the app renders the new homepage**

Run: `npm run dev`
Expected: The app loads showing the TopicListScreen with all 29 topics listed under Airframe and Powerplant headers. Only AF-06 has question data — other topics show mastery as "--".

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "refactor: App.jsx with multi-topic routing and navigation"
```

---

## Phase 3: Core Study Modes

### Task 14: Adapt ExamScreen for multi-topic

**Files:**
- Modify: `src/components/ExamScreen.jsx`

- [ ] **Step 1: Update ExamScreen**

Changes needed:
- Remove `import { SECTIONS } from '../data/questions.js'` — replace with `TOPICS` from `../data/index.js`
- Add `topicId` prop
- Remove section-based header logic — replace with topic name from `TOPICS[topicId].name`
- The `mode` prop now includes `'mock'` — but mock exam has its own screen (MockExamScreen), so ExamScreen only handles `'all'` and `'weak'`
- Call `recordAnswer(q.id, answerIndex === q.c)` from HistoryContext when the user answers (in addition to tracking in local `answers` state)
- Add a bookmark button next to the flag button on each question. Use `toggleQuestionBookmark(q.id)` and `isQuestionBookmarked(q.id)` from HistoryContext. Show a filled/unfilled bookmark icon.
- The question navigator, flagging, and feedback all work as-is since they're driven by the `questions` array prop

Key prop changes:
```
// Old: mode: 'exam' | 'study' | 'weak', studySection: string
// New: topicId: string, mode: 'all' | 'weak'
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ExamScreen.jsx
git commit -m "refactor: ExamScreen accepts topicId, uses new confidence tracking"
```

---

### Task 15: MockExamScreen

**Files:**
- Create: `src/components/MockExamScreen.jsx`
- Create: `src/components/MockExamScreen.css`

This is the timed, no-feedback test mode. Key differences from ExamScreen:
- Timer counts DOWN (proportional: 2 hours for 100 questions, scaled to actual question count)
- No feedback after answering — just moves to next question
- No explanation shown
- Cannot go back to review answered questions (optional: can be allowed, check FAA format)
- "Finish" ends the exam and navigates to results

- [ ] **Step 1: Create MockExamScreen**

Create `src/components/MockExamScreen.jsx`. Model it after ExamScreen but:
- Calculate time limit: `Math.round((questions.length / 100) * 120 * 60)` seconds
- Timer counts down from the time limit
- When timer hits 0, auto-finish
- Answer selection immediately moves to next question (no feedback state)
- No answer highlighting, no explanation display
- Progress bar shows completion
- Show remaining time in MM:SS format in header

Props: `questions`, `topicId`, `onFinish(answers)` (same answers object format as ExamScreen)

- [ ] **Step 2: Create MockExamScreen.css**

Style it similarly to ExamScreen but simpler (no feedback colors, no explanation box).

- [ ] **Step 3: Commit**

```bash
git add src/components/MockExamScreen.jsx src/components/MockExamScreen.css
git commit -m "feat: MockExamScreen with countdown timer and no-feedback mode"
```

---

### Task 16: Adapt ResultsScreen for multi-topic

**Files:**
- Modify: `src/components/ResultsScreen.jsx`

- [ ] **Step 1: Update ResultsScreen**

Changes:
- Add `topicId` prop
- Remove `import { SECTIONS } from '../data/questions.js'`
- Replace the section breakdown with a simple score display (since all questions are from one subtopic, there's no multi-section breakdown)
- Use `TOPICS[topicId].name` for the topic name in the header and share text
- Call `saveAttempt({ topicId, mode, questions, answers, startTime, endTime })` with the new API
- Update share text from "AMA 214: Hydraulics & Pneumatics" to `TOPICS[topicId].name`
- The missed questions list and "go to question" functionality remain the same
- Update `recordAnswer()` calls: after the exam finishes, loop through all questions and call `recordAnswer(q.id, answers[q.id] === q.c)` to update confidence levels

- [ ] **Step 2: Commit**

```bash
git add src/components/ResultsScreen.jsx
git commit -m "refactor: ResultsScreen for multi-topic with confidence updates"
```

---

### Task 17: Adapt FlashcardSession for multi-topic

**Files:**
- Modify: `src/components/FlashcardSession.jsx`

- [ ] **Step 1: Update FlashcardSession**

Changes:
- Add `topicId` prop
- Remove `import { SECTIONS } from '../data/questions.js'`
- Replace section name display with `TOPICS[topicId].name`
- Replace `recordFlashcard(q.id, gotIt)` with `recordAnswer(q.id, gotIt)` from the new HistoryContext API
- Add a bookmark button on each card (visible when flipped). Use `toggleQuestionBookmark(q.id)` and `isQuestionBookmarked(q.id)` from HistoryContext.
- Remove `sectionKey` prop references — use `topicId` instead

- [ ] **Step 2: Commit**

```bash
git add src/components/FlashcardSession.jsx
git commit -m "refactor: FlashcardSession uses topicId and confidence tracking"
```

---

### Task 18: Adapt HistoryScreen for per-subtopic history

**Files:**
- Modify: `src/components/HistoryScreen.jsx`

- [ ] **Step 1: Update HistoryScreen**

Changes:
- Add `topicId` prop
- Filter attempts by `topicId` using `getTopicAttempts(topicId)` from HistoryContext
- Remove `import { SECTIONS } from '../data/questions.js'`
- Update `getModeLabel()` to show 'All Questions', 'Weak Areas', or 'Mock Exam' based on `mode` field
- Show topic name in header: `TOPICS[topicId].name`
- Keep the TrendChart component — pass filtered attempts
- Keep the clear history option but scope it appropriately (or keep it global)

- [ ] **Step 2: Commit**

```bash
git add src/components/HistoryScreen.jsx
git commit -m "refactor: HistoryScreen shows per-subtopic history"
```

---

## Phase 4: PDF System

### Task 19: PDF split build script

**Files:**
- Create: `scripts/split-pdfs.mjs`

- [ ] **Step 1: Create the split script**

Create `scripts/split-pdfs.mjs`. This reads the source PDFs from iCloud and outputs per-chapter PDFs to `public/pdfs/`.

```js
import { PDFDocument } from 'pdf-lib';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public', 'pdfs');

// Source PDF paths (iCloud)
const AIRFRAME_PDF = join(
  process.env.HOME,
  'Library/Mobile Documents/com~apple~CloudDocs/A&P/ATA_Airframe',
  'FAA-H-8083-31B_Aviation_Maintenance_Technician_Handbook.pdf'
);
const POWERPLANT_PDF = join(
  process.env.HOME,
  'Library/Mobile Documents/com~apple~CloudDocs/A&P/Powerplant',
  'Aircraft Propulsion 2ed.pdf'
);

// Chapter page ranges (1-indexed, inclusive)
// These will be filled in as the actual page ranges are determined
const CHAPTERS = {
  airframe: {
    'metallic-structures': { source: AIRFRAME_PDF, pages: [1, 50] },
    // ... add more chapters as page ranges are determined
  },
  powerplant: {
    'reciprocating-engines': { source: POWERPLANT_PDF, pages: [1, 30] },
    // ... add more chapters as page ranges are determined
  },
};

async function splitPdf(sourcePath, startPage, endPage, outputPath) {
  console.log(`  Extracting pages ${startPage}-${endPage} → ${outputPath}`);
  const sourceBytes = await readFile(sourcePath);
  const sourcePdf = await PDFDocument.load(sourceBytes);

  const newPdf = await PDFDocument.create();
  // pdf-lib uses 0-based indexing
  const indices = [];
  for (let i = startPage - 1; i < endPage; i++) {
    indices.push(i);
  }
  const pages = await newPdf.copyPages(sourcePdf, indices);
  pages.forEach((p) => newPdf.addPage(p));

  const bytes = await newPdf.save();
  const dir = dirname(outputPath);
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
  await writeFile(outputPath, bytes);
  console.log(`  ✓ ${bytes.length} bytes written`);
}

async function main() {
  for (const [category, chapters] of Object.entries(CHAPTERS)) {
    console.log(`\n${category.toUpperCase()}`);
    for (const [name, config] of Object.entries(chapters)) {
      if (!existsSync(config.source)) {
        console.log(`  ⚠ Skipping ${name}: source PDF not found at ${config.source}`);
        continue;
      }
      const outputPath = join(publicDir, category, `${name}.pdf`);
      await splitPdf(config.source, config.pages[0], config.pages[1], outputPath);
    }
  }
  console.log('\nDone!');
}

main().catch(console.error);
```

- [ ] **Step 2: Create public/pdfs directories**

```bash
mkdir -p public/pdfs/airframe public/pdfs/powerplant
```

- [ ] **Step 3: Add .gitignore entry for source PDFs**

Add to `.gitignore`:
```
# Source PDFs (large, stored in iCloud)
*.pdf
!public/pdfs/**/*.pdf
```

Note: This ignores PDFs in the project root and src/ but keeps the split chapter PDFs in public/pdfs/.

- [ ] **Step 4: Test the script runs**

Run: `node scripts/split-pdfs.mjs`
Expected: Script runs, creates PDF files in `public/pdfs/`. If source PDFs aren't found (iCloud not synced), it prints skip warnings.

- [ ] **Step 5: Commit**

```bash
git add scripts/split-pdfs.mjs
git commit -m "feat: PDF split build script using pdf-lib"
```

---

### Task 20: PdfViewer component

**Files:**
- Create: `src/components/PdfViewer.jsx`
- Create: `src/components/PdfViewer.css`
- Modify: `vite.config.js` (pdf.js worker configuration)

- [ ] **Step 1: Configure pdf.js worker in Vite**

Add to `vite.config.js` — the pdf.js worker needs to be configured for Vite's module system. Add the worker configuration and update the workbox glob patterns to include `.pdf` files:

Update the `globPatterns` in the VitePWA config to include `**/*.pdf`.

- [ ] **Step 2: Create PdfViewer component**

Create `src/components/PdfViewer.jsx`:

```jsx
import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useHistory } from '../HistoryContext.jsx';
import './PdfViewer.css';

// Configure pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export default function PdfViewer({ topicId, pdfFile, onBack }) {
  const [numPages, setNumPages] = useState(null);
  const [error, setError] = useState(null);
  const { togglePdfBookmark, bookmarks } = useHistory();

  const onDocumentLoadSuccess = useCallback(({ numPages: n }) => {
    setNumPages(n);
  }, []);

  const isPageBookmarked = (page) =>
    bookmarks.pdfPages.some((p) => p.topicId === topicId && p.page === page);

  if (error) {
    return (
      <div className="pdf-viewer">
        <div className="pdf-viewer__nav">
          <button className="pdf-viewer__back" onClick={onBack}>&larr;</button>
          <span>Study</span>
        </div>
        <div className="pdf-viewer__error">
          <p>Could not load chapter PDF.</p>
          <p className="pdf-viewer__error-detail">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pdf-viewer">
      <div className="pdf-viewer__nav">
        <button className="pdf-viewer__back" onClick={onBack}>&larr;</button>
        <span className="pdf-viewer__page-info">
          {numPages ? `${numPages} pages` : 'Loading...'}
        </span>
      </div>

      <div className="pdf-viewer__content">
        <Document
          file={pdfFile}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(err) => setError(err.message)}
          loading={<div className="pdf-viewer__loading">Loading chapter...</div>}
        >
          {numPages &&
            Array.from({ length: numPages }, (_, i) => (
              <div key={i} className="pdf-viewer__page-wrapper">
                <Page
                  pageNumber={i + 1}
                  width={Math.min(window.innerWidth - 32, 600)}
                  renderTextLayer={true}
                  renderAnnotationLayer={false}
                />
                <div className="pdf-viewer__page-footer">
                  <span className="pdf-viewer__page-num">Page {i + 1}</span>
                  <button
                    className={`pdf-viewer__bookmark ${isPageBookmarked(i + 1) ? 'pdf-viewer__bookmark--active' : ''}`}
                    onClick={() => togglePdfBookmark(topicId, i + 1)}
                  >
                    {isPageBookmarked(i + 1) ? '★' : '☆'}
                  </button>
                </div>
              </div>
            ))}
        </Document>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create PdfViewer.css**

Create `src/components/PdfViewer.css` with styles for the viewer: sticky nav bar, scrollable content area, page wrappers with bottom border, bookmark button, loading/error states.

- [ ] **Step 4: Commit**

```bash
git add src/components/PdfViewer.jsx src/components/PdfViewer.css vite.config.js
git commit -m "feat: PdfViewer component with react-pdf and page bookmarks"
```

---

## Phase 5: Additional Features

### Task 21: SearchScreen

**Files:**
- Create: `src/components/SearchScreen.jsx`
- Create: `src/components/SearchScreen.css`

- [ ] **Step 1: Create SearchScreen**

Create `src/components/SearchScreen.jsx`:

The search screen loads all questions on first use (via `loadAllQuestions()`), then filters by a search query. Results are grouped by topic. Uses a debounced input.

Key logic:
- `useState` for query, results, loading
- `useEffect` on mount: call `loadAllQuestions()` to populate cache
- Filter: case-insensitive match against `q.q`, `q.a` (joined), and `q.exp`
- Group results by topicId
- Show topic name header + matching questions under it
- Tapping a result could navigate to that question (stretch — for now, just show it inline)

- [ ] **Step 2: Create SearchScreen.css**

Style the search input, results list, topic group headers, and question previews.

- [ ] **Step 3: Commit**

```bash
git add src/components/SearchScreen.jsx src/components/SearchScreen.css
git commit -m "feat: SearchScreen with full-text question search"
```

---

### Task 22: BookmarksScreen

**Files:**
- Create: `src/components/BookmarksScreen.jsx`
- Create: `src/components/BookmarksScreen.css`

- [ ] **Step 1: Create BookmarksScreen**

Shows two sections: bookmarked questions and bookmarked PDF pages.
- Reads from `useHistory().bookmarks`
- For question bookmarks: look up question data from cache, show question text preview + topic name
- For PDF bookmarks: show topic name + page number
- Tapping a question bookmark navigates to that question
- Tapping a PDF bookmark opens PdfViewer at that page (stretch goal)
- Empty state: "No bookmarks yet" message

- [ ] **Step 2: Create BookmarksScreen.css**

- [ ] **Step 3: Commit**

```bash
git add src/components/BookmarksScreen.jsx src/components/BookmarksScreen.css
git commit -m "feat: BookmarksScreen showing saved questions and PDF pages"
```

---

### Task 23: ProgressScreen

**Files:**
- Create: `src/components/ProgressScreen.jsx`
- Create: `src/components/ProgressScreen.css`

- [ ] **Step 1: Create ProgressScreen**

Full dashboard showing mastery across all 29 subtopics:
- Two sections: Airframe and Powerplant
- Each subtopic shown as a compact row with name + mastery % + progress bar (reuse TopicCard or a simplified version)
- Category-level summary at top of each section: "X% ready, Y/Z questions mastered"
- Global stats at top: total readiness, total study time (sum of all attempt times)
- TrendChart at bottom showing overall readiness over time (reuse existing TrendChart)
- "Clear all progress" button with confirmation

- [ ] **Step 2: Create ProgressScreen.css**

- [ ] **Step 3: Commit**

```bash
git add src/components/ProgressScreen.jsx src/components/ProgressScreen.css
git commit -m "feat: ProgressScreen with full mastery dashboard"
```

---

### Task 24: NotesEditor

**Files:**
- Create: `src/components/NotesEditor.jsx`
- Create: `src/components/NotesEditor.css`

- [ ] **Step 1: Create NotesEditor**

Simple text area component for per-subtopic notes:
- Props: `topicId`
- Reads initial value from `useHistory().getNote(topicId)`
- Auto-saves on blur or after 1 second of inactivity (debounced)
- Shows in SubtopicScreen as a collapsible section or modal
- Placeholder: "Add notes for this topic..."

```jsx
import { useState, useEffect, useRef } from 'react';
import { useHistory } from '../HistoryContext.jsx';
import './NotesEditor.css';

export default function NotesEditor({ topicId }) {
  const { getNote, saveNote } = useHistory();
  const [text, setText] = useState(() => getNote(topicId));
  const timerRef = useRef(null);

  useEffect(() => {
    setText(getNote(topicId));
  }, [topicId, getNote]);

  const handleChange = (e) => {
    const val = e.target.value;
    setText(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => saveNote(topicId, val), 1000);
  };

  const handleBlur = () => {
    clearTimeout(timerRef.current);
    saveNote(topicId, text);
  };

  return (
    <div className="notes-editor">
      <h3 className="notes-editor__title">Notes</h3>
      <textarea
        className="notes-editor__textarea"
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Add notes for this topic..."
        rows={4}
      />
    </div>
  );
}
```

- [ ] **Step 2: Create NotesEditor.css**

- [ ] **Step 3: Wire NotesEditor into SubtopicScreen**

Add `<NotesEditor topicId={topicId} />` at the bottom of `SubtopicScreen.jsx`, below the recent attempts section.

- [ ] **Step 4: Commit**

```bash
git add src/components/NotesEditor.jsx src/components/NotesEditor.css src/components/SubtopicScreen.jsx
git commit -m "feat: NotesEditor for per-subtopic study notes"
```

---

## Phase 6: Polish & Integration

### Task 25: PWA manifest and Vite config updates

**Files:**
- Modify: `public/manifest.json`
- Modify: `vite.config.js`

- [ ] **Step 1: Update manifest.json**

Update `public/manifest.json`:
- `"name"`: "PHNX A&P Exam Prep"
- `"short_name"`: "A&P Prep"
- Keep existing theme_color (#F97316) and background_color (#000000)
- Keep existing icons

- [ ] **Step 2: Update Vite config for PDF caching**

In `vite.config.js`, update the workbox `globPatterns` to include PDF files:

```js
globPatterns: ['**/*.{js,css,html,svg,jpeg,png,woff2,pdf}']
```

Note: This will precache all PDFs in the build output. For large numbers of chapters, consider switching to runtime caching with a cache-first strategy instead of precaching. For now, with just AF-06's chapter, precaching is fine.

- [ ] **Step 3: Commit**

```bash
git add public/manifest.json vite.config.js
git commit -m "chore: update PWA manifest and Vite config for multi-topic app"
```

---

### Task 26: Clean up removed components

**Files:**
- Delete: `src/components/HomeScreen.jsx`
- Delete: `src/components/HomeScreen.css`
- Delete: `src/components/FlashcardHome.jsx`
- Delete: `src/components/FlashcardHome.css`
- Delete: `src/data/questions.js` (replaced by per-subtopic files)

- [ ] **Step 1: Remove old files**

```bash
git rm src/components/HomeScreen.jsx src/components/HomeScreen.css
git rm src/components/FlashcardHome.jsx src/components/FlashcardHome.css
git rm src/data/questions.js
```

- [ ] **Step 2: Verify no imports reference these files**

Run: `grep -r "HomeScreen\|FlashcardHome\|data/questions" src/`
Expected: No matches (all references should have been updated in Task 13)

- [ ] **Step 3: Verify FlashcardComplete.jsx has no broken imports**

Read `src/components/FlashcardComplete.jsx` and verify it does not import from `../data/questions.js` or reference `SECTIONS`. If it does, update those imports. FlashcardComplete receives its data via props (`results`, `onStudyMissed`, `onDone`) and should not need direct data imports.

- [ ] **Step 4: Verify the app builds**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 5: Commit**

```bash
git commit -m "chore: remove replaced HomeScreen, FlashcardHome, and old questions.js"
```

---

### Task 27: Run full test suite and verify app

- [ ] **Step 1: Run all tests**

Run: `npx vitest run`
Expected: All tests pass (shuffle, mastery, migration, AF-06 data)

- [ ] **Step 2: Start dev server and manually verify**

Run: `npm run dev`

Verify these flows:
1. Homepage shows all 29 topics under Airframe and Powerplant headers
2. Global readiness ring shows correct percentage
3. Tapping AF-06 (Hydraulic & Pneumatic Systems) opens the SubtopicScreen
4. The progress summary shows correct counts (if you had old data, it should be migrated)
5. Tapping "Test → All Questions" starts an exam with the 145 questions
6. Answering questions updates confidence levels
7. Finishing the exam shows results with the correct topic name
8. Going back to the homepage shows updated mastery for AF-06
9. Flashcards mode works for AF-06
10. Other topics show "Coming Soon" for questions but Study mode tile is available
11. Light/dark mode toggle works correctly with all new components
12. Bottom tab bar shows all 4 tabs and switches screens correctly

- [ ] **Step 3: Production build test**

Run: `npm run build && npm run preview`
Expected: App loads correctly from the production build

- [ ] **Step 4: Commit any fixes**

If any issues were found during manual testing, fix them and commit:

```bash
git add -A
git commit -m "fix: address issues found during integration testing"
```

---

### Task 28: Final verification and summary commit

- [ ] **Step 1: Run tests one final time**

Run: `npx vitest run`
Expected: All tests pass

- [ ] **Step 2: Check git log for clean history**

Run: `git log --oneline feature/multi-topic`
Expected: Clean sequence of commits, one per task

- [ ] **Step 3: Summary**

The feature branch is ready for review. It can be merged to main when the user is satisfied. Key points:
- 29 subtopics defined (15 Airframe + 14 Powerplant)
- AF-06 has all 145 questions migrated and working
- Other subtopics show as "Coming Soon" for questions (data can be added incrementally)
- PDF Study mode is wired up (chapters will appear once the split script populates them)
- All existing functionality preserved (exams, flashcards, history, trends)
- New features: search, bookmarks, notes, progress dashboard, mock exam mode
- Old localStorage data migrated automatically on first load
- Light and dark mode work with all new components

---

## Appendix: Adding Questions for More Topics

After the main implementation is complete, questions can be added for each subtopic incrementally. For each new topic:

1. Create the question file (e.g., `src/data/airframe/metallic-structures.js`) following the format in Task 5
2. Add the lazy loader to `src/data/index.js`:
   ```js
   'AF-01': () => import('./airframe/metallic-structures.js'),
   ```
3. The topic will automatically show mastery tracking on the homepage

Questions can be extracted from the ASA test guide PDFs. The format for each question:
```js
{
  id: 'AF01-8107',           // topic prefix + ASA question number
  q: 'Question text...',
  a: ['Choice A', 'Choice B', 'Choice C'],
  c: 0,                      // correct answer index (0-based)
  exp: 'Explanation...',
  acs: 'AM.II.A.K1',         // FAA ACS code from the test guide
  ref: 'FAA-H-8083-31',     // reference document
  diagram: null,
}
```

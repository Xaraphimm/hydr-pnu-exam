# FAA Exam & Flashcard System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full FAA AMA exam simulation with seeded exam versions, Study/Test modes, ASA question bank for all 15 airframe subtopics, and flashcard integration.

**Architecture:** Seeded PRNG generates deterministic 100-question exams weighted by ACS codes. Two new screens (ExamSelectionScreen, ExamResultsScreen) join the existing exam flow. Questions extracted from ASA 2024 Test Guide PDF into per-topic JS files following existing data patterns.

**Tech Stack:** React 19, Vite 8, Vitest, CSS Modules, localStorage persistence

---

### Task 1: Seeded PRNG & Exam Generator Utility

**Files:**
- Create: `src/utils/exam-generator.js`
- Create: `tests/utils/exam-generator.test.js`

- [ ] **Step 1: Write failing tests for seeded PRNG**

```js
// tests/utils/exam-generator.test.js
import { describe, it, expect } from 'vitest';
import { seededRandom, seededShuffle } from '../../src/utils/exam-generator.js';

describe('seededRandom', () => {
  it('produces deterministic output for the same seed', () => {
    const rng1 = seededRandom(42);
    const rng2 = seededRandom(42);
    const a = Array.from({ length: 10 }, () => rng1());
    const b = Array.from({ length: 10 }, () => rng2());
    expect(a).toEqual(b);
  });

  it('produces different output for different seeds', () => {
    const rng1 = seededRandom(1);
    const rng2 = seededRandom(2);
    const a = Array.from({ length: 10 }, () => rng1());
    const b = Array.from({ length: 10 }, () => rng2());
    expect(a).not.toEqual(b);
  });

  it('returns values between 0 and 1', () => {
    const rng = seededRandom(99);
    for (let i = 0; i < 100; i++) {
      const val = rng();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });
});

describe('seededShuffle', () => {
  it('returns same order for same seed', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const a = seededShuffle(arr, 42);
    const b = seededShuffle(arr, 42);
    expect(a).toEqual(b);
  });

  it('does not mutate original array', () => {
    const arr = [1, 2, 3];
    seededShuffle(arr, 1);
    expect(arr).toEqual([1, 2, 3]);
  });

  it('contains all original elements', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = seededShuffle(arr, 7);
    expect(result.sort()).toEqual([1, 2, 3, 4, 5]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/utils/exam-generator.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: Implement seeded PRNG and shuffle**

```js
// src/utils/exam-generator.js

/**
 * Mulberry32 — a fast, deterministic 32-bit PRNG.
 * Returns a function that produces values in [0, 1).
 */
export function seededRandom(seed) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fisher-Yates shuffle using a seeded PRNG.
 * Returns a new array; does not mutate the original.
 */
export function seededShuffle(arr, seed) {
  const rng = typeof seed === 'function' ? seed : seededRandom(seed);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/utils/exam-generator.test.js`
Expected: All 6 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/exam-generator.js tests/utils/exam-generator.test.js
git commit -m "feat: add seeded PRNG and shuffle for exam generation"
```

---

### Task 2: ACS Distribution & Exam Generation

**Files:**
- Modify: `src/utils/exam-generator.js`
- Modify: `tests/utils/exam-generator.test.js`

This task adds the ACS-weighted distribution calculator and the `generateExam` function. These are tested with mock question data to avoid depending on the real ASA question files (which come in later tasks).

- [ ] **Step 1: Write failing tests for ACS distribution and exam generation**

Append to `tests/utils/exam-generator.test.js`:

```js
import { getAcsDistribution, generateExam } from '../../src/utils/exam-generator.js';

// Mock question pools for testing
const mockQuestionsByTopic = {
  'AF-01': Array.from({ length: 30 }, (_, i) => ({
    id: `AF01-${i}`, q: `Q${i}`, a: ['A', 'B', 'C'], c: 0, exp: 'e', ref: 'r',
    acs: i < 10 ? 'AM.II.A.K1' : i < 20 ? 'AM.II.A.K2' : 'AM.II.A.K3',
  })),
  'AF-02': Array.from({ length: 20 }, (_, i) => ({
    id: `AF02-${i}`, q: `Q${i}`, a: ['A', 'B', 'C'], c: 0, exp: 'e', ref: 'r',
    acs: i < 10 ? 'AM.II.B.K1' : 'AM.II.B.K2',
  })),
  'AF-03': Array.from({ length: 10 }, (_, i) => ({
    id: `AF03-${i}`, q: `Q${i}`, a: ['A', 'B', 'C'], c: 0, exp: 'e', ref: 'r',
    acs: 'AM.II.C.K1',
  })),
};

describe('getAcsDistribution', () => {
  it('distributes proportionally by distinct ACS codes', () => {
    const dist = getAcsDistribution(mockQuestionsByTopic, 60);
    // AF-01 has 3 ACS codes, AF-02 has 2, AF-03 has 1 => total 6
    // AF-01: 3/6 * 60 = 30, AF-02: 2/6 * 60 = 20, AF-03: 1/6 * 60 = 10
    expect(dist['AF-01']).toBe(30);
    expect(dist['AF-02']).toBe(20);
    expect(dist['AF-03']).toBe(10);
  });

  it('sums to the requested total', () => {
    const dist = getAcsDistribution(mockQuestionsByTopic, 100);
    const sum = Object.values(dist).reduce((a, b) => a + b, 0);
    expect(sum).toBe(100);
  });

  it('guarantees minimum 1 per topic', () => {
    const dist = getAcsDistribution(mockQuestionsByTopic, 6);
    for (const count of Object.values(dist)) {
      expect(count).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('generateExam', () => {
  it('returns deterministic questions for the same seed', () => {
    const a = generateExam(1, mockQuestionsByTopic, 20);
    const b = generateExam(1, mockQuestionsByTopic, 20);
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id));
  });

  it('returns different questions for different seeds', () => {
    const a = generateExam(1, mockQuestionsByTopic, 20);
    const b = generateExam(2, mockQuestionsByTopic, 20);
    expect(a.map((q) => q.id)).not.toEqual(b.map((q) => q.id));
  });

  it('returns the requested number of questions', () => {
    const exam = generateExam(1, mockQuestionsByTopic, 20);
    expect(exam).toHaveLength(20);
  });

  it('has no duplicate questions', () => {
    const exam = generateExam(1, mockQuestionsByTopic, 20);
    const ids = exam.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('includes questions from all topics', () => {
    const exam = generateExam(1, mockQuestionsByTopic, 20);
    const topicPrefixes = new Set(exam.map((q) => q.id.split('-')[0]));
    expect(topicPrefixes.size).toBe(3);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/utils/exam-generator.test.js`
Expected: FAIL — `getAcsDistribution` and `generateExam` not exported

- [ ] **Step 3: Implement ACS distribution and exam generation**

Append to `src/utils/exam-generator.js`:

```js
/**
 * Calculate ACS-weighted question distribution.
 * @param {Object} questionsByTopic - { topicId: questionArray[] }
 * @param {number} totalQuestions - target exam size (e.g. 100)
 * @returns {Object} { topicId: questionCount }
 */
export function getAcsDistribution(questionsByTopic, totalQuestions) {
  const topicIds = Object.keys(questionsByTopic);

  // Count distinct ACS codes per topic
  const acsCounts = {};
  for (const topicId of topicIds) {
    const codes = new Set(questionsByTopic[topicId].map((q) => q.acs).filter(Boolean));
    acsCounts[topicId] = Math.max(codes.size, 1); // at least 1
  }

  const totalAcs = Object.values(acsCounts).reduce((a, b) => a + b, 0);

  // Proportional allocation with minimum 1 per topic
  const dist = {};
  let allocated = 0;

  for (const topicId of topicIds) {
    const raw = (acsCounts[topicId] / totalAcs) * totalQuestions;
    dist[topicId] = Math.max(1, Math.round(raw));
    // Cap at pool size
    dist[topicId] = Math.min(dist[topicId], questionsByTopic[topicId].length);
    allocated += dist[topicId];
  }

  // Adjust to hit exact total — add/remove from largest topics
  const sorted = [...topicIds].sort((a, b) => acsCounts[b] - acsCounts[a]);
  let diff = totalQuestions - allocated;
  let idx = 0;
  while (diff !== 0) {
    const tid = sorted[idx % sorted.length];
    if (diff > 0 && dist[tid] < questionsByTopic[tid].length) {
      dist[tid]++;
      diff--;
    } else if (diff < 0 && dist[tid] > 1) {
      dist[tid]--;
      diff++;
    }
    idx++;
    if (idx > sorted.length * totalQuestions) break; // safety
  }

  return dist;
}

/**
 * Generate a deterministic exam from question pools.
 * @param {number} seed - PRNG seed (1-5 for versions, Date.now() for random)
 * @param {Object} questionsByTopic - { topicId: questionArray[] }
 * @param {number} totalQuestions - target exam size
 * @returns {Array} array of question objects
 */
export function generateExam(seed, questionsByTopic, totalQuestions) {
  const rng = seededRandom(seed);
  const dist = getAcsDistribution(questionsByTopic, totalQuestions);
  const selected = [];

  for (const [topicId, count] of Object.entries(dist)) {
    const pool = questionsByTopic[topicId];
    const shuffled = seededShuffle(pool, rng);
    selected.push(...shuffled.slice(0, count));
  }

  // Final shuffle so topics are interleaved
  return seededShuffle(selected, rng);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/utils/exam-generator.test.js`
Expected: All 12 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/exam-generator.js tests/utils/exam-generator.test.js
git commit -m "feat: add ACS-weighted distribution and exam generation"
```

---

### Task 3: Extract ASA Questions — AF-01 through AF-05

**Files:**
- Create: `src/data/airframe/metallic-structures.js`
- Create: `src/data/airframe/non-metallic-structures.js`
- Create: `src/data/airframe/flight-controls.js`
- Create: `src/data/airframe/airframe-inspection.js`
- Create: `src/data/airframe/landing-gear-systems.js`
- Create: `tests/data/airframe-questions.test.js`

Extract questions from the ASA 2024 Airframe Mechanic Test Guide PDF. For each subtopic, read the relevant pages and convert every question into the standard format. Each question must include:
- `id`: `{topicPrefix}-{ASA 4-digit number}` (e.g., `AF01-8107`)
- `q`: full question text
- `a`: array of 3 answer choices (A, B, C)
- `c`: 0-based index of the correct answer (found in the "Answers" section at the bottom of each page)
- `exp`: explanation text (the italicized text below each question in the ASA book)
- `ref`: FAA reference document (e.g., `FAA-H-8083-31`, `AC 43.13-1B`) — from the end of each explanation
- `acs`: ACS code (e.g., `AM.II.A.K1`) — from the parenthetical at the end of each explanation
- `diagram`: `null` (no diagram support for extracted questions)

**Source pages in the PDF:**
- AF-01 Metallic Structures: pages 1–16
- AF-02 Non-Metallic Structures: pages 17–28
- AF-03 Flight Controls: pages 29–37
- AF-04 Airframe Inspection: pages 38–39
- AF-05 Landing Gear Systems: pages 40–52

**File format** (follow exact pattern from existing `hydraulic-pneumatic-systems.js`):

```js
export const questions = [
  {
    id: "AF01-8107",
    q: "Which statement is true regarding...",
    a: ["Answer A text", "Answer B text", "Answer C text"],
    c: 2,
    exp: "Explanation text from the book...",
    ref: "FAA-H-8083-31",
    acs: "AM.II.A.K1",
    diagram: null,
  },
  // ... all questions from the chapter
];
```

- [ ] **Step 1: Read PDF pages 1–16 and create `metallic-structures.js`**

Read the ASA PDF pages 1 through 16. Extract every question. Cross-reference answer keys at the bottom of each page. Write the complete file.

- [ ] **Step 2: Read PDF pages 17–28 and create `non-metallic-structures.js`**

- [ ] **Step 3: Read PDF pages 29–37 and create `flight-controls.js`**

- [ ] **Step 4: Read PDF pages 38–39 and create `airframe-inspection.js`**

- [ ] **Step 5: Read PDF pages 40–52 and create `landing-gear-systems.js`**

- [ ] **Step 6: Write data validation test for all files**

```js
// tests/data/airframe-questions.test.js
import { describe, it, expect } from 'vitest';

// Import all airframe question files
const topicFiles = {
  'AF-01': () => import('../../src/data/airframe/metallic-structures.js'),
  'AF-02': () => import('../../src/data/airframe/non-metallic-structures.js'),
  'AF-03': () => import('../../src/data/airframe/flight-controls.js'),
  'AF-04': () => import('../../src/data/airframe/airframe-inspection.js'),
  'AF-05': () => import('../../src/data/airframe/landing-gear-systems.js'),
};

const topicPrefixes = {
  'AF-01': 'AF01',
  'AF-02': 'AF02',
  'AF-03': 'AF03',
  'AF-04': 'AF04',
  'AF-05': 'AF05',
};

describe('Airframe question data (AF-01 to AF-05)', () => {
  for (const [topicId, loader] of Object.entries(topicFiles)) {
    describe(topicId, () => {
      let questions;

      beforeAll(async () => {
        const mod = await loader();
        questions = mod.questions;
      });

      it('exports a non-empty questions array', () => {
        expect(Array.isArray(questions)).toBe(true);
        expect(questions.length).toBeGreaterThan(0);
      });

      it('every question has required fields', () => {
        for (const q of questions) {
          expect(q.id).toMatch(new RegExp(`^${topicPrefixes[topicId]}-`));
          expect(typeof q.q).toBe('string');
          expect(q.q.length).toBeGreaterThan(0);
          expect(Array.isArray(q.a)).toBe(true);
          expect(q.a).toHaveLength(3);
          expect(typeof q.c).toBe('number');
          expect(q.c).toBeGreaterThanOrEqual(0);
          expect(q.c).toBeLessThanOrEqual(2);
          expect(typeof q.exp).toBe('string');
          expect(q.exp.length).toBeGreaterThan(0);
          expect(typeof q.ref).toBe('string');
        }
      });

      it('has no duplicate IDs', () => {
        const ids = questions.map((q) => q.id);
        expect(new Set(ids).size).toBe(ids.length);
      });
    });
  }
});
```

- [ ] **Step 7: Run tests**

Run: `npx vitest run tests/data/airframe-questions.test.js`
Expected: All tests PASS

- [ ] **Step 8: Commit**

```bash
git add src/data/airframe/metallic-structures.js src/data/airframe/non-metallic-structures.js src/data/airframe/flight-controls.js src/data/airframe/airframe-inspection.js src/data/airframe/landing-gear-systems.js tests/data/airframe-questions.test.js
git commit -m "feat: extract ASA questions for AF-01 through AF-05"
```

---

### Task 4: Extract ASA Questions — AF-06 through AF-10

**Files:**
- Replace: `src/data/airframe/hydraulic-pneumatic-systems.js`
- Create: `src/data/airframe/environmental-systems.js`
- Create: `src/data/airframe/aircraft-instrument-systems.js`
- Create: `src/data/airframe/communication-navigation-systems.js`
- Create: `src/data/airframe/aircraft-fuel-systems.js`
- Modify: `tests/data/airframe-questions.test.js`

Same extraction process as Task 3.

**Source pages in the PDF:**
- AF-06 Hydraulic & Pneumatic Systems: pages 53–67 (replaces existing custom questions)
- AF-07 Environmental Systems: pages 68–79
- AF-08 Aircraft Instrument Systems: pages 80–88
- AF-09 Communication & Navigation Systems: pages 89–96
- AF-10 Aircraft Fuel Systems: pages 97–110

- [ ] **Step 1: Read PDF pages 53–67 and replace `hydraulic-pneumatic-systems.js`**

Replace the entire file contents with ASA-sourced questions using the standard format. Old custom questions are discarded.

- [ ] **Step 2: Read PDF pages 68–79 and create `environmental-systems.js`**

- [ ] **Step 3: Read PDF pages 80–88 and create `aircraft-instrument-systems.js`**

- [ ] **Step 4: Read PDF pages 89–96 and create `communication-navigation-systems.js`**

- [ ] **Step 5: Read PDF pages 97–110 and create `aircraft-fuel-systems.js`**

- [ ] **Step 6: Add topics AF-06 through AF-10 to the test file**

Add these entries to the `topicFiles` and `topicPrefixes` objects in `tests/data/airframe-questions.test.js`:

```js
// Add to topicFiles:
'AF-06': () => import('../../src/data/airframe/hydraulic-pneumatic-systems.js'),
'AF-07': () => import('../../src/data/airframe/environmental-systems.js'),
'AF-08': () => import('../../src/data/airframe/aircraft-instrument-systems.js'),
'AF-09': () => import('../../src/data/airframe/communication-navigation-systems.js'),
'AF-10': () => import('../../src/data/airframe/aircraft-fuel-systems.js'),

// Add to topicPrefixes:
'AF-06': 'AF06',
'AF-07': 'AF07',
'AF-08': 'AF08',
'AF-09': 'AF09',
'AF-10': 'AF10',
```

Also update the describe block name to say `(AF-01 to AF-10)`.

- [ ] **Step 7: Run tests**

Run: `npx vitest run tests/data/airframe-questions.test.js`
Expected: All tests PASS

- [ ] **Step 8: Update the old AF-06 test**

Replace `tests/data/af06.test.js` to expect the new ASA-sourced question count instead of 145:

```js
import { describe, it, expect } from 'vitest';
import { questions } from '../../src/data/airframe/hydraulic-pneumatic-systems.js';

describe('AF-06 questions (ASA-sourced)', () => {
  it('has questions', () => {
    expect(questions.length).toBeGreaterThan(0);
  });

  it('every question has required fields', () => {
    for (const q of questions) {
      expect(q.id).toMatch(/^AF06-/);
      expect(typeof q.q).toBe('string');
      expect(Array.isArray(q.a)).toBe(true);
      expect(q.a).toHaveLength(3);
      expect(typeof q.c).toBe('number');
      expect(q.c).toBeLessThanOrEqual(2);
      expect(typeof q.exp).toBe('string');
    }
  });

  it('has no duplicate IDs', () => {
    const ids = questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
```

- [ ] **Step 9: Commit**

```bash
git add src/data/airframe/hydraulic-pneumatic-systems.js src/data/airframe/environmental-systems.js src/data/airframe/aircraft-instrument-systems.js src/data/airframe/communication-navigation-systems.js src/data/airframe/aircraft-fuel-systems.js tests/data/airframe-questions.test.js tests/data/af06.test.js
git commit -m "feat: extract ASA questions for AF-06 through AF-10"
```

---

### Task 5: Extract ASA Questions — AF-11 through AF-15

**Files:**
- Create: `src/data/airframe/aircraft-electrical-systems.js`
- Create: `src/data/airframe/ice-rain-control-systems.js`
- Create: `src/data/airframe/airframe-fire-protection.js`
- Create: `src/data/airframe/rotorcraft-fundamentals.js`
- Create: `src/data/airframe/water-waste-systems.js`
- Modify: `tests/data/airframe-questions.test.js`

**Source pages in the PDF:**
- AF-11 Aircraft Electrical Systems: pages 111–127
- AF-12 Ice & Rain Control Systems: pages 128–131
- AF-13 Airframe Fire Protection: pages 132–135
- AF-14 Rotorcraft Fundamentals: pages 136–137
- AF-15 Water & Waste Systems: page 138

- [ ] **Step 1: Read PDF pages 111–127 and create `aircraft-electrical-systems.js`**

- [ ] **Step 2: Read PDF pages 128–131 and create `ice-rain-control-systems.js`**

- [ ] **Step 3: Read PDF pages 132–135 and create `airframe-fire-protection.js`**

- [ ] **Step 4: Read PDF pages 136–137 and create `rotorcraft-fundamentals.js`**

- [ ] **Step 5: Read PDF page 138 and create `water-waste-systems.js`**

- [ ] **Step 6: Add topics AF-11 through AF-15 to the test file**

Add these entries to `tests/data/airframe-questions.test.js`:

```js
// Add to topicFiles:
'AF-11': () => import('../../src/data/airframe/aircraft-electrical-systems.js'),
'AF-12': () => import('../../src/data/airframe/ice-rain-control-systems.js'),
'AF-13': () => import('../../src/data/airframe/airframe-fire-protection.js'),
'AF-14': () => import('../../src/data/airframe/rotorcraft-fundamentals.js'),
'AF-15': () => import('../../src/data/airframe/water-waste-systems.js'),

// Add to topicPrefixes:
'AF-11': 'AF11',
'AF-12': 'AF12',
'AF-13': 'AF13',
'AF-14': 'AF14',
'AF-15': 'AF15',
```

Update describe block to `(AF-01 to AF-15)`.

- [ ] **Step 7: Add cross-topic duplicate ID test**

Append this test to `tests/data/airframe-questions.test.js`:

```js
describe('Cross-topic validation', () => {
  it('has no duplicate question IDs across all topics', async () => {
    const allIds = [];
    for (const loader of Object.values(topicFiles)) {
      const mod = await loader();
      allIds.push(...mod.questions.map((q) => q.id));
    }
    expect(new Set(allIds).size).toBe(allIds.length);
  });
});
```

- [ ] **Step 8: Run all tests**

Run: `npx vitest run tests/data/`
Expected: All tests PASS

- [ ] **Step 9: Commit**

```bash
git add src/data/airframe/aircraft-electrical-systems.js src/data/airframe/ice-rain-control-systems.js src/data/airframe/airframe-fire-protection.js src/data/airframe/rotorcraft-fundamentals.js src/data/airframe/water-waste-systems.js tests/data/airframe-questions.test.js
git commit -m "feat: extract ASA questions for AF-11 through AF-15"
```

---

### Task 6: Register All Question Files in Loader

**Files:**
- Modify: `src/data/index.js`

- [ ] **Step 1: Update question loaders to register all 15 airframe topics**

Replace the `questionLoaders` object in `src/data/index.js`:

```js
const questionLoaders = {
  'AF-01': () => import('./airframe/metallic-structures.js'),
  'AF-02': () => import('./airframe/non-metallic-structures.js'),
  'AF-03': () => import('./airframe/flight-controls.js'),
  'AF-04': () => import('./airframe/airframe-inspection.js'),
  'AF-05': () => import('./airframe/landing-gear-systems.js'),
  'AF-06': () => import('./airframe/hydraulic-pneumatic-systems.js'),
  'AF-07': () => import('./airframe/environmental-systems.js'),
  'AF-08': () => import('./airframe/aircraft-instrument-systems.js'),
  'AF-09': () => import('./airframe/communication-navigation-systems.js'),
  'AF-10': () => import('./airframe/aircraft-fuel-systems.js'),
  'AF-11': () => import('./airframe/aircraft-electrical-systems.js'),
  'AF-12': () => import('./airframe/ice-rain-control-systems.js'),
  'AF-13': () => import('./airframe/airframe-fire-protection.js'),
  'AF-14': () => import('./airframe/rotorcraft-fundamentals.js'),
  'AF-15': () => import('./airframe/water-waste-systems.js'),
};
```

- [ ] **Step 2: Run all tests to verify nothing is broken**

Run: `npx vitest run`
Expected: All tests PASS

- [ ] **Step 3: Commit**

```bash
git add src/data/index.js
git commit -m "feat: register all 15 airframe question files in loader"
```

---

### Task 7: Extend HistoryContext for Exam Metadata

**Files:**
- Modify: `src/HistoryContext.jsx`

The existing `saveAttempt` function needs to accept additional fields: `version`, `seed`, and `topicBreakdown`. The stored attempt shape expands but remains backward-compatible (old attempts just lack the new fields).

- [ ] **Step 1: Update `saveAttempt` to accept extended metadata**

In `src/HistoryContext.jsx`, replace the `saveAttempt` callback:

```js
const saveAttempt = useCallback(
  ({ topicId, mode, version, seed, questions: qs, answers, startTime, endTime }) => {
    const score = qs.reduce(
      (acc, q) => acc + (answers[q.id] === q.c ? 1 : 0),
      0
    );
    const missed = qs
      .filter((q) => answers[q.id] !== q.c)
      .map((q) => q.id);

    // Compute per-subtopic breakdown from question ID prefix (AF01 -> AF-01)
    const topicBreakdown = {};
    for (const q of qs) {
      const prefix = q.id.split('-')[0];
      const topicKey = prefix.replace(/([A-Z]+)(\d+)/, '$1-$2');
      if (!topicBreakdown[topicKey]) topicBreakdown[topicKey] = { correct: 0, total: 0 };
      topicBreakdown[topicKey].total++;
      if (answers[q.id] === q.c) topicBreakdown[topicKey].correct++;
    }

    const attempt = {
      id: crypto.randomUUID(),
      topicId,
      mode,
      version: version ?? null,
      seed: seed ?? null,
      score,
      total: qs.length,
      time: Math.round((endTime - startTime) / 1000),
      missed,
      topicBreakdown,
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
```

- [ ] **Step 2: Run existing tests**

Run: `npx vitest run`
Expected: All tests PASS (the new fields are optional — `version` and `seed` default to null)

- [ ] **Step 3: Commit**

```bash
git add src/HistoryContext.jsx
git commit -m "feat: extend saveAttempt with version, seed, and topicBreakdown"
```

---

### Task 8: ExamSelectionScreen Component

**Files:**
- Create: `src/components/ExamSelectionScreen.jsx`
- Create: `src/components/ExamSelectionScreen.css`

- [ ] **Step 1: Create ExamSelectionScreen component**

```jsx
// src/components/ExamSelectionScreen.jsx
import { useMemo } from 'react';
import { useHistory } from '../HistoryContext.jsx';
import { useState } from 'react';
import { TOPICS, CATEGORIES } from '../data/index.js';
import './ExamSelectionScreen.css';

export default function ExamSelectionScreen({ topicId, onSelectExam, onBack }) {
  const [activeTab, setActiveTab] = useState('study');
  const { attempts } = useHistory();

  // topicId is null for full-category, or 'AF-01' etc for per-subtopic
  const isFullCategory = !topicId || topicId === 'airframe';
  const title = isFullCategory ? 'Airframe Knowledge Exam' : TOPICS[topicId]?.name;
  const totalQuestions = isFullCategory ? 100 : null; // null = use all from pool

  const bestScores = useMemo(() => {
    const scores = {};
    const filterTopicId = isFullCategory ? 'airframe' : topicId;
    for (const a of attempts) {
      if (a.topicId !== filterTopicId) continue;
      if (a.mode !== activeTab) continue;
      if (a.version == null) continue;
      const pct = Math.round((a.score / a.total) * 100);
      if (!scores[a.version] || pct > scores[a.version]) {
        scores[a.version] = pct;
      }
    }
    return scores;
  }, [attempts, activeTab, topicId, isFullCategory]);

  const handleSelect = (version) => {
    const seed = version === 'random' ? Date.now() : version;
    onSelectExam({
      mode: activeTab,
      version,
      seed,
      topicId: isFullCategory ? 'airframe' : topicId,
      isFullCategory,
    });
  };

  return (
    <div className="exam-select">
      <div className="exam-select__header">
        <button className="exam-select__back" onClick={onBack}>&larr;</button>
        <h1 className="exam-select__title">{title}</h1>
      </div>

      <div className="exam-select__tabs">
        <button
          className={`exam-select__tab ${activeTab === 'study' ? 'exam-select__tab--active' : ''}`}
          onClick={() => setActiveTab('study')}
        >
          Study
        </button>
        <button
          className={`exam-select__tab ${activeTab === 'test' ? 'exam-select__tab--active' : ''}`}
          onClick={() => setActiveTab('test')}
        >
          Test
        </button>
      </div>

      <p className="exam-select__subtitle">
        Select a version — each draws {isFullCategory ? '100' : 'all'} questions
        {isFullCategory ? ' weighted by ACS topics' : ''}
      </p>

      <div className="exam-select__grid">
        {[1, 2, 3, 4, 5].map((v) => (
          <button key={v} className="exam-select__card" onClick={() => handleSelect(v)}>
            <span className="exam-select__card-num">{v}</span>
            <span className="exam-select__card-label">Exam {v}</span>
            <span className={`exam-select__card-score ${bestScores[v] ? 'exam-select__card-score--taken' : ''}`}>
              {bestScores[v] ? `Best: ${bestScores[v]}%` : 'Not taken'}
            </span>
          </button>
        ))}
        <button className="exam-select__card exam-select__card--random" onClick={() => handleSelect('random')}>
          <span className="exam-select__card-icon">&infin;</span>
          <span className="exam-select__card-label exam-select__card-label--accent">Random</span>
          <span className="exam-select__card-score">Unique exam</span>
        </button>
      </div>

      <div className="exam-select__info">
        <span>{isFullCategory ? '100 questions' : 'All questions'}</span>
        <span>{isFullCategory ? '2 hr time limit' : 'No time limit'}</span>
        <span>70% to pass</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create ExamSelectionScreen CSS**

Create `src/components/ExamSelectionScreen.css` with styles matching the PHNX design language:
- `.exam-select` container with padding
- `.exam-select__tabs` — two horizontally equal tabs with bottom border indicator on active
- `.exam-select__tab--active` — accent color bottom border
- `.exam-select__grid` — 3-column grid, responsive
- `.exam-select__card` — rounded corners, neutral background, centered content
- `.exam-select__card--random` — dashed border, accent color tint
- `.exam-select__card-score--taken` — accent color text
- `.exam-select__info` — flex row, subtle text, border top
- All colors use CSS variables from `theme.css`
- Minimum 44px touch targets

- [ ] **Step 3: Verify it renders**

Temporarily import in App.jsx and render it to visually check. Then remove the temporary import.

- [ ] **Step 4: Commit**

```bash
git add src/components/ExamSelectionScreen.jsx src/components/ExamSelectionScreen.css
git commit -m "feat: add ExamSelectionScreen with Study/Test tabs and version grid"
```

---

### Task 9: Enhance ExamScreen with Inline Explanations

**Files:**
- Modify: `src/components/ExamScreen.jsx`
- Modify: `src/components/ExamScreen.css`

The existing ExamScreen already shows feedback after answering. Enhance it to:
1. Show the subtopic name and ASA question number above each question
2. Show a styled explanation panel with "EXPLANATION" header, explanation text, and FAA references
3. Color-code answers with filled letter circles (red for wrong, green for correct)

- [ ] **Step 1: Update ExamScreen JSX**

In `src/components/ExamScreen.jsx`:

Add a topic name lookup for each question by deriving it from the question ID prefix:

```jsx
// Add this helper inside the component, before the return
const getQuestionTopic = (question) => {
  const prefix = question.id.split('-')[0];
  const topicKey = prefix.replace(/([A-Z]+)(\d+)/, '$1-$2');
  return TOPICS[topicKey]?.name || '';
};
```

Replace the existing explanation block (lines 141-148) with the enhanced version:

```jsx
{showFeedback && answers[q.id] !== undefined && (
  <div className="exam-explanation-panel">
    <div className="exam-explanation-panel__header">EXPLANATION</div>
    <div className="exam-explanation-panel__text">{q.exp}</div>
    {(q.ref || q.acs) && (
      <div className="exam-explanation-panel__refs">
        <span className="exam-explanation-panel__refs-label">References:</span>
        {q.acs && <span className="exam-explanation-panel__ref">{q.acs}</span>}
        {q.ref && <span className="exam-explanation-panel__ref">{q.ref}</span>}
      </div>
    )}
  </div>
)}
```

Add subtopic label above the question text:

```jsx
<div className="exam-card-meta">
  <span className="exam-topic-label">{getQuestionTopic(q)}</span>
  <span className="exam-qid">#{q.id}</span>
</div>
```

Update the answer buttons to use letter circles:

```jsx
<button key={i} className={cls} onClick={() => selectAnswer(i)} disabled={showResult}>
  <span className="exam-answer-letter">{String.fromCharCode(65 + i)}</span>
  <span className="exam-answer-text">{opt}</span>
</button>
```

- [ ] **Step 2: Add CSS for explanation panel and letter circles**

Add to `src/components/ExamScreen.css`:

```css
.exam-explanation-panel {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-correct-bg, rgba(76, 175, 80, 0.08));
  border: 1px solid var(--color-correct-border, rgba(76, 175, 80, 0.2));
  border-radius: 10px;
}

.exam-explanation-panel__header {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-mastered);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--spacing-sm);
}

.exam-explanation-panel__text {
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.exam-explanation-panel__refs {
  margin-top: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--color-correct-border, rgba(76, 175, 80, 0.15));
}

.exam-explanation-panel__refs-label {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--color-accent);
  display: block;
  margin-bottom: 4px;
}

.exam-explanation-panel__ref {
  font-size: 0.6875rem;
  color: var(--color-text-tertiary);
  display: block;
}

.exam-answer-letter {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  font-weight: 700;
  flex-shrink: 0;
  background: var(--color-surface-elevated);
  color: var(--color-text-secondary);
}

.exam-answer--correct .exam-answer-letter {
  background: var(--color-mastered);
  color: white;
}

.exam-answer--incorrect .exam-answer-letter {
  background: var(--color-struggling);
  color: white;
}

.exam-card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.exam-topic-label {
  font-size: 0.6875rem;
  color: var(--color-text-tertiary);
}
```

- [ ] **Step 3: Run app and verify visually**

Run: `npx vite dev`
Navigate to a topic test. Answer a question and verify:
- Subtopic name and question number appear above question
- Wrong answer has red circle, correct has green circle
- Explanation panel appears with "EXPLANATION" header, text, and references

- [ ] **Step 4: Commit**

```bash
git add src/components/ExamScreen.jsx src/components/ExamScreen.css
git commit -m "feat: enhance ExamScreen with FAA reference explanation panel"
```

---

### Task 10: Enhance MockExamScreen with Submit Confirmation and Flags

**Files:**
- Modify: `src/components/MockExamScreen.jsx`
- Modify: `src/components/MockExamScreen.css`

- [ ] **Step 1: Add flag toggle and submit confirmation**

In `src/components/MockExamScreen.jsx`:

Add flagged state:

```jsx
const [flagged, setFlagged] = useState(new Set());

const toggleFlag = (qId) => {
  setFlagged((prev) => {
    const s = new Set(prev);
    s.has(qId) ? s.delete(qId) : s.add(qId);
    return s;
  });
};
```

Add submit confirmation before finishing:

```jsx
const handleFinish = () => {
  const unanswered = questions.length - Object.keys(answers).length;
  if (unanswered > 0) {
    const confirmed = window.confirm(
      `Are you sure? You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}.`
    );
    if (!confirmed) return;
  }
  finish();
};
```

Add a flag button next to each question number:

```jsx
<div className="mock-card-top">
  <span className="mock-qnum">Q {currentIndex + 1}</span>
  <button
    className={`mock-flag ${flagged.has(q.id) ? 'mock-flag--active' : ''}`}
    onClick={() => toggleFlag(q.id)}
  >
    {flagged.has(q.id) ? '\u2605' : '\u2606'}
  </button>
</div>
```

Replace the finish button's `onClick` to use `handleFinish` instead of `finish`.

- [ ] **Step 2: Add CSS for flag button**

Add to `src/components/MockExamScreen.css`:

```css
.mock-flag {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--color-text-tertiary);
  padding: 4px 8px;
}

.mock-flag--active {
  color: var(--color-accent);
}
```

- [ ] **Step 3: Run and verify**

Start a mock exam, flag a question, try to submit with unanswered questions and verify the confirmation dialog appears.

- [ ] **Step 4: Commit**

```bash
git add src/components/MockExamScreen.jsx src/components/MockExamScreen.css
git commit -m "feat: add flag support and submit confirmation to MockExamScreen"
```

---

### Task 11: ExamResultsScreen Component

**Files:**
- Create: `src/components/ExamResultsScreen.jsx`
- Create: `src/components/ExamResultsScreen.css`

- [ ] **Step 1: Create ExamResultsScreen component**

```jsx
// src/components/ExamResultsScreen.jsx
import { useState, useEffect, useRef } from 'react';
import { TOPICS } from '../data/index.js';
import { useHistory } from '../HistoryContext.jsx';
import './ExamResultsScreen.css';

export default function ExamResultsScreen({
  questions,
  answers,
  flagged,
  startTime,
  endTime,
  topicId,
  mode,
  version,
  seed,
  onRetake,
  onStudyMissed,
  onHome,
}) {
  const { saveAttempt, recordAnswer } = useHistory();
  const savedRef = useRef(false);
  const [expandedQ, setExpandedQ] = useState(null);
  const [showAllTopics, setShowAllTopics] = useState(false);

  const score = questions.reduce((acc, q) => acc + (answers[q.id] === q.c ? 1 : 0), 0);
  const pct = Math.round((score / questions.length) * 100);
  const passed = pct >= 70;
  const elapsed = Math.floor((endTime - startTime) / 1000);
  const flaggedCount = flagged ? flagged.size : 0;

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return h > 0 ? `${h}h ${m}m` : `${m}m ${sec}s`;
  };

  // Compute per-topic breakdown
  const topicBreakdown = {};
  for (const q of questions) {
    const prefix = q.id.split('-')[0];
    const topicKey = prefix.replace(/([A-Z]+)(\d+)/, '$1-$2');
    if (!topicBreakdown[topicKey]) topicBreakdown[topicKey] = { correct: 0, total: 0 };
    topicBreakdown[topicKey].total++;
    if (answers[q.id] === q.c) topicBreakdown[topicKey].correct++;
  }

  const topicEntries = Object.entries(topicBreakdown)
    .sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total));

  const visibleTopics = showAllTopics ? topicEntries : topicEntries.slice(0, 5);
  const hiddenCount = topicEntries.length - 5;

  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    saveAttempt({
      topicId: topicId === 'airframe' ? 'airframe' : topicId,
      mode,
      version,
      seed,
      questions,
      answers,
      startTime,
      endTime,
    });
    if (mode === 'test') {
      questions.forEach((q) => {
        recordAnswer(q.id, answers[q.id] === q.c);
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const missed = questions.filter((q) => answers[q.id] !== q.c);
  const versionLabel = version === 'random' ? 'Random' : `Version ${version}`;
  const modeLabel = mode === 'study' ? 'Study' : 'Test';

  const getBarColor = (correct, total) => {
    const p = (correct / total) * 100;
    if (p >= 80) return 'var(--color-mastered)';
    if (p >= 60) return 'var(--color-accent)';
    return 'var(--color-struggling)';
  };

  return (
    <div className="exam-results">
      <div className="exam-results__meta">{versionLabel} &middot; {modeLabel}</div>

      <div className={`exam-results__ring ${passed ? 'exam-results__ring--pass' : 'exam-results__ring--fail'}`}>
        <span className="exam-results__pct">{pct}%</span>
        <span className="exam-results__verdict">{passed ? 'PASS' : 'FAIL'}</span>
      </div>

      <div className="exam-results__detail">
        {score} of {questions.length} correct &middot; {formatTime(elapsed)}
      </div>

      <div className="exam-results__stats">
        <div className="exam-results__stat exam-results__stat--correct">
          <span className="exam-results__stat-num">{score}</span>
          <span className="exam-results__stat-label">Correct</span>
        </div>
        <div className="exam-results__stat exam-results__stat--wrong">
          <span className="exam-results__stat-num">{questions.length - score}</span>
          <span className="exam-results__stat-label">Wrong</span>
        </div>
        <div className="exam-results__stat exam-results__stat--flagged">
          <span className="exam-results__stat-num">{flaggedCount}</span>
          <span className="exam-results__stat-label">Flagged</span>
        </div>
      </div>

      {topicEntries.length > 1 && (
        <div className="exam-results__breakdown">
          <h3 className="exam-results__section-title">Performance by Topic</h3>
          {visibleTopics.map(([tid, { correct, total }]) => (
            <div key={tid} className="exam-results__topic-row">
              <div className="exam-results__topic-info">
                <span className="exam-results__topic-name">{TOPICS[tid]?.name || tid}</span>
                <span className="exam-results__topic-score" style={{ color: getBarColor(correct, total) }}>
                  {correct}/{total}
                </span>
              </div>
              <div className="exam-results__topic-bar">
                <div
                  className="exam-results__topic-fill"
                  style={{ width: `${(correct / total) * 100}%`, background: getBarColor(correct, total) }}
                />
              </div>
            </div>
          ))}
          {hiddenCount > 0 && !showAllTopics && (
            <button className="exam-results__show-more" onClick={() => setShowAllTopics(true)}>
              + {hiddenCount} more topics
            </button>
          )}
        </div>
      )}

      <div className="exam-results__actions">
        {missed.length > 0 && (
          <button className="exam-results__action exam-results__action--primary" onClick={() => onStudyMissed(missed)}>
            Study Missed as Flashcards
          </button>
        )}
        <button className="exam-results__action exam-results__action--secondary" onClick={onRetake}>
          Retake Exam
        </button>
      </div>

      <div className="exam-results__review">
        <h3 className="exam-results__section-title">Question Review</h3>
        <p className="exam-results__review-hint">Tap to expand explanation</p>
        {questions.map((q, i) => {
          const isCorrect = answers[q.id] === q.c;
          const isExpanded = expandedQ === i;
          return (
            <div key={q.id} className="exam-results__q-row" onClick={() => setExpandedQ(isExpanded ? null : i)}>
              <div className="exam-results__q-summary">
                <span className={`exam-results__q-icon ${isCorrect ? 'exam-results__q-icon--correct' : 'exam-results__q-icon--wrong'}`}>
                  {isCorrect ? '\u2713' : '\u2717'}
                </span>
                <span className={`exam-results__q-text ${!isCorrect ? 'exam-results__q-text--wrong' : ''}`}>
                  {q.q.length > 80 ? q.q.slice(0, 80) + '...' : q.q}
                </span>
                <span className="exam-results__q-num">Q{i + 1}</span>
              </div>
              {isExpanded && (
                <div className="exam-results__q-detail">
                  <div className={isCorrect ? 'exam-results__q-yours--correct' : 'exam-results__q-yours--wrong'}>
                    Your answer: {String.fromCharCode(65 + answers[q.id])} &mdash; {q.a[answers[q.id]] ?? 'Skipped'}
                  </div>
                  {!isCorrect && (
                    <div className="exam-results__q-correct">
                      Correct: {String.fromCharCode(65 + q.c)} &mdash; {q.a[q.c]}
                    </div>
                  )}
                  <div className="exam-results__q-exp">{q.exp}</div>
                  {q.ref && <div className="exam-results__q-ref">Ref: {q.acs ? `${q.acs} — ` : ''}{q.ref}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button className="exam-results__home" onClick={onHome}>Home</button>
    </div>
  );
}
```

- [ ] **Step 2: Create ExamResultsScreen CSS**

Create `src/components/ExamResultsScreen.css` with styles for:
- `.exam-results__ring` — 120px circle with colored border (green/red)
- `.exam-results__stats` — 3-column flex row for correct/wrong/flagged
- `.exam-results__breakdown` — topic list with progress bars
- `.exam-results__q-row` — clickable rows with expand animation
- `.exam-results__q-detail` — expanded explanation with answer comparison
- `.exam-results__actions` — two buttons side by side
- Colors: green for correct, red for wrong, accent (#E8651A) for references
- Mobile-first, 375px+ width

- [ ] **Step 3: Commit**

```bash
git add src/components/ExamResultsScreen.jsx src/components/ExamResultsScreen.css
git commit -m "feat: add ExamResultsScreen with topic breakdown and question review"
```

---

### Task 12: Wire Navigation in App.jsx

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/TopicListScreen.jsx`
- Modify: `src/components/SubtopicScreen.jsx`

- [ ] **Step 1: Add imports and state for exam selection/results in App.jsx**

Add imports at the top of `src/App.jsx`:

```jsx
import ExamSelectionScreen from './components/ExamSelectionScreen.jsx'
import ExamResultsScreen from './components/ExamResultsScreen.jsx'
import { generateExam, seededShuffle } from './utils/exam-generator.js'
```

Add state for exam session metadata:

```jsx
const [examVersion, setExamVersion] = useState(null)
const [examSeed, setExamSeed] = useState(null)
const [examMode, setExamMode] = useState(null) // 'study' | 'test'
```

- [ ] **Step 2: Add navigation functions for exam selection flow**

Add these functions in App.jsx:

```jsx
const openExamSelection = (scopeTopicId) => {
  setActiveTopicId(scopeTopicId) // null or 'airframe' for full category
  setScreen('exam-select')
}

const handleExamSelect = async ({ mode, version, seed, topicId: scopeId, isFullCategory }) => {
  setExamMode(mode)
  setExamVersion(version)
  setExamSeed(seed)

  let qs
  if (isFullCategory) {
    // Load all airframe questions
    const questionsByTopic = {}
    for (const tid of CATEGORIES.airframe.topics) {
      const topicQs = await loadQuestions(tid)
      if (topicQs.length > 0) questionsByTopic[tid] = topicQs
    }
    qs = generateExam(seed, questionsByTopic, 100)
  } else {
    const topicQs = await loadQuestions(scopeId)
    qs = seededShuffle(topicQs, seed)
  }

  setExamQuestions(qs)
  setAnswers({})
  setFlagged(new Set())
  setStartTime(Date.now())
  setEndTime(null)
  setReviewIndex(null)
  setActiveTopicId(isFullCategory ? 'airframe' : scopeId)

  if (mode === 'study') {
    setMode('all')
    setScreen('test')
  } else {
    setMode('mock')
    setScreen('mock')
  }
}

const handleExamFinish = () => {
  setEndTime(Date.now())
  setScreen('exam-results')
}

const handleStudyMissedFromResults = (missedQuestions) => {
  setFcQuestions(shuffle(missedQuestions))
  setFcResults([])
  setScreen('flashcards')
}

const handleRetakeFromResults = () => {
  handleExamSelect({
    mode: examMode,
    version: examVersion,
    seed: examVersion === 'random' ? Date.now() : examSeed,
    topicId: activeTopicId,
    isFullCategory: activeTopicId === 'airframe',
  })
}
```

- [ ] **Step 3: Add screen renderers for exam-select and exam-results**

Add these screen blocks in the JSX return, alongside the existing ones:

```jsx
{tab === 'home' && screen === 'exam-select' && (
  <ExamSelectionScreen
    topicId={activeTopicId}
    onSelectExam={handleExamSelect}
    onBack={() => activeTopicId === 'airframe' ? goToTopicList() : goToSubtopic()}
  />
)}

{tab === 'home' && screen === 'exam-results' && (
  <ExamResultsScreen
    questions={examQuestions}
    answers={answers}
    flagged={flagged}
    startTime={startTime}
    endTime={endTime}
    topicId={activeTopicId}
    mode={examMode}
    version={examVersion}
    seed={examSeed}
    onRetake={handleRetakeFromResults}
    onStudyMissed={handleStudyMissedFromResults}
    onHome={activeTopicId === 'airframe' ? goToTopicList : goToSubtopic}
  />
)}
```

Update the existing ExamScreen's `onFinish` to use `handleExamFinish` and the MockExamScreen's `onFinish` to route to exam-results:

```jsx
{tab === 'home' && screen === 'mock' && (
  <MockExamScreen
    questions={examQuestions}
    topicId={activeTopicId}
    onFinish={(mockAnswers) => {
      setAnswers(mockAnswers)
      setEndTime(Date.now())
      setScreen('exam-results')
    }}
  />
)}
```

- [ ] **Step 4: Add "Airframe Exam" entry point to TopicListScreen**

In `src/components/TopicListScreen.jsx`, add an `onStartExam` prop and render a card above the subtopic list:

Add prop: `onStartExam` to the component signature.

Inside the category block, before the `cat.topics.map(...)`, add:

```jsx
{catKey === 'airframe' && (
  <button className="topic-list__exam-card" onClick={() => onStartExam('airframe')}>
    <span className="topic-list__exam-icon">&#128221;</span>
    <div>
      <span className="topic-list__exam-name">Full Airframe Exam</span>
      <span className="topic-list__exam-desc">100 questions &middot; 2 hrs &middot; All topics</span>
    </div>
    <span className="topic-list__exam-arrow">&rsaquo;</span>
  </button>
)}
```

Add CSS for `.topic-list__exam-card` in `TopicListScreen.css`:

```css
.topic-list__exam-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  width: 100%;
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  background: var(--color-accent);
  color: white;
  border: none;
  border-radius: var(--radius-md, 10px);
  cursor: pointer;
  text-align: left;
}

.topic-list__exam-icon {
  font-size: 1.5rem;
}

.topic-list__exam-name {
  display: block;
  font-weight: 700;
  font-size: 0.9375rem;
}

.topic-list__exam-desc {
  display: block;
  font-size: 0.75rem;
  opacity: 0.8;
}

.topic-list__exam-arrow {
  margin-left: auto;
  font-size: 1.5rem;
  opacity: 0.6;
}
```

- [ ] **Step 5: Wire SubtopicScreen test button to exam selection**

In `src/components/SubtopicScreen.jsx`, replace the existing test option buttons to route through exam selection. Replace the `onStartTest` and `onStartMockExam` props with a single `onOpenExamSelect` prop.

Replace the test options section:

```jsx
{hasQuestions && (
  <div className="subtopic__test-options">
    <h3 className="subtopic__section-title">TEST OPTIONS</h3>
    <button className="subtopic__option" onClick={onOpenExamSelect}>
      <div>
        <span className="subtopic__option-name">Take an Exam</span>
        <span className="subtopic__option-desc">Study or Test mode &middot; Pick a version</span>
      </div>
      <span className="subtopic__option-arrow">&rsaquo;</span>
    </button>
    {weakCount > 0 && (
      <button className="subtopic__option" onClick={() => onStartTest('weak')}>
        <div>
          <span className="subtopic__option-name">Weak Areas Only</span>
          <span className="subtopic__option-desc subtopic__option-desc--weak">{weakCount} questions below confidence</span>
        </div>
        <span className="subtopic__option-arrow">&rsaquo;</span>
      </button>
    )}
  </div>
)}
```

Update App.jsx to pass the new prop:

```jsx
<SubtopicScreen
  topicId={activeTopicId}
  onBack={goToTopicList}
  onStartStudy={() => setScreen('study')}
  onStartFlashcards={startFlashcards}
  onStartTest={startTest}
  onOpenExamSelect={() => openExamSelection(activeTopicId)}
  onViewHistory={() => setScreen('history')}
/>
```

- [ ] **Step 6: Run app and verify full flow**

Run: `npx vite dev`
Test the complete flow:
1. TopicListScreen → "Full Airframe Exam" card → ExamSelectionScreen → pick version → Study mode → answer questions → ExamResultsScreen
2. SubtopicScreen → "Take an Exam" → ExamSelectionScreen → Test mode → MockExamScreen → submit → ExamResultsScreen
3. ExamResultsScreen → "Study Missed as Flashcards" → FlashcardSession
4. ExamResultsScreen → "Retake Exam" → same version restarts

- [ ] **Step 7: Commit**

```bash
git add src/App.jsx src/components/TopicListScreen.jsx src/components/TopicListScreen.css src/components/SubtopicScreen.jsx
git commit -m "feat: wire exam selection and results into navigation flow"
```

---

### Task 13: Final Integration Test & Cleanup

**Files:**
- All existing test files

- [ ] **Step 1: Run the full test suite**

Run: `npx vitest run`
Expected: All tests PASS

- [ ] **Step 2: Fix any broken tests**

The old `af06.test.js` may need question count adjustment. The old ExamScreen/ResultsScreen tests may need prop updates. Fix as needed.

- [ ] **Step 3: Run the dev server and do a manual smoke test**

Run: `npx vite dev`

Verify:
- [ ] All 15 subtopics show question counts on TopicListScreen
- [ ] "Full Airframe Exam" card appears above Airframe subtopic list
- [ ] ExamSelectionScreen shows Study/Test tabs with 5 versions + Random
- [ ] Study mode shows inline explanations with FAA references after answering
- [ ] Test mode has no feedback, submit confirmation works
- [ ] ExamResultsScreen shows score circle, topic breakdown, expandable question review
- [ ] "Study Missed as Flashcards" creates a focused flashcard deck
- [ ] Flashcards work from subtopic screen for any topic (not just AF-06)
- [ ] Version best scores persist and show on ExamSelectionScreen after taking an exam

- [ ] **Step 4: Commit final fixes if any**

```bash
git add -A
git commit -m "fix: integration fixes for exam and flashcard system"
```

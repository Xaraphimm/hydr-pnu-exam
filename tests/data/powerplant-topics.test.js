import { describe, it, expect, beforeAll } from 'vitest';
import { getQuestionCount, hasQuestionData, loadQuestions } from '../../src/data/index.js';

// topicId -> file loader, id prefix, ACS subject letter, and the highest Kn code
// that must all be present in the bank (K1..maxK).
const topics = {
  'PP-01': { loader: () => import('../../src/data/powerplant/reciprocating-engines.js'), prefix: 'PP01', letter: 'A', maxK: 10 },
  'PP-02': { loader: () => import('../../src/data/powerplant/turbine-engines.js'), prefix: 'PP02', letter: 'B', maxK: 11 },
  'PP-03': { loader: () => import('../../src/data/powerplant/engine-inspection.js'), prefix: 'PP03', letter: 'C', maxK: 8 },
  'PP-04': { loader: () => import('../../src/data/powerplant/engine-instrument-systems.js'), prefix: 'PP04', letter: 'D', maxK: 11 },
  'PP-05': { loader: () => import('../../src/data/powerplant/engine-fire-protection.js'), prefix: 'PP05', letter: 'E', maxK: 5 },
  'PP-06': { loader: () => import('../../src/data/powerplant/engine-electrical-systems.js'), prefix: 'PP06', letter: 'F', maxK: 10 },
  'PP-07': { loader: () => import('../../src/data/powerplant/engine-lubrication-systems.js'), prefix: 'PP07', letter: 'G', maxK: 7 },
  'PP-08': { loader: () => import('../../src/data/powerplant/ignition-starting-systems.js'), prefix: 'PP08', letter: 'H', maxK: 9 },
  'PP-09': { loader: () => import('../../src/data/powerplant/engine-fuel-metering.js'), prefix: 'PP09', letter: 'I', maxK: 16 },
  'PP-10': { loader: () => import('../../src/data/powerplant/recip-induction-cooling.js'), prefix: 'PP10', letter: 'J', maxK: 10 },
  'PP-11': { loader: () => import('../../src/data/powerplant/turbine-engine-air-systems.js'), prefix: 'PP11', letter: 'K', maxK: 8 },
  'PP-12': { loader: () => import('../../src/data/powerplant/engine-exhaust-reverser.js'), prefix: 'PP12', letter: 'L', maxK: 4 },
  'PP-13': { loader: () => import('../../src/data/powerplant/propellers.js'), prefix: 'PP13', letter: 'M', maxK: 10 },
};

describe('Powerplant question data', () => {
  for (const [topicId, cfg] of Object.entries(topics)) {
    describe(topicId, () => {
      let questions;

      beforeAll(async () => {
        const mod = await cfg.loader();
        questions = mod.questions;
      });

      it('exports a non-empty questions array', () => {
        expect(Array.isArray(questions)).toBe(true);
        expect(questions.length).toBeGreaterThan(0);
        expect(hasQuestionData(topicId)).toBe(true);
        expect(getQuestionCount(topicId)).toBe(questions.length);
      });

      it('every question has valid required fields', () => {
        const idRe = new RegExp(`^${cfg.prefix}-`);
        const acsRe = new RegExp(`^AM\\.III\\.${cfg.letter}\\.K\\d+$`);
        for (const q of questions) {
          expect(q.id).toMatch(idRe);
          expect(typeof q.q).toBe('string');
          expect(q.q.length).toBeGreaterThan(0);
          expect(Array.isArray(q.a)).toBe(true);
          expect(q.a).toHaveLength(3);
          for (const opt of q.a) {
            expect(typeof opt).toBe('string');
            expect(opt.trim().length).toBeGreaterThan(0);
          }
          expect(typeof q.c).toBe('number');
          expect(Number.isInteger(q.c)).toBe(true);
          expect(q.c).toBeGreaterThanOrEqual(0);
          expect(q.c).toBeLessThanOrEqual(2);
          expect(typeof q.exp).toBe('string');
          expect(q.exp.length).toBeGreaterThan(0);
          expect(typeof q.ref).toBe('string');
          expect(q.ref.length).toBeGreaterThan(0);
          expect(q.acs).toMatch(acsRe);
          expect(q.diagram).toBeNull();
        }
      });

      it('has no duplicate IDs', () => {
        const ids = questions.map((q) => q.id);
        expect(new Set(ids).size).toBe(ids.length);
      });

      it('covers every ACS knowledge code for the subject', () => {
        const codes = new Set(questions.map((q) => q.acs));
        for (let i = 1; i <= cfg.maxK; i++) {
          expect(codes.has(`AM.III.${cfg.letter}.K${i}`)).toBe(true);
        }
      });

      it('is wired into the question loader', async () => {
        expect(hasQuestionData(topicId)).toBe(true);
        await expect(loadQuestions(topicId)).resolves.toHaveLength(getQuestionCount(topicId));
      });
    });
  }
});

describe('Powerplant cross-topic validation', () => {
  it('has no duplicate question IDs across all powerplant topics', async () => {
    const allIds = [];
    for (const cfg of Object.values(topics)) {
      const mod = await cfg.loader();
      allIds.push(...mod.questions.map((q) => q.id));
    }
    expect(new Set(allIds).size).toBe(allIds.length);
  });
});

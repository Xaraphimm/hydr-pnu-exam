import { describe, it, expect, beforeAll } from 'vitest';

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

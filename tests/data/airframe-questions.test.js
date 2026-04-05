import { describe, it, expect, beforeAll } from 'vitest';

const topicFiles = {
  'AF-01': () => import('../../src/data/airframe/metallic-structures.js'),
  'AF-02': () => import('../../src/data/airframe/non-metallic-structures.js'),
  'AF-03': () => import('../../src/data/airframe/flight-controls.js'),
  'AF-04': () => import('../../src/data/airframe/airframe-inspection.js'),
  'AF-05': () => import('../../src/data/airframe/landing-gear-systems.js'),
  'AF-11': () => import('../../src/data/airframe/aircraft-electrical-systems.js'),
  'AF-12': () => import('../../src/data/airframe/ice-rain-control-systems.js'),
  'AF-13': () => import('../../src/data/airframe/airframe-fire-protection.js'),
  'AF-14': () => import('../../src/data/airframe/rotorcraft-fundamentals.js'),
  'AF-15': () => import('../../src/data/airframe/water-waste-systems.js'),
};

const topicPrefixes = {
  'AF-01': 'AF01',
  'AF-02': 'AF02',
  'AF-03': 'AF03',
  'AF-04': 'AF04',
  'AF-05': 'AF05',
  'AF-11': 'AF11',
  'AF-12': 'AF12',
  'AF-13': 'AF13',
  'AF-14': 'AF14',
  'AF-15': 'AF15',
};

describe('Airframe question data', () => {
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

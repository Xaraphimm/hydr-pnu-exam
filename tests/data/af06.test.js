import { describe, it, expect } from 'vitest';
import { questions } from '../../src/data/airframe/hydraulic-pneumatic-systems.js';

describe('AF-06 questions', () => {
  it('has questions', () => {
    expect(questions.length).toBeGreaterThan(0);
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

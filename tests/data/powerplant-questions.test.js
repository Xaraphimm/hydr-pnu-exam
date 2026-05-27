import { describe, it, expect } from 'vitest';
import { questions } from '../../src/data/powerplant/engine-lubrication-systems.js';
import { hasQuestionData, loadQuestions } from '../../src/data/index.js';

describe('PP-07 Engine Lubrication Systems questions', () => {
  it('exports exactly 100 questions', () => {
    expect(Array.isArray(questions)).toBe(true);
    expect(questions).toHaveLength(100);
  });

  it('every question has required fields', () => {
    for (const q of questions) {
      expect(q.id).toMatch(/^PP07-/);
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
      expect(q.ref.length).toBeGreaterThan(0);
      expect(q.acs).toMatch(/^AM\.III\.G\.K[1-7]$/);
      expect(q.diagram).toBeNull();
    }
  });

  it('has no duplicate IDs', () => {
    const ids = questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('uses all Engine Lubrication Systems ACS knowledge codes', () => {
    const codes = new Set(questions.map((q) => q.acs));
    for (let i = 1; i <= 7; i++) {
      expect(codes.has(`AM.III.G.K${i}`)).toBe(true);
    }
  });

  it('is wired into the question loader', async () => {
    expect(hasQuestionData('PP-07')).toBe(true);
    await expect(loadQuestions('PP-07')).resolves.toHaveLength(100);
  });
});

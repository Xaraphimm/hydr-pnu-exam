import { describe, it, expect } from 'vitest';
import { seededRandom, seededShuffle, getAcsDistribution, generateExam } from '../../src/utils/exam-generator.js';

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

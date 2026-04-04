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

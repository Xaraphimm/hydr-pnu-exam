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
      q1: { level: 5, attempts: 10 },
      q2: { level: 4, attempts: 8 },
      q3: { level: 2, attempts: 3 },
    };
    expect(getTopicMastery(questionIds, confidence)).toBe(50);
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
    expect(getMasteryColor(0, false)).toBe('not-started');
    expect(getMasteryColor(0, true)).toBe('struggling');
    expect(getMasteryColor(30, true)).toBe('struggling');
    expect(getMasteryColor(49, true)).toBe('struggling');
    expect(getMasteryColor(50, true)).toBe('learning');
    expect(getMasteryColor(69, true)).toBe('learning');
    expect(getMasteryColor(70, true)).toBe('passing');
    expect(getMasteryColor(100, true)).toBe('passing');
  });
});

describe('getTopicCounts', () => {
  it('counts new, learning, and mastered questions', () => {
    const questionIds = ['q1', 'q2', 'q3', 'q4', 'q5'];
    const confidence = {
      q1: { level: 5, attempts: 10 },
      q2: { level: 3, attempts: 5 },
      q3: { level: 1, attempts: 2 },
    };
    expect(getTopicCounts(questionIds, confidence)).toEqual({
      mastered: 1,
      learning: 2,
      new: 2,
    });
  });
});

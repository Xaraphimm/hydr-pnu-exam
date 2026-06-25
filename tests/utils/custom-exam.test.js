import { describe, expect, it } from 'vitest';
import { buildCustomExam } from '../../src/utils/custom-exam.js';

const q = (id, acs = 'AM.II.E.K2') => ({
  id,
  acs,
  q: `${id} question`,
  a: ['A', 'B', 'C'],
  c: 0,
  exp: 'Explanation',
  ref: 'Reference',
});

describe('buildCustomExam', () => {
  const questionsByTopic = {
    'AF-05': Array.from({ length: 10 }, (_, index) => q(`AF05-${index}`)),
    'AF-06': Array.from({ length: 10 }, (_, index) => q(`AF06-${index}`, 'AM.II.F.K1')),
  };

  it('builds a deterministic shuffled exam from selected topics', () => {
    const first = buildCustomExam({ questionsByTopic, topicIds: ['AF-05', 'AF-06'], count: 8, seed: 99 });
    const second = buildCustomExam({ questionsByTopic, topicIds: ['AF-05', 'AF-06'], count: 8, seed: 99 });

    expect(first.questions).toHaveLength(8);
    expect(first.totalAvailable).toBe(20);
    expect(first.questions.map((question) => question.id)).toEqual(
      second.questions.map((question) => question.id),
    );
  });

  it('caps requested count to available questions', () => {
    const result = buildCustomExam({ questionsByTopic, topicIds: ['AF-05'], count: 50, seed: 1 });

    expect(result.questions).toHaveLength(10);
    expect(result.isCapped).toBe(true);
  });

  it('deduplicates repeated question ids across selected pools', () => {
    const result = buildCustomExam({
      questionsByTopic: {
        A: [q('shared'), q('unique-a')],
        B: [q('shared'), q('unique-b')],
      },
      topicIds: ['A', 'B'],
      count: 10,
      seed: 1,
    });

    expect(result.totalAvailable).toBe(3);
    expect(new Set(result.questions.map((question) => question.id)).size).toBe(3);
  });
});

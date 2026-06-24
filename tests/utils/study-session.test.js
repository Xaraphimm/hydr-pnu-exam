import { describe, expect, it, vi } from 'vitest';
import { buildCategoryStudyQuestions } from '../../src/utils/study-session.js';

describe('buildCategoryStudyQuestions', () => {
  it('loads every topic in order and shuffles the full study pool', async () => {
    const topicIds = ['AF-01', 'AF-15', 'AF-PRACTICE'];
    const topicQuestions = {
      'AF-01': [{ id: 'AF01-1' }, { id: 'AF01-2' }],
      'AF-15': [{ id: 'AF15-1' }],
      'AF-PRACTICE': [{ id: 'PRACTICE-1' }, { id: 'PRACTICE-2' }],
    };
    const loadQuestions = vi.fn(async (topicId) => topicQuestions[topicId]);
    const shuffleQuestions = vi.fn((questions) => [...questions].reverse());

    const result = await buildCategoryStudyQuestions({
      topicIds,
      loadQuestions,
      shuffleQuestions,
    });

    expect(loadQuestions).toHaveBeenCalledTimes(topicIds.length);
    expect(loadQuestions.mock.calls.map(([topicId]) => topicId)).toEqual(topicIds);
    expect(shuffleQuestions).toHaveBeenCalledWith([
      ...topicQuestions['AF-01'],
      ...topicQuestions['AF-15'],
      ...topicQuestions['AF-PRACTICE'],
    ]);
    expect(result.map((question) => question.id)).toEqual([
      'PRACTICE-2',
      'PRACTICE-1',
      'AF15-1',
      'AF01-2',
      'AF01-1',
    ]);
  });
});

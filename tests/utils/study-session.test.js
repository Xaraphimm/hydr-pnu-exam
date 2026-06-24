import { describe, expect, it, vi } from 'vitest';
import { buildCategoryStudyQuestions } from '../../src/utils/study-session.js';

describe('buildCategoryStudyQuestions', () => {
  it('loads every topic in order and shuffles the full study pool', async () => {
    const topicIds = ['AF-01', 'AF-15', 'AF-PRACTICE'];
    const topicQuestions = {
      'AF-01': [{ id: 'AF01-1', q: 'Shared stem' }, { id: 'AF01-2', q: 'Unique one' }],
      'AF-15': [{ id: 'AF15-1', q: 'Unique fifteen' }],
      'AF-PRACTICE': [{ id: 'PRACTICE-1', q: ' shared stem ' }, { id: 'PRACTICE-2', q: 'Unique practice' }],
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
      topicQuestions['AF-PRACTICE'][1],
    ]);
    expect(result.map((question) => question.id)).toEqual([
      'PRACTICE-2',
      'AF15-1',
      'AF01-2',
      'AF01-1',
    ]);
  });
});

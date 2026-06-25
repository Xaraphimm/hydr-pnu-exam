import { describe, expect, it } from 'vitest';
import { summarizeMissedAcsAreas, summarizeWeakAcsAreas } from '../../src/utils/acs-analysis.js';

const q = (id, acs, correct = 0) => ({
  id,
  acs,
  q: `${id} question`,
  a: ['A', 'B', 'C'],
  c: correct,
  exp: 'Explanation',
  ref: 'Reference',
});

describe('summarizeMissedAcsAreas', () => {
  it('groups missed questions by ACS subject with element details', () => {
    const questions = [
      q('AF05-1', 'AM.II.E.K2', 0),
      q('AF05-2', 'AM.II.E.K3', 1),
      q('AF06-1', 'AM.II.F.K1', 2),
    ];
    const answers = {
      'AF05-1': 1,
      'AF05-2': 2,
      'AF06-1': 2,
    };

    const groups = summarizeMissedAcsAreas(questions, answers);

    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({
      subject: 'AM.II.E',
      subjectTitle: 'Landing Gear Systems',
      areaTitle: 'Airframe',
      topicId: 'AF-05',
      missedCount: 2,
      totalCount: 2,
    });
    expect(groups[0].codes.map((entry) => entry.code)).toEqual(['AM.II.E.K2', 'AM.II.E.K3']);
  });

  it('sorts weakest sections first', () => {
    const questions = [
      q('AF05-1', 'AM.II.E.K2', 0),
      q('AF06-1', 'AM.II.F.K1', 0),
      q('AF06-2', 'AM.II.F.K2', 0),
    ];
    const answers = {
      'AF05-1': 1,
      'AF06-1': 1,
      'AF06-2': 1,
    };

    const groups = summarizeMissedAcsAreas(questions, answers);

    expect(groups.map((group) => group.subject)).toEqual(['AM.II.F', 'AM.II.E']);
  });
});

describe('summarizeWeakAcsAreas', () => {
  it('summarizes weak ACS sections from confidence history', () => {
    const questionsByTopic = {
      'AF-05': [q('AF05-1', 'AM.II.E.K2'), q('AF05-2', 'AM.II.E.K3')],
      'AF-06': [q('AF06-1', 'AM.II.F.K1')],
    };
    const confidence = {
      'AF05-1': { level: 1, attempts: 2 },
      'AF05-2': { level: 5, attempts: 3 },
      'AF06-1': { level: 2, attempts: 1 },
    };

    const groups = summarizeWeakAcsAreas(questionsByTopic, confidence);

    expect(groups.map((group) => group.subject)).toEqual(['AM.II.E', 'AM.II.F']);
    expect(groups[0]).toMatchObject({
      subjectTitle: 'Landing Gear Systems',
      weakCount: 1,
      totalCount: 2,
    });
  });
});

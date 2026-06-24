import { describe, expect, it } from 'vitest';
import {
  buildAcsTargetedExam,
  getMatchingAcsQuestions,
  parseAcsCodes,
  resolveAcsCode,
  summarizeAcsEntries,
} from '../../src/utils/acs-filter.js';

const q = (id, acs) => ({
  id,
  acs,
  q: `${id} question`,
  a: ['A', 'B', 'C'],
  c: 0,
  exp: 'Explanation',
  ref: 'Reference',
});

describe('parseAcsCodes', () => {
  it('normalizes full ACS codes and prefixes from common separators', () => {
    expect(parseAcsCodes(' am.ii.f.k1, AM.II.G ;\nam.ii.h.k2\tAM.II.F.K1 ')).toEqual([
      'AM.II.F.K1',
      'AM.II.G',
      'AM.II.H.K2',
    ]);
  });

  it('returns an empty list for input without meaningful codes', () => {
    expect(parseAcsCodes(' , ; \n\t ')).toEqual([]);
  });
});

describe('getMatchingAcsQuestions', () => {
  const questionsByTopic = {
    'AF-01': [
      q('AF01-1', 'AM.II.F.K1'),
      q('AF01-2', 'am.ii.f.k2'),
      q('AF01-3', 'AM.II.G.K1'),
      q('AF01-4', ''),
    ],
    'AF-PRACTICE': [
      q('PRACTICE-1', 'AM.II.F.K1'),
      q('AF01-1', 'AM.II.F.K1'),
      { ...q('PRACTICE-DUP', 'AM.II.F.K1'), q: 'AF01-1 question' },
      q('PRACTICE-2', 'AM.II.FA.K1'),
    ],
  };

  it('matches full ACS codes and prefixes against normalized question ACS values', () => {
    const matches = getMatchingAcsQuestions(questionsByTopic, ['am.ii.f']);

    expect(matches.map((question) => question.id)).toEqual([
      'AF01-1',
      'AF01-2',
      'PRACTICE-1',
    ]);
  });

  it('does not let empty input match every question', () => {
    expect(getMatchingAcsQuestions(questionsByTopic, [])).toEqual([]);
    expect(getMatchingAcsQuestions(questionsByTopic, ['  '])).toEqual([]);
  });

  it('de-duplicates overlap by question id across source banks', () => {
    const matches = getMatchingAcsQuestions(questionsByTopic, ['AM.II.F.K1']);

    expect(matches.map((question) => question.id)).toEqual(['AF01-1', 'PRACTICE-1']);
  });

  it('de-duplicates overlap by question stem across source banks', () => {
    const matches = getMatchingAcsQuestions(questionsByTopic, ['AM.II.F.K1']);
    const stems = matches.map((question) => question.q.toLowerCase());

    expect(stems).toEqual(['af01-1 question', 'practice-1 question']);
  });
});

describe('resolveAcsCode (re-exported)', () => {
  it('maps a real ACS code to its section', () => {
    const result = resolveAcsCode('AM.II.E.K2');
    expect(result.topicId).toBe('AF-05');
    expect(result.subjectTitle).toBe('Landing Gear Systems');
  });

  it('returns null for an unrecognized code', () => {
    expect(resolveAcsCode('AM.ZZ.Q.K9')).toBeNull();
  });
});

describe('summarizeAcsEntries', () => {
  const questionsByTopic = {
    'AF-05': [q('AF05-1', 'AM.II.E.K2'), q('AF05-2', 'AM.II.E.K2')],
  };

  it('reports recognized codes with matching question counts', () => {
    const [entry] = summarizeAcsEntries(questionsByTopic, 'am.ii.e.k2');
    expect(entry.code).toBe('AM.II.E.K2');
    expect(entry.recognized).toBe(true);
    expect(entry.matchCount).toBe(2);
    expect(entry.section.topicId).toBe('AF-05');
  });

  it('recognizes valid codes that have no questions yet', () => {
    const [entry] = summarizeAcsEntries(questionsByTopic, 'AM.I.A.K1');
    expect(entry.recognized).toBe(true);
    expect(entry.matchCount).toBe(0);
    expect(entry.section.areaTitle).toBe('General');
    expect(entry.section.topicId).toBeNull();
  });

  it('flags unrecognized codes', () => {
    const [entry] = summarizeAcsEntries(questionsByTopic, 'AM.ZZ.Q.K9');
    expect(entry.recognized).toBe(false);
    expect(entry.section).toBeNull();
    expect(entry.matchCount).toBe(0);
  });

  it('counts prefix matches across topics', () => {
    const [entry] = summarizeAcsEntries(questionsByTopic, 'AM.II.E');
    expect(entry.recognized).toBe(true);
    expect(entry.matchCount).toBe(2);
    expect(entry.section.kind).toBe('subject');
  });
});

describe('buildAcsTargetedExam', () => {
  const questionsByTopic = {
    'AF-01': Array.from({ length: 80 }, (_, index) => q(`AF01-${index}`, 'AM.II.F.K1')),
    'AF-PRACTICE': Array.from({ length: 80 }, (_, index) => q(`PRACTICE-${index}`, 'AM.II.F.K1')),
  };

  it('uses deterministic seeded ordering and caps to the requested exam size', () => {
    const first = buildAcsTargetedExam({
      questionsByTopic,
      input: 'AM.II.F.K1',
      seed: 42,
      maxQuestions: 100,
    });
    const second = buildAcsTargetedExam({
      questionsByTopic,
      input: 'AM.II.F.K1',
      seed: 42,
      maxQuestions: 100,
    });

    expect(first.questions).toHaveLength(100);
    expect(first.totalMatches).toBe(160);
    expect(first.isCapped).toBe(true);
    expect(first.questions.map((question) => question.id)).toEqual(
      second.questions.map((question) => question.id),
    );
  });

  it('uses all matches when fewer questions exist than the exam cap', () => {
    const result = buildAcsTargetedExam({
      questionsByTopic,
      input: 'AM.II.F.K1',
      seed: 7,
      maxQuestions: 200,
    });

    expect(result.questions).toHaveLength(160);
    expect(result.isCapped).toBe(false);
  });
});

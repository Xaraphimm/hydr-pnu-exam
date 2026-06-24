import { describe, it, expect, beforeAll } from 'vitest';
import {
  ACS_AREAS,
  ACS_SUBJECTS,
  ACS_ELEMENTS,
  resolveAcsCode,
} from '../../src/data/acs-codes.js';
import { loadAllQuestions } from '../../src/data/index.js';

// AF-PRACTICE is a mixed bank that intentionally draws from every airframe
// subject, so its questions are exempt from the per-topic subject check.
const MIXED_TOPICS = new Set(['AF-PRACTICE']);

describe('ACS registry', () => {
  it('covers all three areas of operation', () => {
    expect(Object.keys(ACS_AREAS).sort()).toEqual(['AM.I', 'AM.II', 'AM.III']);
    expect(ACS_AREAS['AM.II'].category).toBe('airframe');
    expect(ACS_AREAS['AM.III'].category).toBe('powerplant');
  });

  it('covers all 40 subjects with valid area links', () => {
    const subjectCodes = Object.keys(ACS_SUBJECTS);
    expect(subjectCodes).toHaveLength(40);

    for (const [code, subject] of Object.entries(ACS_SUBJECTS)) {
      expect(ACS_AREAS[subject.area]).toBeDefined();
      expect(code.startsWith(`${subject.area}.`)).toBe(true);
      expect(typeof subject.title).toBe('string');
      expect(subject.title.length).toBeGreaterThan(0);
    }
  });

  it('maps airframe and powerplant subjects to study topics in order', () => {
    expect(ACS_SUBJECTS['AM.II.A'].topicId).toBe('AF-01');
    expect(ACS_SUBJECTS['AM.II.E'].topicId).toBe('AF-05');
    expect(ACS_SUBJECTS['AM.II.O'].topicId).toBe('AF-15');
    expect(ACS_SUBJECTS['AM.III.A'].topicId).toBe('PP-01');
    expect(ACS_SUBJECTS['AM.III.G'].topicId).toBe('PP-07');
    expect(ACS_SUBJECTS['AM.III.M'].topicId).toBe('PP-13');
    expect(ACS_SUBJECTS['AM.I.A'].topicId).toBeNull();
  });

  it('contains the full element catalog with valid structure', () => {
    const codes = Object.keys(ACS_ELEMENTS);
    expect(codes.length).toBe(1184);

    for (const [code, element] of Object.entries(ACS_ELEMENTS)) {
      expect(code).toMatch(/^AM\.I{1,3}\.[A-Z]\.[KRS]\d+$/);
      expect(['K', 'R', 'S']).toContain(element.type);
      expect(ACS_SUBJECTS[element.subject]).toBeDefined();
      expect(code.startsWith(`${element.subject}.`)).toBe(true);
      expect(typeof element.text).toBe('string');
      expect(element.text.length).toBeGreaterThan(2);
    }
  });
});

describe('resolveAcsCode', () => {
  it('resolves a full element code to its section', () => {
    const result = resolveAcsCode('am.ii.e.k2');
    expect(result.kind).toBe('element');
    expect(result.subjectTitle).toBe('Landing Gear Systems');
    expect(result.areaTitle).toBe('Airframe');
    expect(result.topicId).toBe('AF-05');
    expect(result.element.text).toMatch(/landing gear/i);
  });

  it('resolves a subject prefix', () => {
    const result = resolveAcsCode('AM.III.G');
    expect(result.kind).toBe('subject');
    expect(result.subjectTitle).toBe('Engine Lubrication Systems');
    expect(result.topicId).toBe('PP-07');
  });

  it('resolves an area prefix', () => {
    const result = resolveAcsCode('AM.I');
    expect(result.kind).toBe('area');
    expect(result.areaTitle).toBe('General');
    expect(result.topicId).toBeNull();
  });

  it('returns null for unknown codes', () => {
    expect(resolveAcsCode('AM.IV.Z.K9')).toBeNull();
    expect(resolveAcsCode('not-a-code')).toBeNull();
    expect(resolveAcsCode('')).toBeNull();
  });
});

describe('Question ACS codes', () => {
  let questionsByTopic;

  beforeAll(async () => {
    questionsByTopic = await loadAllQuestions();
  });

  it('every question carries a code that exists in the registry', () => {
    for (const [topicId, questions] of Object.entries(questionsByTopic)) {
      for (const question of questions) {
        expect(
          ACS_ELEMENTS[question.acs],
          `${topicId} question ${question.id} has unknown ACS code ${question.acs}`,
        ).toBeDefined();
      }
    }
  });

  it('every question code maps to the topic that contains it', () => {
    for (const [topicId, questions] of Object.entries(questionsByTopic)) {
      if (MIXED_TOPICS.has(topicId)) continue;
      for (const question of questions) {
        const resolved = resolveAcsCode(question.acs);
        expect(
          resolved?.topicId,
          `${topicId} question ${question.id} (${question.acs}) maps to ${resolved?.topicId}`,
        ).toBe(topicId);
      }
    }
  });
});

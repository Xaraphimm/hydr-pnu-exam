import { normalizeQuestionStem, seededShuffle } from './exam-generator.js';
import { resolveAcsCode } from '../data/acs-codes.js';

const ACS_SEPARATOR_PATTERN = /[\s,;]+/;

export { resolveAcsCode };

export function normalizeAcsCode(code) {
  return String(code ?? '').trim().toUpperCase();
}

export function parseAcsCodes(input) {
  const seen = new Set();
  const codes = [];

  for (const rawCode of String(input ?? '').split(ACS_SEPARATOR_PATTERN)) {
    const code = normalizeAcsCode(rawCode);
    if (!code || seen.has(code)) continue;

    seen.add(code);
    codes.push(code);
  }

  return codes;
}

function questionMatchesCode(questionAcs, code) {
  const acs = normalizeAcsCode(questionAcs);
  if (!acs || !code) return false;

  return acs === code || acs.startsWith(`${code}.`);
}

export function getMatchingAcsQuestions(questionsByTopic, codes) {
  const parsedCodes = Array.isArray(codes) ? codes.map(normalizeAcsCode).filter(Boolean) : parseAcsCodes(codes);
  if (parsedCodes.length === 0) return [];

  const seenQuestionIds = new Set();
  const seenQuestionStems = new Set();
  const matches = [];

  for (const questions of Object.values(questionsByTopic ?? {})) {
    for (const question of questions ?? []) {
      if (!parsedCodes.some((code) => questionMatchesCode(question.acs, code))) continue;
      if (seenQuestionIds.has(question.id)) continue;
      const stem = normalizeQuestionStem(question);
      if (seenQuestionStems.has(stem)) continue;

      seenQuestionIds.add(question.id);
      seenQuestionStems.add(stem);
      matches.push(question);
    }
  }

  return matches;
}

function countMatchingQuestions(questionsByTopic, code) {
  let count = 0;
  for (const questions of Object.values(questionsByTopic ?? {})) {
    for (const question of questions ?? []) {
      if (questionMatchesCode(question.acs, code)) count += 1;
    }
  }
  return count;
}

// Builds a per-entry breakdown so the UI can show which section every entered
// code maps to, even when no question currently carries that code.
export function summarizeAcsEntries(questionsByTopic, input) {
  const codes = Array.isArray(input) ? input.map(normalizeAcsCode).filter(Boolean) : parseAcsCodes(input);

  return codes.map((code) => {
    const section = resolveAcsCode(code);
    return {
      code,
      recognized: section !== null,
      section,
      matchCount: countMatchingQuestions(questionsByTopic, code),
    };
  });
}

export function buildAcsTargetedExam({ questionsByTopic, input, seed, maxQuestions }) {
  const codes = parseAcsCodes(input);
  const matches = getMatchingAcsQuestions(questionsByTopic, codes);
  const shuffled = seededShuffle(matches, seed);
  const cappedCount = Math.min(maxQuestions, shuffled.length);

  return {
    codes,
    questions: shuffled.slice(0, cappedCount),
    totalMatches: matches.length,
    isCapped: matches.length > cappedCount,
  };
}

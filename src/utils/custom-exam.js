import { normalizeQuestionStem, seededShuffle } from './exam-generator.js';

function uniqueQuestions(questions) {
  const seenIds = new Set();
  const seenStems = new Set();
  const unique = [];

  for (const question of questions) {
    if (!question || seenIds.has(question.id)) continue;
    const stem = normalizeQuestionStem(question);
    if (seenStems.has(stem)) continue;

    seenIds.add(question.id);
    seenStems.add(stem);
    unique.push(question);
  }

  return unique;
}

export function buildCustomExam({ questionsByTopic, topicIds, count, seed }) {
  const selectedQuestions = [];
  for (const topicId of topicIds ?? []) {
    selectedQuestions.push(...(questionsByTopic?.[topicId] ?? []));
  }

  const pool = uniqueQuestions(selectedQuestions);
  const requestedCount = Math.max(0, Number(count) || 0);
  const cappedCount = Math.min(requestedCount || pool.length, pool.length);
  const shuffled = seededShuffle(pool, seed);

  return {
    questions: shuffled.slice(0, cappedCount),
    totalAvailable: pool.length,
    requestedCount,
    isCapped: requestedCount > pool.length,
  };
}

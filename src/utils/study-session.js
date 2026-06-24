import { shuffle } from './shuffle.js';
import { normalizeQuestionStem } from './exam-generator.js';

function uniqueByQuestionStem(questions) {
  const seenStems = new Set();
  const uniqueQuestions = [];

  for (const question of questions) {
    const stem = normalizeQuestionStem(question);
    if (!stem || seenStems.has(stem)) continue;

    seenStems.add(stem);
    uniqueQuestions.push(question);
  }

  return uniqueQuestions;
}

export async function buildCategoryStudyQuestions({
  topicIds,
  loadQuestions,
  shuffleQuestions = shuffle,
}) {
  const questions = [];

  for (const topicId of topicIds) {
    questions.push(...await loadQuestions(topicId));
  }

  return shuffleQuestions(uniqueByQuestionStem(questions));
}

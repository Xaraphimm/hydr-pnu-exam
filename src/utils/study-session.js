import { shuffle } from './shuffle.js';

export async function buildCategoryStudyQuestions({
  topicIds,
  loadQuestions,
  shuffleQuestions = shuffle,
}) {
  const questions = [];

  for (const topicId of topicIds) {
    questions.push(...await loadQuestions(topicId));
  }

  return shuffleQuestions(questions);
}

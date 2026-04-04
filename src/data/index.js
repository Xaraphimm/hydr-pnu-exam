export { TOPICS, CATEGORIES } from './topics.js';

const questionLoaders = {
  'AF-06': () => import('./airframe/hydraulic-pneumatic-systems.js'),
};

const questionCache = {};

export async function loadQuestions(topicId) {
  if (questionCache[topicId]) return questionCache[topicId];
  const loader = questionLoaders[topicId];
  if (!loader) return [];
  const mod = await loader();
  questionCache[topicId] = mod.questions;
  return mod.questions;
}

export async function loadAllQuestions() {
  const results = {};
  for (const topicId of Object.keys(questionLoaders)) {
    results[topicId] = await loadQuestions(topicId);
  }
  return results;
}

export function getCachedQuestionIds(topicId) {
  const qs = questionCache[topicId];
  return qs ? qs.map((q) => q.id) : [];
}

export function hasQuestionData(topicId) {
  return topicId in questionLoaders;
}

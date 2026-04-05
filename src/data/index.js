export { TOPICS, CATEGORIES } from './topics.js';

const questionLoaders = {
  'AF-01': () => import('./airframe/metallic-structures.js'),
  'AF-02': () => import('./airframe/non-metallic-structures.js'),
  'AF-03': () => import('./airframe/flight-controls.js'),
  'AF-04': () => import('./airframe/airframe-inspection.js'),
  'AF-05': () => import('./airframe/landing-gear-systems.js'),
  'AF-06': () => import('./airframe/hydraulic-pneumatic-systems.js'),
  'AF-07': () => import('./airframe/environmental-systems.js'),
  'AF-08': () => import('./airframe/aircraft-instrument-systems.js'),
  'AF-09': () => import('./airframe/communication-navigation-systems.js'),
  'AF-10': () => import('./airframe/aircraft-fuel-systems.js'),
  'AF-11': () => import('./airframe/aircraft-electrical-systems.js'),
  'AF-12': () => import('./airframe/ice-rain-control-systems.js'),
  'AF-13': () => import('./airframe/airframe-fire-protection.js'),
  'AF-14': () => import('./airframe/rotorcraft-fundamentals.js'),
  'AF-15': () => import('./airframe/water-waste-systems.js'),
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

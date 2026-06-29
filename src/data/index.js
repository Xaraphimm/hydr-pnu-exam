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
  'AF-PRACTICE': () => import('./airframe/airframe-faa-practice-test.js'),
  'PP-01': () => import('./powerplant/reciprocating-engines.js'),
  'PP-02': () => import('./powerplant/turbine-engines.js'),
  'PP-03': () => import('./powerplant/engine-inspection.js'),
  'PP-04': () => import('./powerplant/engine-instrument-systems.js'),
  'PP-05': () => import('./powerplant/engine-fire-protection.js'),
  'PP-06': () => import('./powerplant/engine-electrical-systems.js'),
  'PP-07': () => import('./powerplant/engine-lubrication-systems.js'),
  'PP-08': () => import('./powerplant/ignition-starting-systems.js'),
  'PP-09': () => import('./powerplant/engine-fuel-metering.js'),
  'PP-10': () => import('./powerplant/recip-induction-cooling.js'),
  'PP-11': () => import('./powerplant/turbine-engine-air-systems.js'),
  'PP-12': () => import('./powerplant/engine-exhaust-reverser.js'),
  'PP-13': () => import('./powerplant/propellers.js'),
};

export const QUESTION_COUNTS = {
  'AF-01': 130,
  'AF-02': 96,
  'AF-03': 61,
  'AF-04': 13,
  'AF-05': 97,
  'AF-06': 121,
  'AF-07': 88,
  'AF-08': 67,
  'AF-09': 69,
  'AF-10': 110,
  'AF-11': 134,
  'AF-12': 28,
  'AF-13': 32,
  'AF-14': 16,
  'AF-15': 2,
  'AF-PRACTICE': 1000,
  'PP-01': 100,
  'PP-02': 100,
  'PP-03': 100,
  'PP-04': 100,
  'PP-05': 100,
  'PP-06': 100,
  'PP-07': 100,
  'PP-08': 100,
  'PP-09': 100,
  'PP-10': 100,
  'PP-11': 100,
  'PP-12': 100,
  'PP-13': 100,
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

export function getQuestionCount(topicId) {
  return QUESTION_COUNTS[topicId] ?? 0;
}

export function hasQuestionData(topicId) {
  return topicId in questionLoaders;
}

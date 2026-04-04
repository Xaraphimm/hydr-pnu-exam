/**
 * Mulberry32 — a fast, deterministic 32-bit PRNG.
 * Returns a function that produces values in [0, 1).
 */
export function seededRandom(seed) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fisher-Yates shuffle using a seeded PRNG.
 * Returns a new array; does not mutate the original.
 */
export function seededShuffle(arr, seed) {
  const rng = typeof seed === 'function' ? seed : seededRandom(seed);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Calculate ACS-weighted question distribution.
 * @param {Object} questionsByTopic - { topicId: questionArray[] }
 * @param {number} totalQuestions - target exam size (e.g. 100)
 * @returns {Object} { topicId: questionCount }
 */
export function getAcsDistribution(questionsByTopic, totalQuestions) {
  const topicIds = Object.keys(questionsByTopic);

  // Count distinct ACS codes per topic
  const acsCounts = {};
  for (const topicId of topicIds) {
    const codes = new Set(questionsByTopic[topicId].map((q) => q.acs).filter(Boolean));
    acsCounts[topicId] = Math.max(codes.size, 1); // at least 1
  }

  const totalAcs = Object.values(acsCounts).reduce((a, b) => a + b, 0);

  // Proportional allocation with minimum 1 per topic
  const dist = {};
  let allocated = 0;

  for (const topicId of topicIds) {
    const raw = (acsCounts[topicId] / totalAcs) * totalQuestions;
    dist[topicId] = Math.max(1, Math.round(raw));
    allocated += dist[topicId];
  }

  // Adjust to hit exact total — add/remove from largest topics
  const sorted = [...topicIds].sort((a, b) => acsCounts[b] - acsCounts[a]);
  let diff = totalQuestions - allocated;
  let idx = 0;
  while (diff !== 0) {
    const tid = sorted[idx % sorted.length];
    if (diff > 0) {
      dist[tid]++;
      diff--;
    } else if (diff < 0 && dist[tid] > 1) {
      dist[tid]--;
      diff++;
    }
    idx++;
    if (idx > sorted.length * totalQuestions) break; // safety
  }

  return dist;
}

/**
 * Generate a deterministic exam from question pools.
 * @param {number} seed - PRNG seed (1-5 for versions, Date.now() for random)
 * @param {Object} questionsByTopic - { topicId: questionArray[] }
 * @param {number} totalQuestions - target exam size
 * @returns {Array} array of question objects
 */
export function generateExam(seed, questionsByTopic, totalQuestions) {
  const rng = seededRandom(seed);
  const dist = getAcsDistribution(questionsByTopic, totalQuestions);
  const selected = [];

  for (const [topicId, count] of Object.entries(dist)) {
    const pool = questionsByTopic[topicId];
    const shuffled = seededShuffle(pool, rng);
    selected.push(...shuffled.slice(0, count));
  }

  // Final shuffle so topics are interleaved
  return seededShuffle(selected, rng);
}

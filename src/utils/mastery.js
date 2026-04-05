export function updateConfidence(current, correct) {
  const base = current || { level: 1, attempts: 0 };
  const newLevel = correct
    ? Math.min(base.level + 1, 5)
    : Math.max(base.level - 1, 1);

  return {
    level: newLevel,
    attempts: base.attempts + 1,
    lastSeen: new Date().toISOString().slice(0, 10),
  };
}

export function getQuestionState(conf) {
  if (!conf || conf.attempts === 0) return 'new';
  if (conf.level >= 4) return 'mastered';
  return 'learning';
}

export function getTopicMastery(questionIds, confidence) {
  if (questionIds.length === 0) return 0;
  const mastered = questionIds.filter(
    (id) => confidence[id] && confidence[id].level >= 4
  ).length;
  return Math.round((mastered / questionIds.length) * 100);
}

export function getMasteryColor(pct, hasAttempts) {
  if (!hasAttempts && pct === 0) return 'not-started';
  if (pct >= 70) return 'passing';
  if (pct >= 50) return 'learning';
  return 'struggling';
}

export function getTopicCounts(questionIds, confidence) {
  const counts = { mastered: 0, learning: 0, new: 0 };
  for (const id of questionIds) {
    const state = getQuestionState(confidence[id]);
    counts[state]++;
  }
  return counts;
}

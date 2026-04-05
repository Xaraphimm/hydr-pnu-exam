export function migrateLocalStorage() {
  const oldStatsKey = 'hydr-pnu-qstats';
  const oldAttemptsKey = 'hydr-pnu-attempts';
  const newConfidenceKey = 'phnx-confidence';
  const newAttemptsKey = 'phnx-attempts';

  if (localStorage.getItem(newConfidenceKey) || localStorage.getItem(newAttemptsKey)) {
    return;
  }

  const oldStats = safeParseJSON(localStorage.getItem(oldStatsKey), null);
  if (oldStats) {
    const confidence = {};
    for (const [oldId, stats] of Object.entries(oldStats)) {
      if (stats.timesAnswered === 0) continue;
      const newId = `AF06-${oldId}`;
      const accuracy = stats.timesCorrect / stats.timesAnswered;
      let level;
      if (accuracy >= 0.8) level = 4;
      else if (accuracy >= 0.6) level = 3;
      else if (accuracy >= 0.4) level = 2;
      else level = 1;
      confidence[newId] = {
        level,
        attempts: stats.timesAnswered,
        lastSeen: new Date().toISOString().slice(0, 10),
      };
    }
    localStorage.setItem(newConfidenceKey, JSON.stringify(confidence));
  }

  const oldAttempts = safeParseJSON(localStorage.getItem(oldAttemptsKey), null);
  if (oldAttempts) {
    const newAttempts = oldAttempts.map((a) => ({
      id: a.id,
      topicId: 'AF-06',
      mode: a.mode,
      score: a.score,
      total: a.total,
      time: a.elapsed,
      missed: (a.missedQuestionIds || []).map((id) => `AF06-${id}`),
      date: a.date,
    }));
    localStorage.setItem(newAttemptsKey, JSON.stringify(newAttempts));
  }

  localStorage.removeItem(oldStatsKey);
  localStorage.removeItem(oldAttemptsKey);
}

function safeParseJSON(str, fallback) {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch {
    return fallback;
  }
}

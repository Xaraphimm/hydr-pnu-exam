import { useMemo } from 'react';
import { TOPICS, CATEGORIES, getCachedQuestionIds } from '../data/index.js';
import { useHistory } from '../HistoryContext.jsx';
import { getTopicMastery, getTopicCounts, getMasteryColor } from '../utils/mastery.js';
import ProgressBarMulti from './ProgressBarMulti.jsx';
import TrendChart from './TrendChart.jsx';
import './ProgressScreen.css';

export default function ProgressScreen() {
  const { confidence, attempts, clearHistory } = useHistory();

  const topicStats = useMemo(() => {
    const stats = {};
    for (const [id] of Object.entries(TOPICS)) {
      const qIds = getCachedQuestionIds(id);
      stats[id] = {
        mastery: getTopicMastery(qIds, confidence),
        counts: getTopicCounts(qIds, confidence),
        questionCount: qIds.length,
      };
    }
    return stats;
  }, [confidence]);

  const totalStudyTime = useMemo(() => {
    const secs = attempts.reduce((sum, a) => sum + (a.time || 0), 0);
    if (secs < 60) return `${secs}s`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  }, [attempts]);

  const handleClear = () => {
    if (confirm('Clear all progress data? This cannot be undone.')) {
      clearHistory();
    }
  };

  return (
    <div className="progress-screen">
      <h2 className="progress-screen__title">Progress</h2>
      <div className="progress-screen__stats">
        <div className="progress-screen__stat">
          <span className="progress-screen__stat-value">{attempts.length}</span>
          <span className="progress-screen__stat-label">Attempts</span>
        </div>
        <div className="progress-screen__stat">
          <span className="progress-screen__stat-value">{totalStudyTime}</span>
          <span className="progress-screen__stat-label">Study Time</span>
        </div>
      </div>

      {attempts.length > 0 && (
        <div className="progress-screen__chart">
          <TrendChart attempts={attempts} />
        </div>
      )}

      {Object.entries(CATEGORIES).map(([catKey, cat]) => {
        let catMastered = 0, catTotal = 0;
        cat.topics.forEach((id) => {
          catMastered += topicStats[id].counts.mastered;
          catTotal += topicStats[id].questionCount;
        });
        const catPct = catTotal > 0 ? Math.round((catMastered / catTotal) * 100) : 0;

        return (
          <div key={catKey} className="progress-screen__category">
            <div className="progress-screen__cat-header">
              <h3 className="progress-screen__cat-name">{cat.name.toUpperCase()}</h3>
              <span className="progress-screen__cat-pct">{catPct}% ready</span>
            </div>
            {cat.topics.map((topicId) => {
              const topic = TOPICS[topicId];
              const stats = topicStats[topicId];
              const hasAttempts = stats.counts.mastered + stats.counts.learning > 0;
              const colorKey = getMasteryColor(stats.mastery, hasAttempts);
              const COLORS = { 'passing': 'var(--color-mastered)', 'learning': 'var(--color-learning)', 'struggling': 'var(--color-struggling)', 'not-started': 'var(--color-not-started)' };
              return (
                <div key={topicId} className="progress-screen__topic">
                  <span className="progress-screen__topic-name">{topic.name}</span>
                  <div className="progress-screen__topic-bar">
                    <ProgressBarMulti mastered={stats.counts.mastered} learning={stats.counts.learning} total={stats.questionCount} />
                  </div>
                  <span className="progress-screen__topic-pct" style={{ color: COLORS[colorKey] }}>
                    {hasAttempts ? `${stats.mastery}%` : '--'}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}

      {attempts.length > 0 && (
        <button className="progress-screen__clear" onClick={handleClear}>Clear All Progress</button>
      )}
    </div>
  );
}

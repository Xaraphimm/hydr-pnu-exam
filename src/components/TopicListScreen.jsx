import { useMemo } from 'react';
import { TOPICS, CATEGORIES, getCachedQuestionIds } from '../data/index.js';
import { useHistory } from '../HistoryContext.jsx';
import { getTopicMastery, getTopicCounts } from '../utils/mastery.js';
import ReadinessRing from './ReadinessRing.jsx';
import TopicCard from './TopicCard.jsx';
import './TopicListScreen.css';
import logo from '../assets/phnx-logo.jpeg';

export default function TopicListScreen({ onSelectTopic }) {
  const { confidence } = useHistory();

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

  const globalStats = useMemo(() => {
    let totalMastered = 0;
    let totalQuestions = 0;
    for (const s of Object.values(topicStats)) {
      totalMastered += s.counts.mastered;
      totalQuestions += s.questionCount;
    }
    return {
      mastered: totalMastered,
      total: totalQuestions,
      pct: totalQuestions > 0 ? Math.round((totalMastered / totalQuestions) * 100) : 0,
    };
  }, [topicStats]);

  const categoryReadiness = (catKey) => {
    const topicIds = CATEGORIES[catKey].topics;
    let mastered = 0;
    let total = 0;
    for (const id of topicIds) {
      mastered += topicStats[id].counts.mastered;
      total += topicStats[id].questionCount;
    }
    return total > 0 ? Math.round((mastered / total) * 100) : 0;
  };

  return (
    <div className="topic-list">
      <div className="topic-list__header">
        <img src={logo} alt="PHNX" className="topic-list__logo" />
        <span className="topic-list__title">PHNX FOUNDRIES</span>
      </div>
      <ReadinessRing percentage={globalStats.pct} mastered={globalStats.mastered} total={globalStats.total} />
      {Object.entries(CATEGORIES).map(([catKey, cat]) => (
        <div key={catKey} className="topic-list__category">
          <div className="topic-list__cat-header">
            <div>
              <h2 className="topic-list__cat-name">{cat.name.toUpperCase()}</h2>
              <span className="topic-list__cat-meta">{cat.code} &middot; {cat.examQuestions} Questions &middot; {cat.timeHours} hrs</span>
            </div>
            <span className="topic-list__cat-ready">{categoryReadiness(catKey)}% ready</span>
          </div>
          {cat.topics.map((topicId) => {
            const topic = TOPICS[topicId];
            const stats = topicStats[topicId];
            return (
              <TopicCard key={topicId} topic={topic} mastery={stats.mastery} counts={stats.counts} onClick={() => onSelectTopic(topicId)} />
            );
          })}
        </div>
      ))}
    </div>
  );
}

import { TOPICS, getCachedQuestionIds, hasQuestionData } from '../data/index.js';
import { useHistory } from '../HistoryContext.jsx';
import { getTopicMastery, getTopicCounts, getMasteryColor } from '../utils/mastery.js';
import ProgressBarMulti from './ProgressBarMulti.jsx';
import './SubtopicScreen.css';

const CATEGORY_LABELS = { airframe: 'Airframe', powerplant: 'Powerplant' };

export default function SubtopicScreen({ topicId, onBack, onStartStudy, onStartFlashcards, onStartTest, onStartMockExam, onViewHistory }) {
  const topic = TOPICS[topicId];
  const { confidence, getTopicAttempts } = useHistory();
  const qIds = getCachedQuestionIds(topicId);
  const mastery = getTopicMastery(qIds, confidence);
  const counts = getTopicCounts(qIds, confidence);
  const hasAttempts = counts.mastered + counts.learning > 0;
  const colorKey = getMasteryColor(mastery, hasAttempts);
  const recentAttempts = getTopicAttempts(topicId).slice(0, 3);
  const hasQuestions = hasQuestionData(topicId);

  const weakCount = qIds.filter((id) => {
    const c = confidence[id];
    return c && c.attempts > 0 && c.level <= 2;
  }).length;

  const formatDate = (ts) => new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const formatTime = (ts) => new Date(ts).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="subtopic">
      <div className="subtopic__nav">
        <button className="subtopic__back" onClick={onBack}>&larr;</button>
        <div>
          <h1 className="subtopic__title">{topic.name}</h1>
          <span className="subtopic__breadcrumb">{CATEGORY_LABELS[topic.category]} &middot; {qIds.length} Questions</span>
        </div>
      </div>

      {hasQuestions && (
        <div className="subtopic__progress">
          <span className={`subtopic__pct subtopic__pct--${colorKey}`}>{hasAttempts ? `${mastery}%` : '--'}</span>
          <div className="subtopic__counts">
            <span className="subtopic__count subtopic__count--mastered">&#9679; {counts.mastered} mastered</span>
            <span className="subtopic__count subtopic__count--learning">&#9679; {counts.learning} learning</span>
            <span className="subtopic__count subtopic__count--new">&#9679; {counts.new} new</span>
          </div>
          <ProgressBarMulti mastered={counts.mastered} learning={counts.learning} total={qIds.length} />
        </div>
      )}

      <div className="subtopic__modes">
        <button className="subtopic__mode" onClick={onStartStudy}>
          <span className="subtopic__mode-icon">&#128214;</span>
          <span className="subtopic__mode-label">Study</span>
          <span className="subtopic__mode-desc">Read the chapter</span>
        </button>
        <button className="subtopic__mode" onClick={onStartFlashcards} disabled={!hasQuestions}>
          <span className="subtopic__mode-icon">&#127183;</span>
          <span className="subtopic__mode-label">Flashcards</span>
          <span className="subtopic__mode-desc">Quick recall</span>
        </button>
        <button className="subtopic__mode subtopic__mode--accent" onClick={() => onStartTest('all')} disabled={!hasQuestions}>
          <span className="subtopic__mode-icon">&#9997;&#65039;</span>
          <span className="subtopic__mode-label">Test</span>
          <span className="subtopic__mode-desc">Exam practice</span>
        </button>
      </div>

      {hasQuestions && (
        <div className="subtopic__test-options">
          <h3 className="subtopic__section-title">TEST OPTIONS</h3>
          <button className="subtopic__option" onClick={() => onStartTest('all')}>
            <div><span className="subtopic__option-name">All Questions</span><span className="subtopic__option-desc">{qIds.length} questions, randomized</span></div>
            <span className="subtopic__option-arrow">&rsaquo;</span>
          </button>
          {weakCount > 0 && (
            <button className="subtopic__option" onClick={() => onStartTest('weak')}>
              <div><span className="subtopic__option-name">Weak Areas Only</span><span className="subtopic__option-desc subtopic__option-desc--weak">{weakCount} questions below confidence</span></div>
              <span className="subtopic__option-arrow">&rsaquo;</span>
            </button>
          )}
          <button className="subtopic__option" onClick={onStartMockExam}>
            <div><span className="subtopic__option-name">Mock Exam</span><span className="subtopic__option-desc">Timed, no feedback until end</span></div>
            <span className="subtopic__option-arrow">&rsaquo;</span>
          </button>
        </div>
      )}

      {!hasQuestions && (
        <div className="subtopic__coming-soon"><p>Questions coming soon for this topic.</p><p>Study mode (PDF chapter) is available.</p></div>
      )}

      {recentAttempts.length > 0 && (
        <div className="subtopic__recent">
          <h3 className="subtopic__section-title">RECENT ATTEMPTS</h3>
          {recentAttempts.map((a) => (
            <div key={a.id} className="subtopic__attempt">
              <span className="subtopic__attempt-date">{formatDate(a.date)}, {formatTime(a.date)}</span>
              <span className="subtopic__attempt-score" style={{ color: (a.score / a.total) * 100 >= 70 ? 'var(--color-mastered)' : 'var(--color-learning)' }}>
                {Math.round((a.score / a.total) * 100)}% ({a.score}/{a.total})
              </span>
            </div>
          ))}
          <button className="subtopic__history-link" onClick={onViewHistory}>View full history &rarr;</button>
        </div>
      )}
    </div>
  );
}

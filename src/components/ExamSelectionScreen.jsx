import { useMemo, useState } from 'react';
import { useHistory } from '../HistoryContext.jsx';
import { TOPICS, CATEGORIES } from '../data/index.js';
import './ExamSelectionScreen.css';

export default function ExamSelectionScreen({ topicId, onSelectExam, onBack }) {
  const [activeTab, setActiveTab] = useState('study');
  const { attempts } = useHistory();

  // topicId is null or 'airframe' for full-category, or 'AF-01' etc for per-subtopic
  const isFullCategory = !topicId || topicId === 'airframe';
  const title = isFullCategory ? 'Airframe Knowledge Exam' : TOPICS[topicId]?.name;

  const bestScores = useMemo(() => {
    const scores = {};
    const filterTopicId = isFullCategory ? 'airframe' : topicId;
    for (const a of attempts) {
      if (a.topicId !== filterTopicId) continue;
      if (a.mode !== activeTab) continue;
      if (a.version == null) continue;
      const pct = Math.round((a.score / a.total) * 100);
      if (!scores[a.version] || pct > scores[a.version]) {
        scores[a.version] = pct;
      }
    }
    return scores;
  }, [attempts, activeTab, topicId, isFullCategory]);

  const handleSelect = (version) => {
    const seed = version === 'random' ? Date.now() : version;
    onSelectExam({
      mode: activeTab,
      version,
      seed,
      topicId: isFullCategory ? 'airframe' : topicId,
      isFullCategory,
    });
  };

  return (
    <div className="exam-select">
      <div className="exam-select__header">
        <button className="exam-select__back" onClick={onBack}>&larr;</button>
        <h1 className="exam-select__title">{title}</h1>
      </div>

      <div className="exam-select__tabs">
        <button
          className={`exam-select__tab ${activeTab === 'study' ? 'exam-select__tab--active' : ''}`}
          onClick={() => setActiveTab('study')}
        >
          Study
        </button>
        <button
          className={`exam-select__tab ${activeTab === 'test' ? 'exam-select__tab--active' : ''}`}
          onClick={() => setActiveTab('test')}
        >
          Test
        </button>
      </div>

      <p className="exam-select__subtitle">
        Select a version — each draws {isFullCategory ? '100' : 'all'} questions
        {isFullCategory ? ' weighted by ACS topics' : ''}
      </p>

      <div className="exam-select__grid">
        {[1, 2, 3, 4, 5].map((v) => (
          <button key={v} className="exam-select__card" onClick={() => handleSelect(v)}>
            <span className="exam-select__card-num">{v}</span>
            <span className="exam-select__card-label">Exam {v}</span>
            <span className={`exam-select__card-score ${bestScores[v] ? 'exam-select__card-score--taken' : ''}`}>
              {bestScores[v] ? `Best: ${bestScores[v]}%` : 'Not taken'}
            </span>
          </button>
        ))}
        <button className="exam-select__card exam-select__card--random" onClick={() => handleSelect('random')}>
          <span className="exam-select__card-icon">&infin;</span>
          <span className="exam-select__card-label exam-select__card-label--accent">Random</span>
          <span className="exam-select__card-score">Unique exam</span>
        </button>
      </div>

      <div className="exam-select__info">
        <span>{isFullCategory ? '100 questions' : 'All questions'}</span>
        <span>{isFullCategory ? '2 hr time limit' : 'No time limit'}</span>
        <span>70% to pass</span>
      </div>
    </div>
  );
}

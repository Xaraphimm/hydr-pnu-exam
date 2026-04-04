import ProgressBarMulti from './ProgressBarMulti.jsx';
import { getMasteryColor } from '../utils/mastery.js';

const BORDER_COLORS = {
  'passing': 'var(--color-mastered)',
  'learning': 'var(--color-learning)',
  'struggling': 'var(--color-struggling)',
  'not-started': 'var(--color-not-started)',
};

export default function TopicCard({ topic, mastery, counts, onClick }) {
  const hasAttempts = counts.mastered + counts.learning > 0;
  const colorKey = getMasteryColor(mastery, hasAttempts);

  return (
    <button className="topic-card" onClick={onClick} style={{ borderLeftColor: BORDER_COLORS[colorKey] }}>
      <div className="topic-card__body">
        <span className="topic-card__name">{topic.name}</span>
        <ProgressBarMulti mastered={counts.mastered} learning={counts.learning} total={counts.mastered + counts.learning + counts.new} />
      </div>
      <span className="topic-card__pct" style={{ color: BORDER_COLORS[colorKey] }}>
        {hasAttempts ? `${mastery}%` : '--'}
      </span>
    </button>
  );
}

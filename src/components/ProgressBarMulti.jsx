export default function ProgressBarMulti({ mastered, learning, total }) {
  if (total === 0) return null;
  const masteredPct = (mastered / total) * 100;
  const learningPct = (learning / total) * 100;

  return (
    <div className="progress-bar-multi" style={{ height: 3, background: 'var(--color-bar-track)', borderRadius: 2, display: 'flex', overflow: 'hidden' }}>
      {masteredPct > 0 && <div style={{ width: `${masteredPct}%`, background: 'var(--color-mastered)' }} />}
      {learningPct > 0 && <div style={{ width: `${learningPct}%`, background: 'var(--color-learning)' }} />}
    </div>
  );
}

const CIRCUMFERENCE = 2 * Math.PI * 15.5;

export default function ReadinessRing({ percentage, mastered, total }) {
  const dashArray = (percentage / 100) * CIRCUMFERENCE;
  const remainder = CIRCUMFERENCE - dashArray;

  return (
    <div className="readiness-ring">
      <div className="readiness-ring__circle">
        <svg viewBox="0 0 36 36" style={{ width: 72, height: 72, transform: 'rotate(-90deg)' }}>
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--color-bar-track)" strokeWidth="3" />
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--color-accent)" strokeWidth="3" strokeDasharray={`${dashArray} ${remainder}`} strokeLinecap="round" />
        </svg>
        <span className="readiness-ring__pct">{percentage}%</span>
      </div>
      <div className="readiness-ring__info">
        <span className="readiness-ring__label">Exam Readiness</span>
        <span className="readiness-ring__detail">{mastered} of {total} questions mastered</span>
        <span className="readiness-ring__threshold">70% needed to pass</span>
      </div>
    </div>
  );
}

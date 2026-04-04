import './FlashcardComplete.css'

export default function FlashcardComplete({ results, onStudyMissed, onDone }) {
  const gotIt = results.filter(r => r.gotIt)
  const missed = results.filter(r => !r.gotIt)

  return (
    <div className="fc-complete">
      <div className="fc-complete-score">
        <span className="fc-complete-got-it">{gotIt.length} Got It</span>
        <span className="fc-complete-divider">/</span>
        <span className="fc-complete-missed">{missed.length} Missed</span>
      </div>

      <div className="fc-complete-bar">
        <div
          className="fc-complete-bar-got-it"
          style={{ width: `${(gotIt.length / results.length) * 100}%` }}
        />
        <div
          className="fc-complete-bar-missed"
          style={{ width: `${(missed.length / results.length) * 100}%` }}
        />
      </div>

      {missed.length > 0 && (
        <div className="fc-complete-card">
          <span className="fc-complete-card-label">MISSED CARDS ({missed.length})</span>
          <div className="fc-complete-list">
            {missed.map(r => (
              <div key={r.question.id} className="fc-complete-item">
                <div className="fc-complete-item-q">{r.question.q}</div>
                <div className="fc-complete-item-a">{r.question.a[r.question.c]}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="fc-complete-actions">
        {missed.length > 0 && (
          <button
            className="fc-complete-study-missed"
            onClick={() => onStudyMissed(missed.map(r => r.question))}
          >
            STUDY MISSED CARDS
          </button>
        )}
        <button className="fc-complete-done" onClick={onDone}>DONE</button>
      </div>
    </div>
  )
}

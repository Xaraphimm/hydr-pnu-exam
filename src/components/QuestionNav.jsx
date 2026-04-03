import './QuestionNav.css'

export default function QuestionNav({ questions, answers, currentIndex, flagged, onGoTo }) {
  return (
    <details className="qnav">
      <summary className="qnav-summary">
        Question Navigator {flagged.size > 0 && `(${flagged.size} flagged)`}
      </summary>
      <div className="qnav-grid">
        {questions.map((q, i) => {
          const isAnswered = answers[q.id] !== undefined
          const isCorrect = answers[q.id] === q.c
          const isCurrent = i === currentIndex
          const isFlagged = flagged.has(q.id)

          let cls = 'qnav-cell'
          if (isCurrent) cls += ' qnav-cell--current'
          else if (isAnswered && isCorrect) cls += ' qnav-cell--correct'
          else if (isAnswered && !isCorrect) cls += ' qnav-cell--incorrect'
          if (isFlagged) cls += ' qnav-cell--flagged'

          return (
            <button key={i} className={cls} onClick={() => onGoTo(i)}>
              {i + 1}
            </button>
          )
        })}
      </div>
    </details>
  )
}

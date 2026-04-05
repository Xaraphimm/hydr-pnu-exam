import { useState } from 'react'
import { TOPICS } from '../data/index.js'
import { useHistory } from '../HistoryContext.jsx'
import diagrams from '../diagrams/index.js'
import './FlashcardSession.css'

export default function FlashcardSession({ questions, topicId, onFinish, onBack }) {
  const { recordAnswer, toggleQuestionBookmark, isQuestionBookmarked } = useHistory()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [results, setResults] = useState([])

  const q = questions[currentIndex]
  const DiagramComponent = q.diagram ? diagrams[q.diagram] : null
  const topicName = TOPICS[topicId]?.name ?? 'All Questions'

  const handleFlip = () => {
    if (!flipped) setFlipped(true)
  }

  const handleGrade = (gotIt) => {
    recordAnswer(q.id, gotIt)
    const updated = [...results, { question: q, gotIt }]

    if (currentIndex < questions.length - 1) {
      setResults(updated)
      setCurrentIndex(currentIndex + 1)
      setFlipped(false)
    } else {
      onFinish(updated)
    }
  }

  return (
    <div className="fc-session">
      <div className="fc-session-header">
        <button className="fc-session-back" onClick={onBack}>&larr; Back</button>
        <span className="fc-session-progress">Card {currentIndex + 1} / {questions.length}</span>
        <span className="fc-session-badge">{topicName}</span>
      </div>

      <div className="fc-card-container" onClick={handleFlip}>
        <div className={`fc-card ${flipped ? 'fc-card--flipped' : ''}`}>
          <div className="fc-card-front">
            <p className="fc-card-question">{q.q}</p>
            {DiagramComponent && (
              <div className="fc-card-diagram">
                <DiagramComponent />
              </div>
            )}
            <span className="fc-card-hint">Tap to reveal answer</span>
          </div>
          <div className="fc-card-back">
            <div className="fc-card-answer">{q.a[q.c]}</div>
            <div className="fc-card-explanation">{q.exp}</div>
            <button
              className={`fc-card-bookmark ${isQuestionBookmarked(q.id) ? 'fc-card-bookmark--active' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                toggleQuestionBookmark(q.id)
              }}
            >
              {isQuestionBookmarked(q.id) ? '\u{1F516} Bookmarked' : '\u{1F517} Bookmark'}
            </button>
          </div>
        </div>
      </div>

      {flipped && (
        <div className="fc-session-actions">
          <button className="fc-session-got-it" onClick={() => handleGrade(true)}>GOT IT</button>
          <button className="fc-session-missed" onClick={() => handleGrade(false)}>MISSED IT</button>
        </div>
      )}
    </div>
  )
}

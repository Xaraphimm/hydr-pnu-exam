import { useState } from 'react'
import { SECTIONS } from '../data/questions.js'
import { useHistory } from '../HistoryContext.jsx'
import diagrams from '../diagrams/index.js'
import './FlashcardSession.css'

export default function FlashcardSession({ questions, sectionKey, onFinish }) {
  const { recordFlashcard } = useHistory()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [results, setResults] = useState([])

  const q = questions[currentIndex]
  const DiagramComponent = q.diagram ? diagrams[q.diagram] : null
  const sectionName = sectionKey
    ? SECTIONS.find(s => s.key === sectionKey)?.name
    : 'All Questions'

  const handleFlip = () => {
    if (!flipped) setFlipped(true)
  }

  const handleGrade = (gotIt) => {
    recordFlashcard(q.id, gotIt)
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
        <span className="fc-session-progress">Card {currentIndex + 1} / {questions.length}</span>
        <span className="fc-session-badge">{sectionName}</span>
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

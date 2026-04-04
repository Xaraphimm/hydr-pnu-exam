import { useState, useEffect, useRef, useCallback } from 'react'
import { TOPICS } from '../data/index.js'
import diagrams from '../diagrams/index.js'
import './MockExamScreen.css'

export default function MockExamScreen({ questions, topicId, onFinish }) {
  const totalSeconds = Math.round((questions.length / 100) * 120 * 60)
  const [remaining, setRemaining] = useState(totalSeconds)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const topRef = useRef(null)
  const timerRef = useRef(null)

  const topicName = TOPICS[topicId]?.name

  const finish = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    onFinish(answers)
  }, [answers, onFinish])

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // Auto-finish when timer hits 0
  useEffect(() => {
    if (remaining === 0) {
      onFinish(answers)
    }
  }, [remaining]) // eslint-disable-line react-hooks/exhaustive-deps

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }

  const selectAnswer = (answerIndex) => {
    if (answers[questions[currentIndex].id] !== undefined) return
    const q = questions[currentIndex]
    const updated = { ...answers, [q.id]: answerIndex }
    setAnswers(updated)

    // Auto-advance to next question
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      topRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const q = questions[currentIndex]
  const DiagramComponent = q.diagram ? diagrams[q.diagram] : null
  const answeredCount = Object.keys(answers).length
  const progressPct = (answeredCount / questions.length) * 100

  return (
    <div ref={topRef} className="mock">
      <div className="mock-header">
        <span className="mock-topic">{topicName}</span>
        <span className={`mock-timer ${remaining <= 60 ? 'mock-timer--warning' : ''}`}>
          {formatTime(remaining)}
        </span>
        <span className="mock-progress">
          {answeredCount} / {questions.length}
        </span>
      </div>

      <div className="mock-progress-bar">
        <div className="mock-progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="mock-card">
        <div className="mock-card-top">
          <span className="mock-qnum">Q {currentIndex + 1}</span>
        </div>

        <p className="mock-question">{q.q}</p>

        {DiagramComponent && (
          <div className="mock-diagram">
            <DiagramComponent />
          </div>
        )}

        <div className="mock-answers">
          {q.a.map((opt, i) => {
            const isSelected = answers[q.id] === i
            let cls = 'mock-answer'
            if (isSelected) cls += ' mock-answer--selected'

            return (
              <button
                key={i}
                className={cls}
                onClick={() => selectAnswer(i)}
                disabled={answers[q.id] !== undefined}
              >
                <span className="mock-answer-letter">{String.fromCharCode(65 + i)}</span>
                <span className="mock-answer-text">{opt}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mock-nav">
        <button
          className="mock-nav-prev"
          onClick={() => {
            if (currentIndex > 0) {
              setCurrentIndex(currentIndex - 1)
              topRef.current?.scrollIntoView({ behavior: 'smooth' })
            }
          }}
          disabled={currentIndex === 0}
        >
          &larr; PREV
        </button>
        <button
          className="mock-nav-next"
          onClick={() => {
            if (currentIndex < questions.length - 1) {
              setCurrentIndex(currentIndex + 1)
              topRef.current?.scrollIntoView({ behavior: 'smooth' })
            }
          }}
          disabled={currentIndex === questions.length - 1}
        >
          NEXT &rarr;
        </button>
      </div>

      <button className="mock-finish" onClick={finish}>
        Finish Exam
      </button>
    </div>
  )
}

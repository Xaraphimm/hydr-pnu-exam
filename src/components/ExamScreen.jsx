import { useState, useEffect, useRef } from 'react'
import { TOPICS } from '../data/index.js'
import { useHistory } from '../HistoryContext.jsx'
import diagrams from '../diagrams/index.js'
import QuestionNav from './QuestionNav.jsx'
import './ExamScreen.css'

export default function ExamScreen({
  questions,
  answers,
  flagged,
  startTime,
  onAnswer,
  onToggleFlag,
  onFinish,
  initialIndex,
  mode,
  topicId,
}) {
  const { recordAnswer, toggleQuestionBookmark, isQuestionBookmarked } = useHistory()
  const [currentIndex, setCurrentIndex] = useState(initialIndex ?? 0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const topRef = useRef(null)

  const q = questions[currentIndex]
  const DiagramComponent = q.diagram ? diagrams[q.diagram] : null
  const score = questions.reduce((acc, question) => acc + (answers[question.id] === question.c ? 1 : 0), 0)
  const topicName = TOPICS[topicId]?.name

  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000)
    return () => clearInterval(t)
  }, [startTime])

  useEffect(() => {
    setShowFeedback(answers[q.id] !== undefined)
  }, [currentIndex, q.id, answers])

  const formatTime = (s) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0')
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${h}:${m}:${sec}`
  }

  const selectAnswer = (answerIndex) => {
    if (answers[q.id] !== undefined) return
    onAnswer(q.id, answerIndex)
    recordAnswer(q.id, answerIndex === q.c)
    setShowFeedback(true)
  }

  const goTo = (idx) => {
    setCurrentIndex(idx)
    topRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const next = () => {
    if (currentIndex < questions.length - 1) {
      goTo(currentIndex + 1)
    } else {
      onFinish()
    }
  }

  const prev = () => {
    if (currentIndex > 0) goTo(currentIndex - 1)
  }

  return (
    <div ref={topRef} className="exam">
      <div className="exam-header">
        <span className="exam-study-badge">
          {topicName}{mode === 'weak' ? ' — WEAK AREAS' : ''}
        </span>
        <span className="exam-progress">Q {currentIndex + 1} / {questions.length}</span>
        <span className="exam-score">{score} correct</span>
      </div>

      <div className="exam-subheader">
        <span className="exam-timer">{formatTime(elapsed)}</span>
      </div>

      <div className="exam-progress-bar">
        <div className="exam-progress-fill" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
      </div>

      <div className="exam-card">
        <div className="exam-card-top">
          <span className="exam-qid">#{q.id}</span>
          <div className="exam-card-actions">
            <button
              className={`exam-bookmark ${isQuestionBookmarked(q.id) ? 'exam-bookmark--active' : ''}`}
              onClick={() => toggleQuestionBookmark(q.id)}
              title="Bookmark"
            >
              {isQuestionBookmarked(q.id) ? '\u{1F516}' : '\u{1F517}'}
            </button>
            <button
              className={`exam-flag ${flagged.has(q.id) ? 'exam-flag--active' : ''}`}
              onClick={() => onToggleFlag(q.id)}
              title="Flag for review"
            >
              {flagged.has(q.id) ? '\u2605' : '\u2606'}
            </button>
          </div>
        </div>

        <p className="exam-question">{q.q}</p>

        {DiagramComponent && (
          <div className="exam-diagram">
            <DiagramComponent />
          </div>
        )}

        <div className="exam-answers">
          {q.a.map((opt, i) => {
            const isSelected = answers[q.id] === i
            const isCorrect = i === q.c
            const showResult = showFeedback && answers[q.id] !== undefined

            let cls = 'exam-answer'
            if (showResult && isCorrect) cls += ' exam-answer--correct'
            else if (showResult && isSelected && !isCorrect) cls += ' exam-answer--incorrect'
            else if (isSelected && !showResult) cls += ' exam-answer--selected'

            return (
              <button key={i} className={cls} onClick={() => selectAnswer(i)} disabled={showResult}>
                <span className="exam-answer-indicator">
                  {showResult && isCorrect && '\u2713'}
                  {showResult && isSelected && !isCorrect && '\u2717'}
                </span>
                <span className="exam-answer-text">{String.fromCharCode(65 + i)}. {opt}</span>
              </button>
            )
          })}
        </div>

        {showFeedback && answers[q.id] !== undefined && (
          <div className={`exam-explanation ${answers[q.id] === q.c ? 'exam-explanation--correct' : 'exam-explanation--incorrect'}`}>
            <div className="exam-explanation-label">
              {answers[q.id] === q.c ? 'Correct' : 'Incorrect'}
            </div>
            <div className="exam-explanation-text">{q.exp}</div>
          </div>
        )}
      </div>

      <div className="exam-nav">
        <button className="exam-nav-prev" onClick={prev} disabled={currentIndex === 0}>&larr; PREV</button>
        <button className={`exam-nav-next ${showFeedback ? 'exam-nav-next--ready' : ''}`} onClick={next}>
          {currentIndex === questions.length - 1 ? 'FINISH' : 'NEXT \u2192'}
        </button>
      </div>

      <QuestionNav questions={questions} answers={answers} currentIndex={currentIndex} flagged={flagged} onGoTo={goTo} />

      <button className="exam-end" onClick={onFinish}>End &amp; View Results</button>
    </div>
  )
}

import { useEffect, useRef } from 'react'
import { SECTIONS } from '../data/questions.js'
import { useHistory } from '../HistoryContext.jsx'
import logo from '../assets/phnx-logo.jpeg'
import './ResultsScreen.css'

export default function ResultsScreen({
  questions,
  answers,
  startTime,
  endTime,
  onRetake,
  onHome,
  onGoToQuestion,
  mode,
  studySection,
}) {
  const { saveAttempt } = useHistory()
  const savedRef = useRef(false)

  const score = questions.reduce((acc, q) => acc + (answers[q.id] === q.c ? 1 : 0), 0)
  const pct = Math.round((score / questions.length) * 100)
  const passed = pct >= 70
  const elapsed = Math.floor((endTime - startTime) / 1000)

  const formatTime = (s) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0')
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${h}:${m}:${sec}`
  }

  const sectionScores = SECTIONS.map(s => {
    const qs = questions.filter(q => q.section === s.key)
    const correct = qs.filter(q => answers[q.id] === q.c).length
    return { ...s, total: qs.length, correct, pct: qs.length ? Math.round((correct / qs.length) * 100) : 0 }
  }).filter(s => s.total > 0)

  useEffect(() => {
    if (savedRef.current) return
    savedRef.current = true
    saveAttempt({
      mode,
      section: studySection,
      questions,
      answers,
      startTime,
      endTime,
      sectionScores: sectionScores.map(s => ({ key: s.key, correct: s.correct, total: s.total })),
    })
  }, [])

  const missed = questions
    .map((q, i) => ({ ...q, examIndex: i }))
    .filter(q => answers[q.id] !== q.c)

  const modeLabel = mode === 'study'
    ? `Study: ${SECTIONS.find(s => s.key === studySection)?.name ?? ''}`
    : mode === 'weak' ? 'Weak Areas' : null

  return (
    <div className="results">
      <div className="results-score">
        {modeLabel && <div className="results-mode-badge">{modeLabel}</div>}
        <div className={`results-pct ${passed ? 'results-pct--pass' : 'results-pct--fail'}`}>
          {pct}%
        </div>
        <div className={`results-verdict ${passed ? 'results-verdict--pass' : 'results-verdict--fail'}`}>
          {passed ? 'PASSED' : 'NOT YET'}
        </div>
        <div className="results-detail">
          {score} / {questions.length} correct in {formatTime(elapsed)}
        </div>
      </div>

      <div className="results-card">
        <span className="results-card-label">SECTION BREAKDOWN</span>
        {sectionScores.map(s => (
          <div key={s.key} className="results-section">
            <div className="results-section-header">
              <span className="results-section-name">{s.name}</span>
              <span className={`results-section-score ${s.pct >= 70 ? 'results-section-score--pass' : 'results-section-score--fail'}`}>
                {s.correct}/{s.total} ({s.pct}%)
              </span>
            </div>
            <div className="results-bar">
              <div
                className={`results-bar-fill ${s.pct >= 70 ? '' : 'results-bar-fill--fail'}`}
                style={{ width: `${s.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {missed.length > 0 && (
        <div className="results-card">
          <span className="results-card-label">MISSED QUESTIONS ({missed.length})</span>
          <div className="results-missed">
            {missed.map(mq => (
              <button
                key={mq.id}
                className="results-missed-item"
                onClick={() => onGoToQuestion(mq.examIndex)}
              >
                <div className="results-missed-qid">Q{mq.examIndex + 1} (#{mq.id})</div>
                <div className="results-missed-text">{mq.q}</div>
                <div className="results-missed-answers">
                  Your answer: <span className="results-missed-yours">{mq.a[answers[mq.id]] ?? 'Skipped'}</span>
                  {' | '}
                  Correct: <span className="results-missed-correct">{mq.a[mq.c]}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="results-actions">
        <button className="results-retake" onClick={onRetake}>RETAKE EXAM</button>
        <button className="results-home" onClick={onHome}>HOME</button>
      </div>

      <div className="results-footer">
        <img src={logo} alt="PHNX Foundries" className="results-footer-logo" />
      </div>
    </div>
  )
}

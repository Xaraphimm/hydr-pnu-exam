import { useState, useEffect, useRef } from 'react'
import { TOPICS } from '../data/index.js'
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
  topicId,
}) {
  const { saveAttempt, recordAnswer } = useHistory()
  const savedRef = useRef(false)

  const score = questions.reduce((acc, q) => acc + (answers[q.id] === q.c ? 1 : 0), 0)
  const pct = Math.round((score / questions.length) * 100)
  const passed = pct >= 70
  const elapsed = Math.floor((endTime - startTime) / 1000)

  const topicName = TOPICS[topicId]?.name

  const formatTime = (s) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0')
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${h}:${m}:${sec}`
  }

  const getModeLabel = (m) => {
    if (m === 'all') return 'All Questions'
    if (m === 'weak') return 'Weak Areas'
    if (m === 'mock') return 'Mock Exam'
    return m
  }

  useEffect(() => {
    if (savedRef.current) return
    savedRef.current = true
    saveAttempt({
      topicId,
      mode,
      questions,
      answers,
      startTime,
      endTime,
    })
    // Record confidence for each question
    questions.forEach((q) => {
      recordAnswer(q.id, answers[q.id] === q.c)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const missed = questions
    .map((q, i) => ({ ...q, examIndex: i }))
    .filter(q => answers[q.id] !== q.c)

  const modeLabel = getModeLabel(mode)

  const [shareLabel, setShareLabel] = useState('SHARE')

  const handleShare = async () => {
    const title = topicName || 'A&P Exam Practice'

    let text = `${title} (${modeLabel})\nScore: ${pct}% (${score}/${questions.length}) \u2014 ${passed ? 'PASSED' : 'NOT YET'}\nTime: ${formatTime(elapsed)}`
    text += `\nPractice at: ${window.location.origin}${window.location.pathname}`

    if (navigator.share) {
      try {
        await navigator.share({ text })
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(text)
        setShareLabel('COPIED!')
        setTimeout(() => setShareLabel('SHARE'), 2000)
      } catch {}
    }
  }

  return (
    <div className="results">
      <div className="results-score">
        <div className="results-mode-badge">{topicName} &mdash; {modeLabel}</div>
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
        <span className="results-card-label">SCORE BREAKDOWN</span>
        <div className="results-overview">
          <div className="results-overview-row">
            <span className="results-overview-label">Correct</span>
            <span className="results-overview-value results-overview-value--pass">{score}</span>
          </div>
          <div className="results-overview-row">
            <span className="results-overview-label">Missed</span>
            <span className="results-overview-value results-overview-value--fail">{missed.length}</span>
          </div>
          <div className="results-overview-row">
            <span className="results-overview-label">Total</span>
            <span className="results-overview-value">{questions.length}</span>
          </div>
        </div>
        <div className="results-bar">
          <div
            className={`results-bar-fill ${pct >= 70 ? '' : 'results-bar-fill--fail'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
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
        <button className="results-retake" onClick={onRetake}>RETAKE</button>
        <button className="results-share" onClick={handleShare}>{shareLabel}</button>
        <button className="results-home" onClick={onHome}>HOME</button>
      </div>

      <div className="results-footer">
        <img src={logo} alt="PHNX Foundries" className="results-footer-logo" />
      </div>
    </div>
  )
}

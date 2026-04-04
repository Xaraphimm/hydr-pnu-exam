import { TOPICS } from '../data/index.js'
import { useHistory } from '../HistoryContext.jsx'
import TrendChart from './TrendChart.jsx'
import './HistoryScreen.css'

export default function HistoryScreen({ topicId, onHome }) {
  const { getTopicAttempts, clearHistory } = useHistory()

  const attempts = getTopicAttempts(topicId)
  const topicName = TOPICS[topicId]?.name

  const totalAttempts = attempts.length
  const bestPct = totalAttempts
    ? Math.max(...attempts.map(a => Math.round((a.score / a.total) * 100)))
    : null
  const avgPct = totalAttempts
    ? Math.round(attempts.reduce((acc, a) => acc + (a.score / a.total) * 100, 0) / totalAttempts)
    : null
  const totalTime = attempts.reduce((acc, a) => acc + (a.time || 0), 0)

  const formatTime = (s) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
  }

  const formatDate = (ts) => {
    const d = new Date(ts)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getModeLabel = (a) => {
    if (a.mode === 'all') return 'All Questions'
    if (a.mode === 'weak') return 'Weak Areas'
    if (a.mode === 'mock') return 'Mock Exam'
    if (a.mode === 'exam') return 'Full Exam'
    return a.mode
  }

  const handleClear = () => {
    if (window.confirm('Clear all exam history? This cannot be undone.')) {
      clearHistory()
      onHome()
    }
  }

  return (
    <div className="history">
      <div className="history-header">
        <button className="history-back" onClick={onHome}>&larr; Back</button>
        <h2 className="history-title">{topicName}</h2>
      </div>

      <div className="history-card">
        <div className="history-stats">
          <div className="history-stat">
            <span className="history-stat-value">{totalAttempts}</span>
            <span className="history-stat-label">Attempts</span>
          </div>
          <div className="history-stat">
            <span className="history-stat-value">{bestPct !== null ? `${bestPct}%` : '\u2014'}</span>
            <span className="history-stat-label">Best Score</span>
          </div>
          <div className="history-stat">
            <span className="history-stat-value">{avgPct !== null ? `${avgPct}%` : '\u2014'}</span>
            <span className="history-stat-label">Average</span>
          </div>
          <div className="history-stat">
            <span className="history-stat-value">{formatTime(totalTime)}</span>
            <span className="history-stat-label">Study Time</span>
          </div>
        </div>
      </div>

      <TrendChart attempts={attempts} />

      <div className="history-card">
        <span className="history-card-label">ALL ATTEMPTS</span>
        <div className="history-list">
          {attempts.length === 0 && (
            <div className="history-empty">No attempts yet for this topic.</div>
          )}
          {attempts.map(a => {
            const pct = Math.round((a.score / a.total) * 100)
            const passed = pct >= 70
            return (
              <div key={a.id} className="history-item">
                <div className="history-item-top">
                  <span className="history-item-date">{formatDate(a.date)}</span>
                  <span className={`history-item-mode history-item-mode--${a.mode}`}>{getModeLabel(a)}</span>
                </div>
                <div className="history-item-bottom">
                  <span className={`history-item-score ${passed ? 'history-item-score--pass' : 'history-item-score--fail'}`}>
                    {pct}%
                  </span>
                  <span className="history-item-detail">
                    {a.score}/{a.total} in {formatTime(a.time || 0)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <button className="history-clear" onClick={handleClear}>
        Clear All History
      </button>
    </div>
  )
}

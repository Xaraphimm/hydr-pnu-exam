import { SECTIONS } from '../data/questions.js'
import { useHistory } from '../HistoryContext.jsx'
import TrendChart from './TrendChart.jsx'
import './HistoryScreen.css'

export default function HistoryScreen({ onHome }) {
  const { attempts, clearHistory } = useHistory()

  const totalAttempts = attempts.length
  const examAttempts = attempts.filter(a => a.mode === 'exam')
  const bestPct = examAttempts.length
    ? Math.max(...examAttempts.map(a => Math.round((a.score / a.total) * 100)))
    : null
  const avgPct = examAttempts.length
    ? Math.round(examAttempts.reduce((acc, a) => acc + (a.score / a.total) * 100, 0) / examAttempts.length)
    : null
  const totalTime = attempts.reduce((acc, a) => acc + a.elapsed, 0)

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
    if (a.mode === 'study') {
      const sec = SECTIONS.find(s => s.key === a.section)
      return `Study: ${sec?.name ?? a.section}`
    }
    if (a.mode === 'weak') return 'Weak Areas'
    return 'Full Exam'
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
        <button className="history-back" onClick={onHome}>← Back</button>
        <h2 className="history-title">Exam History</h2>
      </div>

      <div className="history-card">
        <div className="history-stats">
          <div className="history-stat">
            <span className="history-stat-value">{totalAttempts}</span>
            <span className="history-stat-label">Attempts</span>
          </div>
          <div className="history-stat">
            <span className="history-stat-value">{bestPct !== null ? `${bestPct}%` : '—'}</span>
            <span className="history-stat-label">Best Score</span>
          </div>
          <div className="history-stat">
            <span className="history-stat-value">{avgPct !== null ? `${avgPct}%` : '—'}</span>
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
                    {a.score}/{a.total} in {formatTime(a.elapsed)}
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

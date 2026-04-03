import { SECTIONS, questions } from '../data/questions.js'
import { useHistory } from '../HistoryContext.jsx'
import logo from '../assets/phnx-logo.jpeg'
import './HomeScreen.css'

export default function HomeScreen({ onStart, onStudy, onWeakDrill, onHistory }) {
  const { attempts, questionStats } = useHistory()

  return (
    <div className="home">
      <div className="home-logo">
        <img src={logo} alt="PHNX Foundries" />
      </div>

      <div className="home-header">
        <span className="home-label">AMA 214</span>
        <h1 className="home-title">Hydraulics &amp; Pneumatics</h1>
        <p className="home-subtitle">FAA A&amp;P Practice Exam</p>
      </div>

      <div className="home-card">
        <span className="home-card-label">EXAM DETAILS</span>
        <div className="home-stats">
          <div className="home-stat">
            <span className="home-stat-value">{questions.length}</span>
            <span className="home-stat-label">Questions</span>
          </div>
          <div className="home-stat">
            <span className="home-stat-value">70%</span>
            <span className="home-stat-label">Passing Score</span>
          </div>
        </div>
      </div>

      <div className="home-card">
        <span className="home-card-label">SECTIONS</span>
        <span className="home-card-hint">Tap a section to practice</span>
        <div className="home-sections">
          {SECTIONS.map(s => {
            const count = questions.filter(q => q.section === s.key).length
            return (
              <button
                key={s.key}
                className="home-section-row"
                onClick={() => onStudy(s.key)}
              >
                <span className="home-section-name">{s.name}</span>
                <span className="home-section-count">{count} Q</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="home-note">
        Questions are randomized each attempt. Instant feedback after each answer. Flag questions to review later. Visual diagrams on key concepts.
      </div>

      <button className="home-start" onClick={onStart}>
        BEGIN EXAM
      </button>

      {attempts.length > 0 && (
        <button className="home-history" onClick={onHistory}>
          HISTORY
        </button>
      )}
    </div>
  )
}

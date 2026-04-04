import { SECTIONS, questions } from '../data/questions.js'
import { useHistory } from '../HistoryContext.jsx'
import './FlashcardHome.css'

function getMastered(sectionQuestions, questionStats) {
  return sectionQuestions.filter(q => {
    const s = questionStats[q.id]
    if (!s || s.timesAnswered < 4) return false
    return s.timesCorrect / s.timesAnswered >= 0.75
  }).length
}

export default function FlashcardHome({ onStart }) {
  const { questionStats } = useHistory()

  const allMastered = getMastered(questions, questionStats)
  const hasStats = Object.keys(questionStats).length > 0

  return (
    <div className="fc-home">
      <h2 className="fc-home-title">Flashcards</h2>

      <div className="fc-home-card">
        <button className="fc-home-row" onClick={() => onStart(null)}>
          <div className="fc-home-row-left">
            <span className="fc-home-row-name">All Questions</span>
            <span className="fc-home-row-count">{questions.length} cards</span>
          </div>
          {hasStats && (
            <span className="fc-home-row-mastery">{allMastered}/{questions.length} mastered</span>
          )}
        </button>

        <div className="fc-home-divider" />

        {SECTIONS.map(sec => {
          const sectionQs = questions.filter(q => q.section === sec.key)
          const mastered = getMastered(sectionQs, questionStats)
          return (
            <button key={sec.key} className="fc-home-row" onClick={() => onStart(sec.key)}>
              <div className="fc-home-row-left">
                <span className="fc-home-row-name">{sec.name}</span>
                <span className="fc-home-row-count">{sectionQs.length} cards</span>
              </div>
              {hasStats && (
                <span className="fc-home-row-mastery">{mastered}/{sectionQs.length} mastered</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

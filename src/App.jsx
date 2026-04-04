import { useState } from 'react'
import { ThemeProvider } from './ThemeContext.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import TabBar from './components/TabBar.jsx'
import HomeScreen from './components/HomeScreen.jsx'
import ExamScreen from './components/ExamScreen.jsx'
import ResultsScreen from './components/ResultsScreen.jsx'
import HistoryScreen from './components/HistoryScreen.jsx'
import { questions, SECTIONS } from './data/questions.js'
import './styles/reset.css'
import './styles/theme.css'
import './styles/global.css'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function App() {
  const [tab, setTab] = useState('exam')

  // Exam tab state
  const [screen, setScreen] = useState('home')
  const [examQuestions, setExamQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [flagged, setFlagged] = useState(new Set())
  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)
  const [reviewIndex, setReviewIndex] = useState(null)
  const [mode, setMode] = useState('exam')
  const [studySection, setStudySection] = useState(null)

  // Flashcard tab state
  const [fcScreen, setFcScreen] = useState('flashcard-home')
  const [fcQuestions, setFcQuestions] = useState([])
  const [fcSection, setFcSection] = useState(null)
  const [fcResults, setFcResults] = useState([])

  const beginSession = (questionSet, sessionMode, sectionKey = null) => {
    setExamQuestions(shuffle(questionSet))
    setAnswers({})
    setFlagged(new Set())
    setStartTime(Date.now())
    setEndTime(null)
    setReviewIndex(null)
    setMode(sessionMode)
    setStudySection(sectionKey)
    setScreen('exam')
  }

  const startExam = () => beginSession(questions, 'exam')

  const startStudy = (sectionKey) => {
    const filtered = questions.filter(q => q.section === sectionKey)
    beginSession(filtered, 'study', sectionKey)
  }

  const startWeakDrill = (weakQuestions) => {
    beginSession(weakQuestions, 'weak')
  }

  const handleAnswer = (qId, answerIndex) => {
    setAnswers(prev => ({ ...prev, [qId]: answerIndex }))
  }

  const handleToggleFlag = (qId) => {
    setFlagged(prev => {
      const next = new Set(prev)
      next.has(qId) ? next.delete(qId) : next.add(qId)
      return next
    })
  }

  const finishExam = () => {
    setEndTime(Date.now())
    setScreen('results')
  }

  const goToQuestion = (examIndex) => {
    setReviewIndex(examIndex)
    setScreen('exam')
  }

  // Flashcard handlers
  const startFlashcards = (sectionKey) => {
    const filtered = sectionKey
      ? questions.filter(q => q.section === sectionKey)
      : questions
    setFcQuestions(shuffle(filtered))
    setFcSection(sectionKey)
    setFcResults([])
    setFcScreen('flashcard-session')
  }

  const finishFlashcards = (results) => {
    setFcResults(results)
    setFcScreen('flashcard-complete')
  }

  const studyMissedCards = (missedQuestions) => {
    setFcQuestions(shuffle(missedQuestions))
    setFcSection(null)
    setFcResults([])
    setFcScreen('flashcard-session')
  }

  return (
    <ThemeProvider>
      <ThemeToggle />

      <div className="container" style={{ display: tab === 'exam' ? 'block' : 'none' }}>
        {screen === 'home' && (
          <HomeScreen
            onStart={startExam}
            onStudy={startStudy}
            onWeakDrill={startWeakDrill}
            onHistory={() => setScreen('history')}
          />
        )}
        {screen === 'exam' && (
          <ExamScreen
            questions={examQuestions}
            answers={answers}
            flagged={flagged}
            startTime={startTime}
            onAnswer={handleAnswer}
            onToggleFlag={handleToggleFlag}
            onFinish={finishExam}
            initialIndex={reviewIndex}
            mode={mode}
            studySection={studySection}
          />
        )}
        {screen === 'results' && (
          <ResultsScreen
            questions={examQuestions}
            answers={answers}
            startTime={startTime}
            endTime={endTime}
            onRetake={startExam}
            onHome={() => setScreen('home')}
            onGoToQuestion={goToQuestion}
            mode={mode}
            studySection={studySection}
          />
        )}
        {screen === 'history' && (
          <HistoryScreen onHome={() => setScreen('home')} />
        )}
      </div>

      <div className="container" style={{ display: tab === 'flashcards' ? 'block' : 'none' }}>
        {fcScreen === 'flashcard-home' && (
          <div>Flashcard home placeholder</div>
        )}
        {fcScreen === 'flashcard-session' && (
          <div>Flashcard session placeholder</div>
        )}
        {fcScreen === 'flashcard-complete' && (
          <div>Flashcard complete placeholder</div>
        )}
      </div>

      <TabBar activeTab={tab} onTabChange={setTab} />
    </ThemeProvider>
  )
}

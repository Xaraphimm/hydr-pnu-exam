import { useState } from 'react'
import { ThemeProvider } from './ThemeContext.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import HomeScreen from './components/HomeScreen.jsx'
import ExamScreen from './components/ExamScreen.jsx'
import ResultsScreen from './components/ResultsScreen.jsx'
import { questions } from './data/questions.js'
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
  const [screen, setScreen] = useState('home')
  const [examQuestions, setExamQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [flagged, setFlagged] = useState(new Set())
  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)
  const [reviewIndex, setReviewIndex] = useState(null)

  const startExam = () => {
    setExamQuestions(shuffle(questions))
    setAnswers({})
    setFlagged(new Set())
    setStartTime(Date.now())
    setEndTime(null)
    setReviewIndex(null)
    setScreen('exam')
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

  return (
    <ThemeProvider>
      <ThemeToggle />
      <div className="container">
        {screen === 'home' && <HomeScreen onStart={startExam} />}
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
          />
        )}
      </div>
    </ThemeProvider>
  )
}

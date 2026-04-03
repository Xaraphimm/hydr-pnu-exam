import { useState } from 'react'
import { ThemeProvider } from './ThemeContext.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import HomeScreen from './components/HomeScreen.jsx'
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

  const startExam = () => {
    setExamQuestions(shuffle(questions))
    setAnswers({})
    setFlagged(new Set())
    setStartTime(Date.now())
    setEndTime(null)
    setScreen('exam')
  }

  const finishExam = () => {
    setEndTime(Date.now())
    setScreen('results')
  }

  return (
    <ThemeProvider>
      <ThemeToggle />
      <div className="container">
        {screen === 'home' && <HomeScreen onStart={startExam} />}
        {screen === 'exam' && <div>Exam screen placeholder</div>}
        {screen === 'results' && <div>Results screen placeholder</div>}
      </div>
    </ThemeProvider>
  )
}

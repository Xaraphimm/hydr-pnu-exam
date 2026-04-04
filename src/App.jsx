import { useState } from 'react'
import { ThemeProvider } from './ThemeContext.jsx'
import { useHistory } from './HistoryContext.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import TabBar from './components/TabBar.jsx'
import TopicListScreen from './components/TopicListScreen.jsx'
import SubtopicScreen from './components/SubtopicScreen.jsx'
import ExamScreen from './components/ExamScreen.jsx'
import ResultsScreen from './components/ResultsScreen.jsx'
import HistoryScreen from './components/HistoryScreen.jsx'
import FlashcardSession from './components/FlashcardSession.jsx'
import FlashcardComplete from './components/FlashcardComplete.jsx'
import SearchScreen from './components/SearchScreen.jsx'
import BookmarksScreen from './components/BookmarksScreen.jsx'
import ProgressScreen from './components/ProgressScreen.jsx'
import MockExamScreen from './components/MockExamScreen.jsx'
import { loadQuestions } from './data/index.js'
import { shuffle } from './utils/shuffle.js'
import './styles/reset.css'
import './styles/theme.css'
import './styles/global.css'

export default function App() {
  const { confidence } = useHistory()

  // Navigation
  const [tab, setTab] = useState('home')
  const [screen, setScreen] = useState('topic-list')
  const [activeTopicId, setActiveTopicId] = useState(null)
  const [topicQuestions, setTopicQuestions] = useState([])

  // Session state (reused for test/flashcard sessions)
  const [examQuestions, setExamQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [flagged, setFlagged] = useState(new Set())
  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)
  const [reviewIndex, setReviewIndex] = useState(null)
  const [mode, setMode] = useState('all')

  // Flashcard state
  const [fcQuestions, setFcQuestions] = useState([])
  const [fcResults, setFcResults] = useState([])

  // --- Navigation functions ---

  const selectTopic = async (topicId) => {
    setActiveTopicId(topicId)
    const qs = await loadQuestions(topicId)
    setTopicQuestions(qs)
    setScreen('subtopic')
  }

  const startTest = (testMode) => {
    let qs
    if (testMode === 'weak') {
      qs = topicQuestions.filter((q) => {
        const c = confidence[q.id]
        return c && c.attempts > 0 && c.level <= 2
      })
      if (qs.length < 20) {
        const remaining = topicQuestions
          .filter((q) => !qs.some((w) => w.id === q.id))
          .sort((a, b) => {
            const ca = confidence[a.id]?.attempts || 0
            const cb = confidence[b.id]?.attempts || 0
            return ca - cb
          })
        qs = [...qs, ...remaining.slice(0, 20 - qs.length)]
      }
    } else {
      qs = topicQuestions
    }
    setExamQuestions(shuffle(qs))
    setAnswers({})
    setFlagged(new Set())
    setStartTime(Date.now())
    setEndTime(null)
    setReviewIndex(null)
    setMode(testMode)
    setScreen('test')
  }

  const startMockExam = () => {
    setExamQuestions(shuffle([...topicQuestions]))
    setAnswers({})
    setStartTime(Date.now())
    setEndTime(null)
    setMode('mock')
    setScreen('mock')
  }

  const startFlashcards = () => {
    setFcQuestions(shuffle([...topicQuestions]))
    setFcResults([])
    setScreen('flashcards')
  }

  const finishExam = () => {
    setEndTime(Date.now())
    setScreen('results')
  }

  const studyMissedCards = (missed) => {
    setFcQuestions(shuffle(missed.map((r) => r.question)))
    setFcResults([])
    setScreen('flashcards')
  }

  const goToSubtopic = () => {
    setScreen('subtopic')
  }

  const goToTopicList = () => {
    setScreen('topic-list')
    setActiveTopicId(null)
  }

  const handleTabChange = (newTab) => {
    setTab(newTab)
    if (newTab === 'home') {
      setScreen('topic-list')
      setActiveTopicId(null)
    }
  }

  return (
    <ThemeProvider>
      <div className="app">
        <ThemeToggle />

        {tab === 'home' && screen === 'topic-list' && (
          <TopicListScreen onSelectTopic={selectTopic} />
        )}

        {tab === 'home' && screen === 'subtopic' && (
          <SubtopicScreen
            topicId={activeTopicId}
            onBack={goToTopicList}
            onStartStudy={() => setScreen('study')}
            onStartFlashcards={startFlashcards}
            onStartTest={startTest}
            onStartMockExam={startMockExam}
            onViewHistory={() => setScreen('history')}
          />
        )}

        {tab === 'home' && screen === 'test' && (
          <ExamScreen
            questions={examQuestions}
            answers={answers}
            flagged={flagged}
            startTime={startTime}
            onAnswer={(qId, idx) => setAnswers((prev) => ({ ...prev, [qId]: idx }))}
            onToggleFlag={(qId) =>
              setFlagged((prev) => {
                const s = new Set(prev)
                s.has(qId) ? s.delete(qId) : s.add(qId)
                return s
              })
            }
            onFinish={finishExam}
            initialIndex={reviewIndex}
            mode={mode}
            topicId={activeTopicId}
          />
        )}

        {tab === 'home' && screen === 'mock' && (
          <MockExamScreen
            questions={examQuestions}
            topicId={activeTopicId}
            onFinish={(mockAnswers) => {
              setAnswers(mockAnswers)
              setEndTime(Date.now())
              setScreen('results')
            }}
          />
        )}

        {tab === 'home' && screen === 'results' && (
          <ResultsScreen
            questions={examQuestions}
            answers={answers}
            startTime={startTime}
            endTime={endTime}
            topicId={activeTopicId}
            mode={mode}
            onRetake={() => startTest(mode)}
            onHome={goToSubtopic}
            onGoToQuestion={(idx) => {
              setReviewIndex(idx)
              setScreen('test')
            }}
          />
        )}

        {tab === 'home' && screen === 'flashcards' && (
          <FlashcardSession
            questions={fcQuestions}
            topicId={activeTopicId}
            onFinish={(results) => {
              setFcResults(results)
              setScreen('flashcard-complete')
            }}
            onBack={goToSubtopic}
          />
        )}

        {tab === 'home' && screen === 'flashcard-complete' && (
          <FlashcardComplete
            results={fcResults}
            onStudyMissed={() => studyMissedCards(fcResults.filter((r) => !r.gotIt))}
            onDone={goToSubtopic}
          />
        )}

        {tab === 'home' && screen === 'history' && (
          <HistoryScreen
            topicId={activeTopicId}
            onHome={goToSubtopic}
          />
        )}

        {tab === 'home' && screen === 'study' && (
          <div style={{ padding: 20 }}>
            <button onClick={goToSubtopic}>&larr; Back</button>
            <h2>Study Mode</h2>
            <p>PDF viewer coming in Task 20</p>
          </div>
        )}

        {tab === 'search' && <SearchScreen />}
        {tab === 'bookmarks' && <BookmarksScreen />}
        {tab === 'progress' && <ProgressScreen />}

        <TabBar activeTab={tab} onTabChange={handleTabChange} />
      </div>
    </ThemeProvider>
  )
}

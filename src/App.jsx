import { useState } from 'react'
import { ThemeProvider } from './ThemeContext.jsx'
import { useHistory } from './HistoryContext.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import TabBar from './components/TabBar.jsx'
import TopicListScreen from './components/TopicListScreen.jsx'
import SubtopicScreen from './components/SubtopicScreen.jsx'
import ExamScreen from './components/ExamScreen.jsx'
import AcsPracticeScreen from './components/AcsPracticeScreen.jsx'
import ResultsScreen from './components/ResultsScreen.jsx'
import HistoryScreen from './components/HistoryScreen.jsx'
import FlashcardSession from './components/FlashcardSession.jsx'
import FlashcardComplete from './components/FlashcardComplete.jsx'
import SearchScreen from './components/SearchScreen.jsx'
import BookmarksScreen from './components/BookmarksScreen.jsx'
import ProgressScreen from './components/ProgressScreen.jsx'
import MockExamScreen from './components/MockExamScreen.jsx'
import PdfViewer from './components/PdfViewer.jsx'
import ExamSelectionScreen from './components/ExamSelectionScreen.jsx'
import ExamResultsScreen from './components/ExamResultsScreen.jsx'
import { generateExam, seededShuffle } from './utils/exam-generator.js'
import { buildAcsTargetedExam } from './utils/acs-filter.js'
import { loadQuestions, TOPICS, CATEGORIES } from './data/index.js'
import { shuffle } from './utils/shuffle.js'
import { buildCategoryStudyQuestions } from './utils/study-session.js'
import './styles/reset.css'
import './styles/theme.css'
import './styles/global.css'
import './styles/index.css'

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

  const [examVersion, setExamVersion] = useState(null)
  const [examSeed, setExamSeed] = useState(null)
  const [examMode, setExamMode] = useState(null)
  const [acsQuestionsByTopic, setAcsQuestionsByTopic] = useState(null)
  const [acsSession, setAcsSession] = useState(null)

  // Flashcard state
  const [fcQuestions, setFcQuestions] = useState([])
  const [fcResults, setFcResults] = useState([])

  // --- Navigation functions ---

  const openExamSelection = (scopeTopicId) => {
    setActiveTopicId(scopeTopicId)
    setScreen('exam-select')
  }

  const loadAcsQuestionPools = async () => {
    const questionsByTopic = {}
    for (const tid of CATEGORIES.airframe.topics) {
      const topicQs = await loadQuestions(tid)
      if (topicQs.length > 0) questionsByTopic[tid] = topicQs
    }
    setAcsQuestionsByTopic(questionsByTopic)
    return questionsByTopic
  }

  const openAcsPractice = async () => {
    setActiveTopicId('airframe')
    setScreen('acs-practice')
    if (!acsQuestionsByTopic) {
      await loadAcsQuestionPools()
    }
  }

  const startReadinessStudy = async () => {
    const qs = await buildCategoryStudyQuestions({
      topicIds: CATEGORIES.airframe.topics,
      loadQuestions,
    })

    setExamQuestions(qs)
    setAnswers({})
    setFlagged(new Set())
    setStartTime(Date.now())
    setEndTime(null)
    setReviewIndex(null)
    setActiveTopicId('airframe')
    setMode('all')
    setExamMode('study')
    setExamVersion('readiness')
    setExamSeed(null)
    setAcsSession(null)
    setScreen('test')
  }

  const handleExamSelect = async ({ mode, version, seed, topicId: scopeId, isFullCategory }) => {
    setExamMode(mode)
    setExamVersion(version)
    setExamSeed(seed)
    setAcsSession(null)

    let qs
    if (isFullCategory) {
      const questionsByTopic = {}
      for (const tid of CATEGORIES.airframe.topics) {
        const topicQs = await loadQuestions(tid)
        if (topicQs.length > 0) questionsByTopic[tid] = topicQs
      }
      qs = generateExam(seed, questionsByTopic, 100)
    } else {
      const topicQs = await loadQuestions(scopeId)
      qs = seededShuffle(topicQs, seed)
    }

    setExamQuestions(qs)
    setAnswers({})
    setFlagged(new Set())
    setStartTime(Date.now())
    setEndTime(null)
    setReviewIndex(null)
    setActiveTopicId(isFullCategory ? 'airframe' : scopeId)

    if (mode === 'study') {
      setMode('all')
      setScreen('test')
    } else {
      setMode('mock')
      setScreen('mock')
    }
  }

  const handleAcsPracticeStart = async ({ input, seed = Date.now() }) => {
    const questionsByTopic = acsQuestionsByTopic ?? (await loadAcsQuestionPools())
    const session = buildAcsTargetedExam({
      questionsByTopic,
      input,
      seed,
      maxQuestions: CATEGORIES.airframe.examQuestions,
    })

    if (session.questions.length === 0) return

    setAcsSession({ ...session, input, seed })
    setExamQuestions(session.questions)
    setAnswers({})
    setFlagged(new Set())
    setStartTime(Date.now())
    setEndTime(null)
    setReviewIndex(null)
    setActiveTopicId('airframe')
    setMode('acs')
    setExamMode('acs')
    setExamVersion('acs-targeted')
    setExamSeed(seed)
    setScreen('test')
  }

  const handleStudyMissedFromResults = (missedQuestions) => {
    setFcQuestions(shuffle(missedQuestions))
    setFcResults([])
    setScreen('flashcards')
  }

  const handleRetakeFromResults = () => {
    if (examMode === 'acs' && acsSession) {
      handleAcsPracticeStart({
        input: acsSession.input,
        seed: Date.now(),
      })
      return
    }

    handleExamSelect({
      mode: examMode,
      version: examVersion,
      seed: examVersion === 'random' ? Date.now() : examSeed,
      topicId: activeTopicId,
      isFullCategory: activeTopicId === 'airframe',
    })
  }

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
    setScreen('exam-results')
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
          <TopicListScreen
            onSelectTopic={selectTopic}
            onStartExam={openExamSelection}
            onStartAcsPractice={openAcsPractice}
            onStartReadinessStudy={startReadinessStudy}
          />
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
            onOpenExamSelect={() => openExamSelection(activeTopicId)}
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
            sessionLabel={
              mode === 'acs' && acsSession
                ? `ACS Targeted: ${acsSession.codes.join(', ')}`
                : null
            }
          />
        )}

        {tab === 'home' && screen === 'mock' && (
          <MockExamScreen
            questions={examQuestions}
            topicId={activeTopicId}
            onFinish={(mockAnswers) => {
              setAnswers(mockAnswers)
              setEndTime(Date.now())
              setScreen('exam-results')
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
          <PdfViewer
            topicId={activeTopicId}
            pdfFile={TOPICS[activeTopicId]?.pdfFile}
            onBack={goToSubtopic}
          />
        )}

        {tab === 'home' && screen === 'acs-practice' && (
          <AcsPracticeScreen
            questionsByTopic={acsQuestionsByTopic ?? {}}
            maxQuestions={CATEGORIES.airframe.examQuestions}
            isLoading={!acsQuestionsByTopic}
            onBack={goToTopicList}
            onStart={handleAcsPracticeStart}
          />
        )}

        {tab === 'home' && screen === 'exam-select' && (
          <ExamSelectionScreen
            topicId={activeTopicId}
            onSelectExam={handleExamSelect}
            onBack={() => activeTopicId === 'airframe' ? goToTopicList() : goToSubtopic()}
          />
        )}

        {tab === 'home' && screen === 'exam-results' && (
          <ExamResultsScreen
            questions={examQuestions}
            answers={answers}
            flagged={flagged}
            startTime={startTime}
            endTime={endTime}
            topicId={activeTopicId}
            mode={examMode}
            version={examVersion}
            seed={examSeed}
            context={
              examMode === 'acs' && acsSession
                ? {
                    type: 'acs',
                    codes: acsSession.codes,
                    totalMatches: acsSession.totalMatches,
                    isCapped: acsSession.isCapped,
                  }
                : null
            }
            onRetake={handleRetakeFromResults}
            onStudyMissed={handleStudyMissedFromResults}
            onHome={activeTopicId === 'airframe' ? goToTopicList : goToSubtopic}
          />
        )}

        {tab === 'search' && <SearchScreen />}
        {tab === 'bookmarks' && <BookmarksScreen />}
        {tab === 'progress' && <ProgressScreen />}

        <TabBar activeTab={tab} onTabChange={handleTabChange} />
      </div>
    </ThemeProvider>
  )
}

import { useEffect, useState } from 'react'
import { ThemeProvider } from '../ThemeContext.jsx'
import { HistoryProvider } from '../HistoryContext.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'
import TabBar from '../components/TabBar.jsx'
import TopicListScreen from '../components/TopicListScreen.jsx'
import SubtopicScreen from '../components/SubtopicScreen.jsx'
import ExamScreen from '../components/ExamScreen.jsx'
import MockExamScreen from '../components/MockExamScreen.jsx'
import ResultsScreen from '../components/ResultsScreen.jsx'
import ExamResultsScreen from '../components/ExamResultsScreen.jsx'
import FlashcardSession from '../components/FlashcardSession.jsx'
import FlashcardComplete from '../components/FlashcardComplete.jsx'
import SearchScreen from '../components/SearchScreen.jsx'
import BookmarksScreen from '../components/BookmarksScreen.jsx'
import ProgressScreen from '../components/ProgressScreen.jsx'
import HistoryScreen from '../components/HistoryScreen.jsx'
import ExamSelectionScreen from '../components/ExamSelectionScreen.jsx'
import AcsPracticeScreen from '../components/AcsPracticeScreen.jsx'
import { loadQuestions } from '../data/index.js'
import { makeQuestions } from './fixtures.js'

const noop = () => {}
const questions = makeQuestions(6)
const answers = { [questions[0].id]: 0, [questions[1].id]: 1, [questions[2].id]: 0 }
const flagged = new Set([questions[3].id])
const startTime = Date.now() - 25 * 60 * 1000
const endTime = Date.now()

const fcResults = questions.map((q, i) => ({ question: q, gotIt: i % 3 !== 0 }))

function GalleryInner({ screen }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    loadQuestions('AF-01').then(() => setReady(true))
  }, [])

  switch (screen) {
    case 'topic-list':
      return (
        <TopicListScreen
          onSelectTopic={noop}
          onStartExam={noop}
          onStartAcsPractice={noop}
          onStartReadinessStudy={noop}
        />
      )
    case 'subtopic':
      if (!ready) return null
      return (
        <SubtopicScreen
          topicId="AF-01"
          onBack={noop}
          onStartStudy={noop}
          onStartFlashcards={noop}
          onStartTest={noop}
          onStartMockExam={noop}
          onViewHistory={noop}
          onOpenExamSelect={noop}
        />
      )
    case 'exam-select':
      return <ExamSelectionScreen topicId="airframe" onSelectExam={noop} onBack={noop} />
    case 'acs-practice':
      return (
        <AcsPracticeScreen
          questionsByTopic={{}}
          maxQuestions={100}
          isLoading={false}
          onBack={noop}
          onStart={noop}
        />
      )
    case 'test':
      return (
        <ExamScreen
          questions={questions}
          answers={answers}
          flagged={flagged}
          startTime={startTime}
          onAnswer={noop}
          onToggleFlag={noop}
          onFinish={noop}
          mode="all"
          topicId="AF-01"
        />
      )
    case 'mock':
      return <MockExamScreen questions={questions} topicId="AF-01" onFinish={noop} />
    case 'results':
      return (
        <ResultsScreen
          questions={questions}
          answers={answers}
          startTime={startTime}
          endTime={endTime}
          mode="all"
          topicId="AF-01"
          onRetake={noop}
          onHome={noop}
          onGoToQuestion={noop}
        />
      )
    case 'exam-results':
      return (
        <ExamResultsScreen
          questions={questions}
          answers={answers}
          flagged={flagged}
          startTime={startTime}
          endTime={endTime}
          topicId="airframe"
          mode="test"
          version={2}
          seed={2}
          context={null}
          onRetake={noop}
          onStudyMissed={noop}
          onHome={noop}
        />
      )
    case 'flashcards':
      return <FlashcardSession questions={questions} topicId="AF-01" onFinish={noop} onBack={noop} />
    case 'flashcard-complete':
      return <FlashcardComplete results={fcResults} onStudyMissed={noop} onDone={noop} />
    case 'history':
      return <HistoryScreen topicId="airframe" onHome={noop} />
    case 'progress':
      return <ProgressScreen />
    case 'search':
      return <SearchScreen />
    case 'bookmarks':
      return <BookmarksScreen />
    default:
      return <TopicListScreen onSelectTopic={noop} onStartExam={noop} onStartAcsPractice={noop} onStartReadinessStudy={noop} />
  }
}

export default function Gallery({ screen }) {
  const showChrome = ['topic-list', 'search', 'bookmarks', 'progress'].includes(screen)
  return (
    <ThemeProvider>
      <HistoryProvider>
        <div className="min-h-dvh bg-background text-foreground">
          {showChrome && <ThemeToggle />}
          <GalleryInner screen={screen} />
          {showChrome && <TabBar activeTab={screen === 'topic-list' ? 'home' : screen} onTabChange={noop} />}
        </div>
      </HistoryProvider>
    </ThemeProvider>
  )
}

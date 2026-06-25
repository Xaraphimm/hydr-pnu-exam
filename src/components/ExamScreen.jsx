import { useState, useEffect, useRef } from 'react'
import { Bookmark, BookmarkCheck, Flag, ArrowLeft, ArrowRight } from 'lucide-react'
import { TOPICS } from '../data/index.js'
import { useHistory } from '../HistoryContext.jsx'
import diagrams from '../diagrams/index.js'
import QuestionNav from './QuestionNav.jsx'
import { Screen } from './Screen.jsx'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function ExamScreen({
  questions,
  answers,
  flagged,
  startTime,
  onAnswer,
  onToggleFlag,
  onFinish,
  initialIndex,
  mode,
  topicId,
  sessionLabel,
}) {
  const { recordAnswer, toggleQuestionBookmark, isQuestionBookmarked } = useHistory()
  const [currentIndex, setCurrentIndex] = useState(initialIndex ?? 0)
  const [elapsed, setElapsed] = useState(0)
  const topRef = useRef(null)

  const q = questions[currentIndex]

  const score = questions.reduce((acc, question) => acc + (answers[question.id] === question.c ? 1 : 0), 0)
  const topicName = TOPICS[topicId]?.name || (topicId === 'airframe' ? 'Airframe' : '')
  const headerLabel = sessionLabel || `${topicName}${mode === 'weak' ? ' — WEAK AREAS' : ''}`

  const getQuestionTopic = (question) => {
    const prefix = question.id.split('-')[0];
    const topicKey = prefix.replace(/([A-Z]+)(\d+)/, '$1-$2');
    return TOPICS[topicKey]?.name || '';
  };

  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000)
    return () => clearInterval(t)
  }, [startTime])

  if (!q) {
    return (
      <Screen>
        <Card className="items-center gap-3 p-8 text-center">
          <h1 className="text-lg font-semibold">No questions available</h1>
          <p className="text-sm text-muted-foreground">
            This practice session could not be started because no matching questions were found.
          </p>
          <Button onClick={onFinish}>Return to Results</Button>
        </Card>
      </Screen>
    )
  }

  const DiagramComponent = q.diagram ? diagrams[q.diagram] : null
  const showFeedback = answers[q.id] !== undefined

  const formatTime = (s) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0')
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${h}:${m}:${sec}`
  }

  const selectAnswer = (answerIndex) => {
    if (answers[q.id] !== undefined) return
    onAnswer(q.id, answerIndex)
    recordAnswer(q.id, answerIndex === q.c)
  }

  const goTo = (idx) => {
    setCurrentIndex(idx)
    topRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const next = () => {
    if (currentIndex < questions.length - 1) {
      goTo(currentIndex + 1)
    } else {
      onFinish()
    }
  }

  const prev = () => {
    if (currentIndex > 0) goTo(currentIndex - 1)
  }

  const bookmarked = isQuestionBookmarked(q.id)
  const isFlagged = flagged.has(q.id)

  return (
    <Screen>
      <div ref={topRef} className="scroll-mt-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <Badge variant="secondary" className="max-w-full truncate">{headerLabel}</Badge>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground tabular-nums">Q {currentIndex + 1} / {questions.length}</span>
            <span className="font-medium text-success tabular-nums">{score} correct</span>
          </div>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-sm text-muted-foreground tabular-nums">{formatTime(elapsed)}</span>
        </div>

        <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        <Card className="gap-4 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-xs font-medium text-muted-foreground">{getQuestionTopic(q)}</span>
              <span className="font-mono text-xs text-muted-foreground">#{q.id}</span>
            </span>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleQuestionBookmark(q.id)}
                aria-label="Bookmark"
                className={cn(bookmarked && 'text-primary')}
              >
                {bookmarked ? <BookmarkCheck className="size-5" /> : <Bookmark className="size-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleFlag(q.id)}
                aria-label="Flag for review"
                className={cn(isFlagged && 'text-primary')}
              >
                <Flag className={cn('size-5', isFlagged && 'fill-primary')} />
              </Button>
            </div>
          </div>

          <p className="text-base leading-relaxed font-medium">{q.q}</p>

          {DiagramComponent && (
            <div className="overflow-x-auto rounded-lg border bg-muted/40 p-3">
              <DiagramComponent />
            </div>
          )}

          <div className="grid gap-2.5">
            {q.a.map((opt, i) => {
              const isSelected = answers[q.id] === i
              const isCorrect = i === q.c
              const showResult = showFeedback && answers[q.id] !== undefined

              return (
                <button
                  key={i}
                  onClick={() => selectAnswer(i)}
                  disabled={showResult}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg border bg-card p-3 text-left transition-colors',
                    !showResult && 'cursor-pointer hover:bg-accent/50',
                    showResult && isCorrect && 'border-success bg-success/10',
                    showResult && isSelected && !isCorrect && 'border-destructive bg-destructive/10',
                    !showResult && isSelected && 'border-primary bg-primary/10',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-md border text-sm font-semibold',
                      showResult && isCorrect && 'border-success bg-success text-success-foreground',
                      showResult && isSelected && !isCorrect && 'border-destructive bg-destructive text-destructive-foreground',
                    )}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm">{opt}</span>
                </button>
              )
            })}
          </div>

          {showFeedback && answers[q.id] !== undefined && (
            <div className="rounded-lg border bg-muted/40 p-4">
              <div className="mb-1.5 text-xs font-semibold tracking-wider text-muted-foreground">EXPLANATION</div>
              <div className="text-sm leading-relaxed">{q.exp}</div>
              {(q.ref || q.acs) && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">References:</span>
                  {q.acs && <Badge variant="outline" className="font-mono">{q.acs}</Badge>}
                  {q.ref && <Badge variant="outline" className="font-mono">{q.ref}</Badge>}
                </div>
              )}
            </div>
          )}
        </Card>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={prev} disabled={currentIndex === 0}>
            <ArrowLeft /> Prev
          </Button>
          <Button onClick={next} variant={showFeedback ? 'default' : 'secondary'}>
            {currentIndex === questions.length - 1 ? 'Finish' : 'Next'} <ArrowRight />
          </Button>
        </div>

        <QuestionNav questions={questions} answers={answers} currentIndex={currentIndex} flagged={flagged} onGoTo={goTo} />

        <Button variant="ghost" className="mt-4 w-full text-muted-foreground" onClick={onFinish}>
          End &amp; View Results
        </Button>
      </div>
    </Screen>
  )
}

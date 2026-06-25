import { useState, useEffect, useRef, useCallback } from 'react'
import { Flag, ArrowLeft, ArrowRight } from 'lucide-react'
import { TOPICS } from '../data/index.js'
import diagrams from '../diagrams/index.js'
import { Screen } from './Screen.jsx'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function MockExamScreen({ questions, topicId, onFinish }) {
  const totalSeconds = Math.round((questions.length / 100) * 120 * 60)
  const [remaining, setRemaining] = useState(totalSeconds)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [flagged, setFlagged] = useState(new Set())
  const topRef = useRef(null)
  const timerRef = useRef(null)

  const toggleFlag = (qId) => {
    setFlagged((prev) => {
      const s = new Set(prev)
      s.has(qId) ? s.delete(qId) : s.add(qId)
      return s
    })
  }

  const topicName = TOPICS[topicId]?.name

  const finish = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    onFinish(answers)
  }, [answers, onFinish])

  const handleFinish = () => {
    const unanswered = questions.length - Object.keys(answers).length
    if (unanswered > 0) {
      const confirmed = window.confirm(
        `Are you sure? You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}.`
      )
      if (!confirmed) return
    }
    finish()
  }

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    if (remaining === 0) {
      onFinish(answers)
    }
  }, [remaining]) // eslint-disable-line react-hooks/exhaustive-deps

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }

  const selectAnswer = (answerIndex) => {
    if (answers[questions[currentIndex].id] !== undefined) return
    const q = questions[currentIndex]
    const updated = { ...answers, [q.id]: answerIndex }
    setAnswers(updated)

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      topRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const q = questions[currentIndex]
  if (!q) {
    return (
      <Screen>
        <Card className="items-center gap-3 p-8 text-center">
          <h1 className="text-lg font-semibold">No questions available</h1>
          <p className="text-sm text-muted-foreground">
            This timed exam could not be started because no questions were loaded.
          </p>
          <Button onClick={() => onFinish({})}>Return</Button>
        </Card>
      </Screen>
    )
  }

  const DiagramComponent = q.diagram ? diagrams[q.diagram] : null
  const answeredCount = Object.keys(answers).length
  const progressPct = (answeredCount / questions.length) * 100
  const isFlagged = flagged.has(q.id)

  return (
    <Screen>
      <div ref={topRef} className="scroll-mt-4">
        <div className="mb-3 flex items-center justify-between gap-3 text-sm">
          <span className="min-w-0 truncate font-medium">{topicName}</span>
          <span
            className={cn(
              'rounded-md px-2 py-1 font-mono font-semibold tabular-nums',
              remaining <= 60 ? 'bg-destructive/15 text-destructive' : 'bg-muted text-foreground',
            )}
          >
            {formatTime(remaining)}
          </span>
          <span className="text-muted-foreground tabular-nums">{answeredCount} / {questions.length}</span>
        </div>

        <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${progressPct}%` }} />
        </div>

        <Card className="gap-4 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-muted-foreground tabular-nums">Q {currentIndex + 1}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleFlag(q.id)}
              aria-label="Flag for review"
              className={cn(isFlagged && 'text-primary')}
            >
              <Flag className={cn('size-5', isFlagged && 'fill-primary')} />
            </Button>
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
              return (
                <button
                  key={i}
                  onClick={() => selectAnswer(i)}
                  disabled={answers[q.id] !== undefined}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg border bg-card p-3 text-left transition-colors',
                    answers[q.id] === undefined && 'cursor-pointer hover:bg-accent/50',
                    isSelected && 'border-primary bg-primary/10',
                  )}
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md border text-sm font-semibold">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm">{opt}</span>
                </button>
              )
            })}
          </div>
        </Card>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => {
              if (currentIndex > 0) {
                setCurrentIndex(currentIndex - 1)
                topRef.current?.scrollIntoView({ behavior: 'smooth' })
              }
            }}
            disabled={currentIndex === 0}
          >
            <ArrowLeft /> Prev
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              if (currentIndex < questions.length - 1) {
                setCurrentIndex(currentIndex + 1)
                topRef.current?.scrollIntoView({ behavior: 'smooth' })
              }
            }}
            disabled={currentIndex === questions.length - 1}
          >
            Next <ArrowRight />
          </Button>
        </div>

        <Button className="mt-4 w-full" onClick={handleFinish}>
          Finish Exam
        </Button>
      </div>
    </Screen>
  )
}
